const reportRepository = require("../repositories/report.repository");
const ApiError = require("../utils/ApiError");

const getRegistrationReportEvents = async (user) => {
    const roleId = Number(user.role_id);

    return await reportRepository.getEventsWithRegistrationCounts(
        user.user_id,
        roleId
    );
};

const getEventRegistrationReport = async (eventId, user) => {
    const roleId = Number(user.role_id);
    const hasAccess = await reportRepository.canAccessEvent(
        eventId,
        user.user_id,
        roleId
    );

    if (!hasAccess) {
        throw new ApiError(403, "You do not have access to this event report.");
    }

    const registrations = await reportRepository.getEventRegistrationDetails(eventId);

    return registrations.map((row) => ({
        ...row,
        student_name: `${row.first_name} ${row.last_name}`.trim(),
    }));
};

module.exports = {
    getRegistrationReportEvents,
    getEventRegistrationReport,
};
