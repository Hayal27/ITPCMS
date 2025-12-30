const pool = require("../models/db.js");
const db = pool.promise();
const crypto = require("crypto");
const { sendApplicationStatusUpdate } = require("../services/mailerService");

const careerController = {
    // --- JOB MANAGEMENT ---

    // Public: Fetch published jobs
    getJobs: async (req, res) => {
        try {
            const [rows] = await db.query("SELECT * FROM jobs WHERE status = 'published' ORDER BY created_at DESC");
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Error fetching jobs", error: error.message });
        }
    },

    // Admin: Fetch all jobs
    getJobsAdmin: async (req, res) => {
        try {
            const [rows] = await db.query("SELECT * FROM jobs ORDER BY created_at DESC");
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Error fetching jobs", error: error.message });
        }
    },

    createJob: async (req, res) => {
        const { title, department, location, type, description, responsibilities, qualifications, status, start_date, deadline } = req.body;
        try {
            const [result] = await db.query(
                "INSERT INTO jobs (title, department, location, type, description, responsibilities, qualifications, status, start_date, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [title, department, location, type, description, JSON.stringify(responsibilities), JSON.stringify(qualifications), status || 'draft', start_date, deadline]
            );
            res.status(201).json({ id: result.insertId, message: "Job created successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error creating job", error: error.message });
        }
    },

    updateJob: async (req, res) => {
        const { id } = req.params;
        const { title, department, location, type, description, responsibilities, qualifications, status, start_date, deadline } = req.body;
        try {
            await db.query(
                "UPDATE jobs SET title=?, department=?, location=?, type=?, description=?, responsibilities=?, qualifications=?, status=?, start_date=?, deadline=? WHERE id=?",
                [title, department, location, type, description, JSON.stringify(responsibilities), JSON.stringify(qualifications), status, start_date, deadline, id]
            );
            res.json({ message: "Job updated successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error updating job", error: error.message });
        }
    },

    deleteJob: async (req, res) => {
        const { id } = req.params;
        try {
            await db.query("DELETE FROM jobs WHERE id = ?", [id]);
            res.json({ message: "Job deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting job", error: error.message });
        }
    },

    // --- APPLICATION MANAGEMENT ---

    applyJob: async (req, res) => {
        const { jobId, fullName, email, gender, phone, address, linkedin, portfolio, coverLetter, education, workExperience, skills } = req.body;
        const resumePath = req.file ? req.file.path : null;

        // Generate tracking code: ITPC-xxxx
        const trackingCode = `ITPC-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        try {
            const [result] = await db.query(
                "INSERT INTO applications (job_id, tracking_code, full_name, gender, email, phone, address, linkedin, portfolio, resume_path, cover_letter, education, work_experience, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [jobId, trackingCode, fullName, gender, email, phone, address, linkedin, portfolio, resumePath, coverLetter, education, workExperience, skills]
            );

            res.status(201).json({
                success: true,
                message: "Application submitted successfully",
                trackingCode
            });
        } catch (error) {
            res.status(500).json({ message: "Error submitting application", error: error.message });
        }
    },

    trackApplication: async (req, res) => {
        const { code } = req.params;
        try {
            const [rows] = await db.query(`
                SELECT a.status, a.applied_at, j.title as jobTitle 
                FROM applications a
                JOIN jobs j ON a.job_id = j.id
                WHERE a.tracking_code = ?
            `, [code]);

            if (rows.length === 0) {
                return res.status(404).json({ message: "Invalid tracking code" });
            }
            res.json(rows[0]);
        } catch (error) {
            res.status(500).json({ message: "Error tracking application", error: error.message });
        }
    },

    getApplicationsAdmin: async (req, res) => {
        try {
            const [rows] = await db.query(`
                SELECT a.*, j.title as jobTitle 
                FROM applications a
                LEFT JOIN jobs j ON a.job_id = j.id
                ORDER BY a.applied_at DESC
            `);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Error fetching applications", error: error.message });
        }
    },

    updateStatus: async (req, res) => {
        const { id } = req.params;
        const { status, adminNotes, appointmentDate, appointmentTime, appointmentLocation, appointmentDetails } = req.body;

        try {
            // Get current info for email
            const [appData] = await db.query(`
                SELECT a.email, a.full_name, a.tracking_code, j.title as jobTitle 
                FROM applications a
                LEFT JOIN jobs j ON a.job_id = j.id
                WHERE a.id = ?
            `, [id]);

            if (appData.length === 0) return res.status(404).json({ message: "Application not found" });

            await db.query(
                "UPDATE applications SET status = ?, admin_notes = ?, appointment_date = ?, appointment_time = ?, appointment_location = ?, appointment_lat = ?, appointment_lng = ?, appointment_map_link = ?, appointment_details = ? WHERE id = ?",
                [status, adminNotes, appointmentDate, appointmentTime, appointmentLocation, req.body.appointmentLat, req.body.appointmentLng, req.body.appointmentMapLink, appointmentDetails, id]
            );

            // Send Email Notification
            const { email, full_name, tracking_code, jobTitle } = appData[0];
            await sendApplicationStatusUpdate(email, full_name, jobTitle, status, tracking_code, {
                date: appointmentDate,
                time: appointmentTime,
                location: appointmentLocation,
                lat: req.body.appointmentLat,
                lng: req.body.appointmentLng,
                mapLink: req.body.appointmentMapLink,
                details: appointmentDetails
            });

            res.json({ message: "Status updated and applicant notified" });
        } catch (error) {
            console.error("Update Status Error:", error);
            res.status(500).json({ message: "Error updating status", error: error.message });
        }
    },

    bulkUpdateStatus: async (req, res) => {
        const { ids, status, adminNotes, appointmentDate, appointmentTime, appointmentLocation, appointmentLat, appointmentLng, appointmentMapLink, appointmentDetails } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "No application IDs provided" });
        }

        try {
            // 1. Update database
            await db.query(
                "UPDATE applications SET status = ?, admin_notes = ?, appointment_date = ?, appointment_time = ?, appointment_location = ?, appointment_lat = ?, appointment_lng = ?, appointment_map_link = ?, appointment_details = ? WHERE id IN (?)",
                [status, adminNotes, appointmentDate, appointmentTime, appointmentLocation, appointmentLat, appointmentLng, appointmentMapLink, appointmentDetails, ids]
            );

            // 2. Fetch data for emails
            const [apps] = await db.query(`
                SELECT a.email, a.full_name, a.tracking_code, j.title as jobTitle 
                FROM applications a
                LEFT JOIN jobs j ON a.job_id = j.id
                WHERE a.id IN (?)
            `, [ids]);

            // 3. Send emails
            await Promise.all(apps.map(app =>
                sendApplicationStatusUpdate(app.email, app.full_name, app.jobTitle, status, app.tracking_code, {
                    date: appointmentDate,
                    time: appointmentTime,
                    location: appointmentLocation,
                    lat: appointmentLat,
                    lng: appointmentLng,
                    mapLink: appointmentMapLink,
                    details: appointmentDetails
                })
            ));

            res.json({ message: `Successfully updated ${ids.length} applications and sent notifications.` });
        } catch (error) {
            console.error("Bulk Update Error:", error);
            res.status(500).json({ message: "Error in bulk update", error: error.message });
        }
    },

    checkApplicationStatus: async (req, res) => {
        const { trackingCode, email } = req.body;

        try {
            const [apps] = await db.query(`
                SELECT a.id, a.full_name, a.status, a.appointment_date, a.appointment_time, 
                       a.appointment_location, a.appointment_lat, a.appointment_lng, a.appointment_map_link, a.appointment_details,
                       j.title as jobTitle
                FROM applications a
                LEFT JOIN jobs j ON a.job_id = j.id
                WHERE a.tracking_code = ? AND a.email = ?
            `, [trackingCode, email]);

            if (apps.length === 0) {
                return res.status(404).json({ message: "Application not found. Please check your tracking code and email." });
            }

            res.json(apps[0]);
        } catch (error) {
            console.error("Check Status Error:", error);
            res.status(500).json({ message: "Error checking status", error: error.message });
        }
    }
};

module.exports = careerController;
