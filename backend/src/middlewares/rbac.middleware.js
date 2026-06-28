const ApiError = require("../utils/ApiError");

const authorize = (allowedRoles) => {
    return (req, res, next) => {

        const userRole = Number(req.user.role_id);

        if (!allowedRoles.includes(userRole)) {
            return next(
                new ApiError(
                    403,
                    "You are not authorized to access this resource."
                )
            );
        }

        next();
    };
};

module.exports = authorize;