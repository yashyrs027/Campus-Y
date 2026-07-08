const clubRepository = require("../repositories/club.repository");
const ApiError = require("../utils/ApiError");

const getAllClubs = async () => {
    return await clubRepository.getAllClubs();
};

const createClub = async (clubData) => {
    if (!clubData.club_name) {
        throw new ApiError(400, "Club name is required.");
    }
    if (!clubData.department_id) {
        throw new ApiError(400, "Department ID is required.");
    }
    return await clubRepository.createClub(clubData);
};

const updateClub = async (clubId, clubData) => {
    if (!clubData.club_name) {
        throw new ApiError(400, "Club name is required.");
    }
    if (!clubData.department_id) {
        throw new ApiError(400, "Department ID is required.");
    }
    const updated = await clubRepository.updateClub(clubId, clubData);
    if (!updated) {
        throw new ApiError(404, "Club not found.");
    }
    return updated;
};

module.exports = {
    getAllClubs,
    createClub,
    updateClub
};
