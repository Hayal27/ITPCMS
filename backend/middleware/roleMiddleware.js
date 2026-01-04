
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // req.user is populated by verifyToken middleware
        // We assume the roles are passed as IDs or Names
        // Based on the DB schema, roles table has role_id and role_name.
        // verifyToken attaches decoded token which contains role_id.

        if (!req.user || !roles.includes(req.user.role_id)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to perform this action"
            });
        }
        next();
    };
};

module.exports = { restrictTo };
