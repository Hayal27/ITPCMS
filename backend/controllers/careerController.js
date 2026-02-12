const pool = require("../models/db.js");
const db = pool.promise();
const crypto = require("crypto");
const { sendApplicationStatusUpdate, sendApplicationConfirmationEmail } = require("../services/mailerService");

// Production-Safe Error Handler
const sendError = (res, error, status = 500) => {
    console.error(`[CAREER SECURITY] Error:`, error);
    res.status(status).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'A secure processing error occurred. Detailed logs are available to admins.'
            : error.message
    });
};

const careerController = {
    // --- JOB MANAGEMENT ---

    // Public: Fetch published jobs
    getJobs: async (req, res) => {
        try {
            const [rows] = await db.query("SELECT * FROM jobs WHERE status = 'published' ORDER BY created_at DESC");
            res.json(rows);
        } catch (error) {
            sendError(res, error);
        }
    },

    // Admin: Fetch all jobs
    getJobsAdmin: async (req, res) => {
        try {
            const [rows] = await db.query("SELECT * FROM jobs ORDER BY created_at DESC");
            res.json(rows);
        } catch (error) {
            sendError(res, error);
        }
    },

    createJob: async (req, res) => {
        const { title, department, location, type, description, responsibilities, qualifications, status, start_date, deadline } = req.body;
        try {
            const [result] = await db.query(
                "INSERT INTO jobs (title, department, location, type, description, responsibilities, qualifications, status, start_date, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [title, department, location, type, description, JSON.stringify(responsibilities), JSON.stringify(qualifications), status || 'draft', start_date, deadline]
            );

            // Notify Subscribers if published
            if (status === 'published') {
                const subscriptionController = require('./subscriptionController');
                subscriptionController.notifySubscribers('job', {
                    id: result.insertId,
                    title,
                    start_date,
                    description
                }).catch(err => console.error('Notification Error:', err));
            }

            res.status(201).json({ id: result.insertId, message: "Job created successfully" });
        } catch (error) {
            sendError(res, error);
        }
    },

    updateJob: async (req, res) => {
        const idNum = parseInt(req.params.id, 10);
        if (isNaN(idNum)) return res.status(400).json({ message: "Invalid ID" });

        const { title, department, location, type, description, responsibilities, qualifications, status, start_date, deadline } = req.body;
        try {
            await db.query(
                "UPDATE jobs SET title=?, department=?, location=?, type=?, description=?, responsibilities=?, qualifications=?, status=?, start_date=?, deadline=? WHERE id=?",
                [title, department, location, type, description, JSON.stringify(responsibilities), JSON.stringify(qualifications), status, start_date, deadline, idNum]
            );
            res.json({ message: "Job updated successfully" });
        } catch (error) {
            sendError(res, error);
        }
    },

    deleteJob: async (req, res) => {
        const idNum = parseInt(req.params.id, 10);
        if (isNaN(idNum)) return res.status(400).json({ message: "Invalid ID" });

        try {
            await db.query("DELETE FROM jobs WHERE id = ?", [idNum]);
            res.json({ message: "Job deleted successfully" });
        } catch (error) {
            sendError(res, error);
        }
    },

    // --- APPLICATION MANAGEMENT ---

    applyJob: async (req, res) => {
        const { jobId, fullName, email, gender, phone, address, linkedin, portfolio, coverLetter, education, workExperience, skills } = req.body;
        const resumePath = req.file ? `/uploads/${req.file.filename}` : null;

        const jobIdNum = parseInt(jobId, 10);
        if (isNaN(jobIdNum)) return res.status(400).json({ message: "Invalid Job ID" });

        // Generate tracking code: ITPC-xxxx
        const trackingCode = `ITPC-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        try {
            // Fetch Job Title first for the email
            const [jobRows] = await db.query("SELECT title FROM jobs WHERE id = ?", [jobIdNum]);
            const jobTitle = jobRows.length > 0 ? jobRows[0].title : "Selected Position";

            const [result] = await db.query(
                "INSERT INTO applications (job_id, tracking_code, full_name, gender, email, phone, address, linkedin, portfolio, resume_path, cover_letter, education, work_experience, skills, applied_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
                [jobIdNum, trackingCode, fullName, gender, email, phone, address, linkedin, portfolio, resumePath, coverLetter, education, workExperience, skills]
            );

            // Send Confirmation Email
            if (email) {
                sendApplicationConfirmationEmail(email, fullName, jobTitle, trackingCode)
                    .catch(err => console.error("Error sending confirmation email:", err));
            }

            res.status(201).json({
                success: true,
                message: "Application submitted successfully",
                trackingCode
            });
        } catch (error) {
            sendError(res, error);
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
            sendError(res, error);
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
            sendError(res, error);
        }
    },

    updateStatus: async (req, res) => {
        const idNum = parseInt(req.params.id, 10);
        if (isNaN(idNum)) return res.status(400).json({ message: "Invalid ID" });

        const { status, adminNotes, appointmentDate, appointmentTime, appointmentLocation, appointmentDetails } = req.body;

        try {
            // Get current info for email
            const [appData] = await db.query(`
                SELECT a.email, a.full_name, a.tracking_code, j.title as jobTitle 
                FROM applications a
                LEFT JOIN jobs j ON a.job_id = j.id
                WHERE a.id = ?
            `, [idNum]);

            if (appData.length === 0) return res.status(404).json({ message: "Application not found" });

            await db.query(
                "UPDATE applications SET status = ?, admin_notes = ?, appointment_date = ?, appointment_time = ?, appointment_location = ?, appointment_lat = ?, appointment_lng = ?, appointment_map_link = ?, appointment_details = ? WHERE id = ?",
                [status, adminNotes, appointmentDate, appointmentTime, appointmentLocation, req.body.appointmentLat, req.body.appointmentLng, req.body.appointmentMapLink, appointmentDetails, idNum]
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
            sendError(res, error);
        }
    },

    bulkUpdateStatus: async (req, res) => {
        const { ids, status, adminNotes, appointmentDate, appointmentTime, appointmentLocation, appointmentLat, appointmentLng, appointmentMapLink, appointmentDetails } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "No application IDs provided" });
        }

        // Strictly validate IDs are numbers
        const safeIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
        if (safeIds.length === 0) {
            return res.status(400).json({ message: "No valid IDs provided" });
        }

        try {
            // 1. Update database
            await db.query(
                "UPDATE applications SET status = ?, admin_notes = ?, appointment_date = ?, appointment_time = ?, appointment_location = ?, appointment_lat = ?, appointment_lng = ?, appointment_map_link = ?, appointment_details = ? WHERE id IN (?)",
                [status, adminNotes, appointmentDate, appointmentTime, appointmentLocation, appointmentLat, appointmentLng, appointmentMapLink, appointmentDetails, safeIds]
            );

            // 2. Fetch data for emails
            const [apps] = await db.query(`
                SELECT a.email, a.full_name, a.tracking_code, j.title as jobTitle 
                FROM applications a
                LEFT JOIN jobs j ON a.job_id = j.id
                WHERE a.id IN (?)
            `, [safeIds]);

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

            res.json({ message: `Successfully updated ${safeIds.length} applications and sent notifications.` });
        } catch (error) {
            sendError(res, error);
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
            sendError(res, error);
        }
    }
};

module.exports = careerController;
