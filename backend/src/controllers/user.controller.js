const userService = require("../services/user.service");

const getAllUsers = async (req, res, next) => {

    try {

        const users = await userService.getAllUsers();

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully.",
            data: users
        });

    } catch (error) {
        next(error);
    }

};
const getUserById = async (req, res, next) => {

    try {

        const user = await userService.getUserById(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message: "User fetched successfully.",
            data: user
        });

    } catch (error) {
        next(error);
    }

};
const updateUser = async (req, res, next) => {

    try {

        const user = await userService.updateUser(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "User updated successfully.",
            data: user
        });

    } catch (error) {
        next(error);
    }

};
const deleteUser = async (req, res, next) => {

    try {

        const user = await userService.deleteUser(req.params.id);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully.",
            data: user
        });

    } catch (error) {
        next(error);
    }

};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,deleteUser
};