const db = require('../models/db');
const dailyService = require('../services/dailyService');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const validator = require('validator');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Security Utility: Strip ALL HTML tags
const cleanString = (val) => {
    if (typeof val !== 'string') return val;
    return DOMPurify.sanitize(val, { ALLOWED_TAGS: [] }).trim();
};

// Production-Safe Error Handler
const sendError = (res, error, status = 500) => {
    console.error(`[LIVE EVENT SECURITY] Error:`, error);
    res.status(status).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'A secure processing error occurred. Detailed logs are available to admins.'
            : error.message
    });
};

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
            return res.status(404).json({ success: false, message: 'No active live events found' });
        }

        const event = events[0];
        const agenda = await query('SELECT * FROM live_event_agenda WHERE event_id = ? ORDER BY time ASC', [event.id]);
        const speakers = await query('SELECT * FROM live_event_speakers WHERE event_id = ?', [event.id]);

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
                time: a.time.substring(0, 5),
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
        sendError(res, error);
    }
};

// Get single event
exports.getEventById = async (req, res) => {
    try {
        const idNum = parseInt(req.params.id, 10);
        if (isNaN(idNum)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        const events = await query('SELECT * FROM live_events WHERE id = ?', [idNum]);
        if (!events.length) return res.status(404).json({ success: false, message: 'Event not found' });

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
        sendError(res, error);
    }
};

// Get all events
exports.getEvents = async (req, res) => {
    try {
        const events = await query('SELECT * FROM live_events ORDER BY event_date DESC');
        res.status(200).json(events);
    } catch (error) {
        sendError(res, error);
    }
};

// Create Event
exports.createEvent = async (req, res) => {
    try {
        let { title, subtitle, description, event_date, start_time, end_time, stream_url, location, status } = req.body;

        if (!title || validator.isEmpty(title)) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        title = cleanString(title);
        subtitle = cleanString(subtitle || '');
        description = cleanString(description || '');
        location = cleanString(location || '');
        stream_url = cleanString(stream_url || '');

        const result = await query(
            'INSERT INTO live_events (title, subtitle, description, event_date, start_time, end_time, stream_url, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, subtitle, description, event_date, start_time, end_time, stream_url, location, status || 'draft']
        );
        res.status(201).json({ success: true, message: 'Event created', id: result.insertId });
    } catch (error) {
        sendError(res, error);
    }
};

// Update Event
exports.updateEvent = async (req, res) => {
    try {
        const idNum = parseInt(req.params.id, 10);
        if (isNaN(idNum)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        let { title, subtitle, description, event_date, start_time, end_time, stream_url, location, status, is_streaming, is_recording } = req.body;

        title = cleanString(title || '');
        subtitle = cleanString(subtitle || '');
        description = cleanString(description || '');
        location = cleanString(location || '');
        stream_url = cleanString(stream_url || '');

        await query(
            'UPDATE live_events SET title = ?, subtitle = ?, description = ?, event_date = ?, start_time = ?, end_time = ?, stream_url = ?, location = ?, status = ?, is_streaming = ?, is_recording = ? WHERE id = ?',
            [title, subtitle, description, event_date, start_time, end_time, stream_url, location, status, is_streaming ? 1 : 0, is_recording ? 1 : 0, idNum]
        );
        res.status(200).json({ success: true, message: 'Event updated successfully' });
    } catch (error) {
        sendError(res, error);
    }
};

// Toggle Stream State
exports.toggleStreaming = async (req, res) => {
    try {
        const idNum = parseInt(req.params.id, 10);
        if (isNaN(idNum)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        const { state } = req.body;
        const status = state ? 'live' : 'published';

        let dailyRoomUrl = null;

        if (state && process.env.DAILY_API_KEY) {
            try {
                const room = await dailyService.createBroadcastRoom(idNum);
                dailyRoomUrl = room.url;
            } catch (error) {
                console.error('Failed to create Daily room:', error.message);
            }
        }

        // Use strict parameterized logic to avoid string concatenation in SQL
        if (state) {
            await query(
                `UPDATE live_events SET actual_start_time = NOW(), is_streaming = ?, status = ?, stream_url = ? WHERE id = ?`,
                [1, status, dailyRoomUrl || req.body.stream_url || '', idNum]
            );
        } else {
            await query(
                `UPDATE live_events SET is_streaming = ?, status = ? WHERE id = ?`,
                [0, status, idNum]
            );
        }

        res.status(200).json({
            success: true,
            is_streaming: state,
            status,
            daily_room_url: dailyRoomUrl
        });
    } catch (error) {
        sendError(res, error);
    }
};

// Toggle Recording
exports.toggleRecording = async (req, res) => {
    try {
        const idNum = parseInt(req.params.id, 10);
        if (isNaN(idNum)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        const { state } = req.body;
        await query('UPDATE live_events SET is_recording = ? WHERE id = ?', [state ? 1 : 0, idNum]);
        res.status(200).json({ success: true, is_recording: !!state });
    } catch (error) {
        sendError(res, error);
    }
};

// Update Signaling Data
exports.updateSignaling = async (req, res) => {
    try {
        const idNum = parseInt(req.params.id, 10);
        if (isNaN(idNum)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        const { signaling_data } = req.body;
        await query('UPDATE live_events SET signaling_data = ? WHERE id = ?', [JSON.stringify(signaling_data), idNum]);
        res.status(200).json({ success: true });
    } catch (error) {
        sendError(res, error);
    }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
    try {
        const idNum = parseInt(req.params.id, 10);
        if (isNaN(idNum)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        await query('DELETE FROM live_events WHERE id = ?', [idNum]);
        res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        sendError(res, error);
    }
};
