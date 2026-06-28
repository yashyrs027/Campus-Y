const eventService = require("../services/event.service");

const createEvent = async (req, res, next) => {
    try {

        const event =
            await eventService.createEvent(
                req.body,
                req.user.user_id
            );

        res.status(201).json({
            success: true,
            message: "Event created successfully.",
            data: event
        });

    } catch (error) {
        next(error);
    }
};
const getAllEvents = async (req, res, next) => {
    try {

        const events = await eventService.getAllEvents();

        res.status(200).json({
            success: true,
            message: "Events fetched successfully.",
            data: events
        });

    } catch (error) {
        next(error);
    }
};
const getEventById = async (req, res, next) => {
    try {

        const event = await eventService.getEventById(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Event fetched successfully.",
            data: event
        });

    } catch (error) {
        next(error);
    }
};
const updateEvent = async (req, res, next) => {

    try {

        const event = await eventService.updateEvent(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Event updated successfully.",
            data: event
        });

    } catch (error) {
        next(error);
    }

};
const deleteEvent = async (req, res, next) => {

    try {

        await eventService.deleteEvent(req.params.id);

        res.status(200).json({
            success: true,
            message: "Event deleted successfully."
        });

    } catch (error) {
        next(error);
    }

};

module.exports = {
    createEvent,getAllEvents,getEventById,updateEvent,deleteEvent
};