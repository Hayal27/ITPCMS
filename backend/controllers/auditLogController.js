const AuditLog = require("../models/auditLog");
const con = require("../models/db"); // Direct DB access for blocked_ips

const auditLogController = {
    // Helper function to be used by middleware or other controllers
    logActivity: (req, action, entity, entity_id = null, details = null) => {
        const logData = {
            user_id: req.session?.user?.id || req.user?.user_id || null, // Handle different auth methods
            action: action,
            entity: entity,
            entity_id: entity_id,
            details: details,
            ip_address: req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress,
            user_agent: (req.get && typeof req.get === 'function') ? req.get("User-Agent") : (req.headers ? req.headers["user-agent"] : null),
        };

        AuditLog.create(logData, (err, result) => {
            if (err) {
                console.error("Failed to create audit log:", err);
            }
        });
    },

    // API Endpoint to fetch logs
    getLogs: (req, res) => {
        const filters = {
            action: req.query.action,
            entity: req.query.entity,
            user_id: req.query.user_id,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };

        AuditLog.getAll(filters, (err, results) => {
            if (err) {
                console.error("Error fetching audit logs:", err);
                return res.status(500).json({ message: "Error fetching audit logs" });
            }
            res.json(results);
        });
    },

    // Get Blocked IPs and Locked Accounts
    getBlockedIPs: (req, res) => {
        const queryBlocked = "SELECT * FROM blocked_ips ORDER BY blocked_at DESC";
        const queryLocked = "SELECT u.user_id as id, u.user_name as ip_address, u.account_locked_until as blocked_at, 'Account Suspended' as reason, 'user' as type FROM users u WHERE u.account_locked_until > NOW()";

        con.query(queryBlocked, (err, blockedResults) => {
            if (err) {
                console.error("Error fetching blocked IPs:", err);
                return res.status(500).json({ message: "Error fetching blocked IPs" });
            }

            con.query(queryLocked, (err, lockedResults) => {
                if (err) {
                    console.error("Error fetching locked accounts:", err);
                    // Still return blocked IPs if locked query fails
                    return res.json(blockedResults.map(r => ({ ...r, type: 'ip' })));
                }

                const combined = [
                    ...blockedResults.map(r => ({ ...r, type: 'ip' })),
                    ...lockedResults
                ].sort((a, b) => new Date(b.blocked_at).getTime() - new Date(a.blocked_at).getTime());

                console.log(`[AUDIT] Returning ${combined.length} security items to frontend:`, JSON.stringify(combined, null, 2));
                res.json(combined);
            });
        });
    },

    // Unblock IP or Unlock User
    unblockIP: (req, res) => {
        const { id } = req.params;
        const { type } = req.query; // Expect 'ip' or 'user'

        if (type === 'user') {
            con.query("UPDATE users SET account_locked_until = NULL, failed_login_attempts = 0 WHERE user_id = ?", [id], (err, result) => {
                if (err) {
                    console.error("Error unlocking user:", err);
                    return res.status(500).json({ message: "Error unlocking user" });
                }
                res.json({ message: "User account unlocked successfully" });
            });
        } else {
            con.query("DELETE FROM blocked_ips WHERE id = ?", [id], (err, result) => {
                if (err) {
                    console.error("Error unblocking IP:", err);
                    return res.status(500).json({ message: "Error unblocking IP" });
                }
                res.json({ message: "IP unblocked successfully" });
            });
        }
    }
};

module.exports = auditLogController;
