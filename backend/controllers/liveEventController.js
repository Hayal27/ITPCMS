const db = require('../models/db');
const dailyService = require('../services/dailyService');

// Manual promise wrapper
const query = (sql, args) => {
    return new Promise((resolve, reject) => {
        db.query(sql, args, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

// Get the active (Live or most recent/upcoming) event
exports.getActiveEvent = async (req, res) => {
    try {
        // Find published events. Preference: Live > Upcoming > Ended
        const events = await query(`
            SELECT * FROM live_events 
            WHERE status IN ('published', 'live') 
            ORDER BY 
                CASE 
                    WHEN event_date = CURDATE() AND CURTIME() BETWEEN start_time AND end_time THEN 1
                    WHEN event_date >= CURDATE() THEN 2
                    ELSE 3
                END,
                event_date ASC, 
                start_time ASC 
            LIMIT 1
        `);

        if (!events.length) {
            return res.status(404).json({ message: 'No active live events found' });
        }

        const event = events[0];

        // Fetch agenda
        const agenda = await query('SELECT * FROM live_event_agenda WHERE event_id = ? ORDER BY time ASC', [event.id]);

        // Fetch speakers
        const speakers = await query('SELECT * FROM live_event_speakers WHERE event_id = ?', [event.id]);

        // Construct full config matching frontend LiveEventConfig
        const config = {
            id: event.id.toString(),
            title: event.title,
            subtitle: event.subtitle,
            description: event.description,
            date: event.event_date instanceof Date
                ? event.event_date.toISOString().split('T')[0]
                : (event.event_date ? event.event_date.toString().split('T')[0] : ''),
            startTime: event.start_time,
            endTime: event.end_time,
            timezone: event.timezone,
            location: event.location,
            stream: {
                platform: event.stream_platform,
                url: event.stream_url,
                poster: event.stream_poster,
                aspect: event.stream_aspect
            },
            chat: {
                enabled: !!event.chat_enabled,
                pinned: event.chat_pinned
            },
            analytics: {
                estimatedViewers: event.estimated_viewers
            },
            agenda: agenda.map(a => ({
                time: a.time.substring(0, 5), // HH:mm
                title: a.title,
                speaker: a.speaker
            })),
            speakers: speakers.map(s => ({
                name: s.name,
                role: s.role,
                photo: s.photo
            })),
            status: event.status,
            signaling_data: event.signaling_data
        };

        res.status(200).json(config);
    } catch (error) {
        console.error('Error fetching active live event:', error);
        res.status(500).json({ message: 'Error fetching active live event', error: error.message });
    }
};

// Get single event
exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const events = await query('SELECT * FROM live_events WHERE id = ?', [id]);
        if (!events.length) return res.status(404).json({ message: 'Event not found' });

        const event = events[0];
        const agenda = await query('SELECT * FROM live_event_agenda WHERE event_id = ? ORDER BY time ASC', [event.id]);
        const speakers = await query('SELECT * FROM live_event_speakers WHERE event_id = ?', [event.id]);

        res.status(200).json({
            id: event.id.toString(),
            title: event.title,
            subtitle: event.subtitle,
            description: event.description,
            date: event.event_date instanceof Date ? event.event_date.toISOString().split('T')[0] : event.event_date,
            startTime: event.start_time,
            endTime: event.end_time,
            location: event.location,
            status: event.status,
            signaling_data: event.signaling_data,
            stream: {
                platform: event.stream_platform,
                url: event.stream_url,
                poster: event.stream_poster,
                aspect: event.stream_aspect
            },
            chat: {
                enabled: !!event.chat_enabled,
                pinned: event.chat_pinned
            },
            analytics: {
                estimatedViewers: event.estimated_viewers
            },
            agenda: agenda.map(a => ({ time: a.time, title: a.title, speaker: a.speaker })),
            speakers: speakers.map(s => ({ name: s.name, role: s.role, photo: s.photo }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all events
exports.getEvents = async (req, res) => {
    try {
        const events = await query('SELECT * FROM live_events ORDER BY event_date DESC');
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching live events:', error);
        res.status(500).json({ message: 'Error fetching live events', error: error.message });
    }
};

// Create Event
exports.createEvent = async (req, res) => {
    try {
        const { title, subtitle, description, event_date, start_time, end_time, stream_url, location, status } = req.body;
        const result = await query(
            'INSERT INTO live_events (title, subtitle, description, event_date, start_time, end_time, stream_url, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, subtitle, description, event_date, start_time, end_time, stream_url, location, status || 'draft']
        );
        res.status(201).json({ message: 'Event created', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Event
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subtitle, description, event_date, start_time, end_time, stream_url, location, status, is_streaming, is_recording } = req.body;
        await query(
            'UPDATE live_events SET title = ?, subtitle = ?, description = ?, event_date = ?, start_time = ?, end_time = ?, stream_url = ?, location = ?, status = ?, is_streaming = ?, is_recording = ? WHERE id = ?',
            [title, subtitle, description, event_date, start_time, end_time, stream_url, location, status, is_streaming, is_recording, id]
        );
        res.status(200).json({ message: 'Event updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle Stream State
exports.toggleStreaming = async (req, res) => {
    try {
        const { id } = req.params;
        const { state } = req.body; // true or false
        const status = state ? 'live' : 'published';
        const actual_start = state ? 'actual_start_time = NOW(), ' : '';

        let dailyRoomUrl = null;

        // If starting broadcast, create a Daily room ONLY if API key is present
        if (state && process.env.DAILY_API_KEY) {
            try {
                const room = await dailyService.createBroadcastRoom(id);
                dailyRoomUrl = room.url;
                console.log('✅ Created Daily room:', dailyRoomUrl);
            } catch (error) {
                console.error('⚠️ Failed to create Daily room:', error.message);
            }
        }

        // Update stream_url if we created a Daily room
        if (dailyRoomUrl) {
            await query(
                `UPDATE live_events SET ${actual_start} is_streaming = ?, status = ?, stream_url = ? WHERE id = ?`,
                [state, status, dailyRoomUrl, id]
            );
        } else {
            await query(
                `UPDATE live_events SET ${actual_start} is_streaming = ?, status = ? WHERE id = ?`,
                [state, status, id]
            );
        }

        res.status(200).json({
            success: true,
            is_streaming: state,
            status,
            daily_room_url: dailyRoomUrl
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle Recording
exports.toggleRecording = async (req, res) => {
    try {
        const { id } = req.params;
        const { state } = req.body;
        await query('UPDATE live_events SET is_recording = ? WHERE id = ?', [state, id]);
        res.status(200).json({ success: true, is_recording: state });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Signaling Data
exports.updateSignaling = async (req, res) => {
    try {
        const { id } = req.params;
        const { signaling_data } = req.body;
        await query('UPDATE live_events SET signaling_data = ? WHERE id = ?', [signaling_data, id]);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM live_events WHERE id = ?', [id]);
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
