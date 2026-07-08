const userRepository = require("../repositories/user.repository");

const getAllUsers = async () => {

    const users = await userRepository.getAllUsers();

    return users;

};
const getUserById = async (userId) => {

    const user = await userRepository.getUserById(userId);

    if (!user) {
        throw new Error("User not found.");
    }

    return user;
};

const updateUser = async (userId, userData) => {
    
    const user = await userRepository.updateUser(
        userId,
        userData
    );
    
    if (!user) {
        throw new ApiError(404, "User not found.");
    }
    
    return user;
};
const deleteUser = async (userId) => {

    const user = await userRepository.deleteUser(userId);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    return user;
};

const ApiError = require("../utils/ApiError");

const assignRoleByEmail = async (email, roleId) => {
    if (!email) {
        throw new ApiError(400, "Email address is required.");
    }
    if (!roleId) {
        throw new ApiError(400, "Role ID is required.");
    }
    const user = await userRepository.assignRoleByEmail(email, Number(roleId));
    if (!user) {
        throw new ApiError(404, "User with this email address not found.");
    }
    return user;
};

module.exports = {
    getAllUsers,
     getUserById,
     updateUser,deleteUser,assignRoleByEmail
};