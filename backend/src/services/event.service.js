const eventRepository = require("../repositories/event.repository");
const ApiError = require("../utils/ApiError");

const createEvent = async (data, userId) => {

    const proposal = await eventRepository.findProposalById(
        data.proposal_id
    );

    if (!proposal) {
        throw new ApiError(404, "Proposal not found.");
    }

    if (proposal.status !== "Approved") {
        throw new ApiError(
            400,
            "Only approved proposals can become events."
        );
    }

    const existing =
        await eventRepository.findEventByProposal(
            data.proposal_id
        );

    if (existing) {
        throw new ApiError(
            409,
            "Event already created from this proposal."
        );
    }

    return await eventRepository.createEvent({
        ...data,
        created_by: userId,
         status: "Published"
    });
};

const getAllEvents = async () => {
    return await eventRepository.getAllEvents();
};
const getEventById = async (eventId) => {

    const event = await eventRepository.getEventById(eventId);

    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    return event;
};
const updateEvent = async (eventId, data) => {

    const existing = await eventRepository.getEventById(eventId);

    if (!existing) {
        throw new ApiError(404, "Event not found.");
    }

    return await eventRepository.updateEvent(eventId, data);
};

const deleteEvent = async (eventId) => {

    const event = await eventRepository.getEventById(eventId);

    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    await eventRepository.deleteEvent(eventId);
};

module.exports = {
    createEvent,getAllEvents,getEventById,updateEvent,deleteEvent
};
