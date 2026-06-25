const ApiError = require("../errors/ApiError");

const { sendError } = require("../utils/Response");
const errorHandler = (err, req, res, next) => {

    console.error(err);

    if (err instanceof ApiError) {

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
    }

    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
};

module.exports = errorHandler;