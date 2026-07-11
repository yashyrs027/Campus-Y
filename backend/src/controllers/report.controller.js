const reportService = require("../services/report.service");
const { sendSuccess } = require("../utils/response");

const getRegistrationReportEvents = async (req, res, next) => {
    try {
        const events = await reportService.getRegistrationReportEvents(req.user);

        return sendSuccess(
            res,
            200,
            "Registration report events fetched successfully.",
            events
        );
    } catch (error) {
        next(error);
    }
};

const getEventRegistrationReport = async (req, res, next) => {
    try {
        const registrations = await reportService.getEventRegistrationReport(
            req.params.eventId,
            req.user
        );

        return sendSuccess(
            res,
            200,
            "Event registration report fetched successfully.",
            registrations
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRegistrationReportEvents,
    getEventRegistrationReport,
};
