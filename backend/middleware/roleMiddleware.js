/**
 * Middleware to restrict access based on user roles
 * Expects verifyToken to have been called already (req.user exists)
 */
const restrictTo = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        const userRole = req.user.role_id;

        if (allowedRoles.length === 0) return next();

        // Check if user's role is in the allowed list
        // Note: For convenience, we handle single role input (e.g. restrictTo(1)) 
        // by wrapping it in an array if it's not one.
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (roles.includes(userRole)) {
            return next();
        }

        console.warn(`[SECURITY] Unauthorized access attempt by user ${req.user.user_id} (Role: ${userRole}) to ${req.originalUrl}`);

        return res.status(403).json({
            success: false,
            message: "Access Denied: You do not have permission to perform this action."
        });
    };
};

module.exports = { restrictTo };
