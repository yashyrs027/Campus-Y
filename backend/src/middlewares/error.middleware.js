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

    return sendError(
        res,
        500,
        "Internal Server Error"
    );
};

module.exports = errorHandler;
