const ApiError = require("../utils/ApiError");

const { sendError } = require("../utils/response");
const errorHandler = (err, req, res, next) => {

    console.error(err);

    if (err instanceof ApiError) {
        return sendError(
            res,
            err.statusCode,
            err.message
        );
    }

    if (err.code === '23505') {
        return sendError(
            res,
            400,
            "This email address is already registered. Please login or use a different email."
        );
    }

    return sendError(
        res,
        500,
        "Internal Server Error"
    );
};

module.exports = errorHandler;
