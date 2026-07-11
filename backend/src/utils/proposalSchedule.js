const ApiError = require("./ApiError");

const toDatePart = (value) => {
    if (!value) return null;
    if (value instanceof Date && !isNaN(value.getTime())) {
        const year = value.getUTCFullYear();
        const month = String(value.getUTCMonth() + 1).padStart(2, "0");
        const day = String(value.getUTCDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
};

const toTimePart = (value) => {
    if (!value) return null;
    const match = String(value).match(/(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : null;
};

const combineDateAndTime = (dateValue, timeValue) => {
    const datePart = toDatePart(dateValue);
    const timePart = toTimePart(timeValue);
    if (!datePart || !timePart) return null;

    const combined = new Date(`${datePart}T${timePart}:00`);
    return isNaN(combined.getTime()) ? null : combined;
};

const validateProposalSchedule = (proposalData) => {
    const startDate = toDatePart(proposalData.start_date);
    const endDate = toDatePart(proposalData.end_date);
    const startTime = toTimePart(proposalData.start_time);
    const endTime = toTimePart(proposalData.end_time);
    const registrationDeadline = proposalData.registration_deadline
        ? new Date(proposalData.registration_deadline)
        : null;

    if (!startDate || !endDate) {
        throw new ApiError(400, "Event start date and end date are required.");
    }

    if (!startTime || !endTime) {
        throw new ApiError(400, "Event start time and end time are required.");
    }

    if (endDate < startDate) {
        throw new ApiError(400, "End date cannot be before start date.");
    }

    if (endTime <= startTime) {
        throw new ApiError(400, "End time must be after start time.");
    }

    const start = combineDateAndTime(proposalData.start_date, proposalData.start_time);
    const end = combineDateAndTime(proposalData.end_date, proposalData.end_time);

    if (!start || !end) {
        throw new ApiError(400, "Event schedule is invalid.");
    }

    if (end <= start) {
        throw new ApiError(400, "Event end must be after event start.");
    }

    if (!registrationDeadline || isNaN(registrationDeadline.getTime())) {
        throw new ApiError(400, "Registration deadline is invalid.");
    }

    if (registrationDeadline.getTime() > start.getTime()) {
        throw new ApiError(
            400,
            "Registration deadline must be on or before the event start time."
        );
    }

    return { start, end, registrationDeadline };
};

module.exports = {
    toDatePart,
    toTimePart,
    combineDateAndTime,
    validateProposalSchedule,
};
