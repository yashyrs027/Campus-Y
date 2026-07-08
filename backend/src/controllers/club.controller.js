const clubService = require("../services/club.service");
const { sendSuccess } = require("../utils/response");

const getAllClubs = async (req, res, next) => {
    try {
        const clubs = await clubService.getAllClubs();
        return sendSuccess(res, 200, "Clubs fetched successfully.", clubs);
    } catch (error) {
        next(error);
    }
};

const createClub = async (req, res, next) => {
    try {
        const club = await clubService.createClub(req.body);
        return sendSuccess(res, 201, "Club created successfully.", club);
    } catch (error) {
        next(error);
    }
};

const updateClub = async (req, res, next) => {
    try {
        const club = await clubService.updateClub(req.params.id, req.body);
        return sendSuccess(res, 200, "Club updated successfully.", club);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllClubs,
    createClub,
    updateClub
};
