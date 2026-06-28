const registrationRepository = require("../repositories/registration.repository");
const eventRepository = require("../repositories/event.repository");
const ApiError = require("../utils/apiError");

const registerEvent = async (eventId, studentId) => {

    const event =
        await registrationRepository.getEventById(eventId);

    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    if (event.status !== "Published") {
        throw new ApiError(
            400,
            "Event is not published."
        );
    }

    if (new Date(event.registration_deadline) < new Date()) {
        throw new ApiError(
            400,
            "Registration deadline has passed."
        );
    }

    const already =
        await registrationRepository.findRegistration(
            eventId,
            studentId
        );

    if (already) {
        throw new ApiError(
            409,
            "Already registered."
        );
    }

    const count =
        await registrationRepository.registrationCount(eventId);

    let status = "Registered";

    if (count >= event.capacity) {
        status = "Waitlisted";
    }

    return await registrationRepository.createRegistration(
        eventId,
        studentId,
        status
    );
};
const getMyRegistrations = async (studentId) => {

    return await registrationRepository.getMyRegistrations(
        studentId
    );

};

const cancelRegistration = async (
    registrationId,
    studentId
) => {

    const registration =
        await registrationRepository.findRegistrationById(
            registrationId
        );

    if (!registration) {
        throw new ApiError(
            404,
            "Registration not found."
        );
    }

    if (
        Number(registration.student_id) !== Number(studentId)
    ) {
        throw new ApiError(
            403,
            "You can cancel only your own registration."
        );
    }

    if (
        new Date() >
        new Date(registration.registration_deadline)
    ) {
        throw new ApiError(
            400,
            "Registration deadline has passed."
        );
    }

    await registrationRepository.deleteRegistration(
        registrationId
    );
};
const getEventRegistrations = async (eventId) => {

    const event =
        await eventRepository.getEventById(eventId);

    if (!event) {
        throw new ApiError(
            404,
            "Event not found."
        );
    }

    return await registrationRepository.getEventRegistrations(
        eventId
    );

};
const getRegistrationCount = async (eventId) => {

    const event =
        await eventRepository.getEventById(eventId);

    if (!event) {
        throw new ApiError(
            404,
            "Event not found."
        );
    }

    const stats =
        await registrationRepository.getRegistrationCount(
            eventId
        );

    return {
        event_id: Number(stats.event_id),
        capacity: Number(stats.capacity),
        registered: Number(stats.registered),
        remaining:
            Number(stats.capacity) -
            Number(stats.registered)
    };

};

module.exports = {
    registerEvent,getMyRegistrations,cancelRegistration,getEventRegistrations
    ,getRegistrationCount
};