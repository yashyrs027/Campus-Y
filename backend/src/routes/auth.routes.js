const express = require("express");

const router = express.Router();

// Controller
const authController = require("../controllers/auth.controller");
const {registerValidation,loginValidation,updateProfileValidation,changePasswordValidation,validate} = require("../validators/auth.validator");
const authenticate = require("../middlewares/auth.middleware");



const ROLES = require("../constants/roles");
const authorize = require("../middlewares/rbac.middleware");
// Register API
router.post("/register", registerValidation, validate, authController.register);

router.post( "/login",loginValidation,validate,authController.login);

router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-otp", authController.verifyOtp);
router.post("/reset-password", authController.resetPassword);


router.get("/me",authenticate,(req, res) => {res.json({success: true, user: req.user});
    }
);

router.get("/profile/stats", authenticate, authController.getProfileStats);
router.get("/profile",authenticate,authController.getProfile);

router.put("/profile",authenticate,updateProfileValidation,validate,authController.updateProfile);

router.post("/change-password",authenticate,changePasswordValidation,validate,authController.changePassword);

router.post("/logout",authenticate,authController.logout);


router.get(
    "/admin-test",
    authenticate,
    authorize([ROLES.ADMIN]),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Admin access granted"
        });
    }
);


module.exports = router;
