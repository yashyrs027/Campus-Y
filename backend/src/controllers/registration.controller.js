const registrationService =
require("../services/registration.service");

const registerEvent = async (req,res,next)=>{

    try{

        const registration =
        await registrationService.registerEvent(
            req.params.id,
            req.user.user_id
        );

        res.status(201).json({
            success:true,
            message:"Registration successful.",
            data:registration
        });

    }catch(error){
        next(error);
    }

};
const { sendSuccess } = require("../utils/response");

const getMyRegistrations = async (
    req,
    res,
    next
) => {

    try {
        const registrations =
    await registrationService.getMyRegistrations(
        req.user.user_id
    );

        return sendSuccess(
            res,
            200,
            "Registrations fetched successfully.",
            registrations
        );

    } catch (error) {

        next(error);

    }

};
const cancelRegistration = async (
    req,
    res,
    next
) => {

    try {

        await registrationService.cancelRegistration(
            req.params.registrationId,
            req.user.user_id
        );

        return sendSuccess(
            res,
            200,
            "Registration cancelled successfully."
        );

    } catch (error) {

        next(error);

    }

};
const getEventRegistrations = async (
    req,
    res,
    next
) => {

    try {

        const data =
            await registrationService.getEventRegistrations(
                req.params.eventId
            );

        return sendSuccess(
            res,
            200,
            "Event registrations fetched successfully.",
            data
        );

    } catch (error) {

        next(error);

    }

};
const getRegistrationCount = async (
    req,
    res,
    next
) => {

    try {

        const data =
            await registrationService.getRegistrationCount(
                req.params.eventId
            );

        return sendSuccess(
            res,
            200,
            "Registration statistics fetched successfully.",
            data
        );

    } catch (error) {

        next(error);

    }

};
module.exports={
    registerEvent,getMyRegistrations,cancelRegistration,getEventRegistrations,
    getRegistrationCount
};