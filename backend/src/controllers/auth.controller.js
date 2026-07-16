const authService = require("../services/auth.service");
const { sendSuccess } = require("../utils/response");

const register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);

        return sendSuccess(res,201,"User registered successfully.",user);
    } catch (error) {
        next(error);
    }
};
const login = async (req, res, next) => {

    try {

        const { email, password } = req.body;

        const result = await authService.login(email, password);

       return sendSuccess( res,200,"Login successful.",result);

    } catch (error) {
        next(error);
    }

};

const getProfile = async (req, res, next) => {

    try {

        const user = await authService.getProfile(req.user.user_id);

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);
    }

};

const updateProfile = async (req, res, next) => {

    try {

        const updatedUser = await authService.updateProfile(
            req.user.user_id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: updatedUser
        });

    } catch (error) {
        next(error);
    }

};
const changePassword = async (req, res, next) => {

    try {

        const { old_password, new_password } = req.body;

        await authService.changePassword(
            req.user.user_id,
            old_password,
            new_password
        );

        return res.status(200).json({
            success: true,
            message: "Password changed successfully."
        });

    } catch (error) {
        next(error);
    }

};

const logout = async (req, res) => {

    return res.status(200).json({
        success: true,
        message: "Logged out successfully."
    });

};

const getProfileStats = async (req, res, next) => {
    try {
        const { user_id, role_id, department_id } = req.user;
        const stats = await authService.getProfileStats(user_id, role_id, department_id);

        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await authService.forgotPassword(email);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const result = await authService.verifyOtp(email, otp);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        const result = await authService.resetPassword(token, password);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout,
    getProfileStats,
    forgotPassword,
    verifyOtp,
    resetPassword
};
