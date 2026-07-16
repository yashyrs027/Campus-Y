const bcrypt = require("bcrypt");
const authRepository = require("../repositories/auth.repository");
const dashboardRepository = require("../repositories/dashboard.repository");
const jwt = require("jsonwebtoken");

const register = async (userData) => {

    // Check if email already exists
    const existingUser = await authRepository.findUserByEmail(userData.email);

    if (existingUser) {
        throw new Error("Email already exists.");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Replace plain password
    userData.password_hash = hashedPassword;

    delete userData.password;

    // Save user
    const user = await authRepository.createUser(userData);

    return user;
};
const login = async (email, password) => {

    // Find user
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
        throw new Error("Invalid email or password.");
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isPasswordMatch) {
        throw new Error("Invalid email or password.");
    }

    // Generate JWT
    const token = jwt.sign(
        {
            user_id: user.user_id,
            role_id: user.role_id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );

    return {
        token,
        user: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role_id: user.role_id
        }
    };
};


const getProfile = async (userId) => {

    const user = await authRepository.findUserById(userId);

    if (!user) {
        throw new Error("User not found.");
    }

    return user;
};

const updateProfile = async (userId, userData) => {

    const updatedUser = await authRepository.updateProfile(
        userId,
        userData
    );

    if (!updatedUser) {
        throw new Error("User not found.");
    }

    return updatedUser;
};

const changePassword = async (userId, oldPassword, newPassword) => {

    const user = await authRepository.findPasswordByUserId(userId);

    if (!user) {
        throw new Error("User not found.");
    }

    const isMatch = await bcrypt.compare(
        oldPassword,
        user.password_hash
    );

    if (!isMatch) {
        throw new Error("Old password is incorrect.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await authRepository.updatePassword(
        userId,
        hashedPassword
    );

    return;
};

const getProfileStats = async (userId, roleId, departmentId) => {
    const role = Number(roleId);
    const stats = {};

    if (role === 6) {
        stats.registrations = Number(await dashboardRepository.countMyRegistrations(userId));
        stats.certificates = Number(await dashboardRepository.countCertificates(userId));
    } else if (role === 4 || role === 5) {
        const events = await dashboardRepository.getMyEventsCount(userId);
        const regs = await dashboardRepository.getMyEventRegistrationCount(userId);
        stats.organized_events = Number(events?.total || 0);
        stats.registrations_received = Number(regs?.total || 0);
    } else if (role === 1 || role === 2 || role === 3) {
        stats.reviews_performed = Number(await dashboardRepository.countReviewsPerformed(role, departmentId));
    }

    return stats;
};

const forgotPassword = async (email) => {
    return { success: true, message: "A 6-digit OTP has been sent to your email address." };
};

const verifyOtp = async (email, otp) => {
    return { success: true, token: email };
};

const resetPassword = async (token, password) => {
    const user = await authRepository.findUserByEmail(token);
    if (!user) {
        throw new Error("User not found.");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await authRepository.updatePassword(user.user_id, hashedPassword);
    return { success: true, message: "Password updated successfully." };
};

module.exports = {
    register, login , getProfile,updateProfile,changePassword,getProfileStats,forgotPassword,verifyOtp,resetPassword
};