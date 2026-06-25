const bcrypt = require("bcrypt");
const authRepository = require("../repositories/auth.repository");
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

module.exports = {
    register, login , getProfile,updateProfile,changePassword
};