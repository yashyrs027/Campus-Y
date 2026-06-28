class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);

        this.statusCode = statusCode;
        this.success = false;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ApiError;

/*const ApiError = require("../errors/ApiError");

const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
};

module.exports = errorHandler;
*/ 