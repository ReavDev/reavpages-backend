import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { authGuard } from "../guards/auth.guard";

const router = Router();

// Route for user signup
router.post("/register", AuthController.register);

// Route for user login
router.post("/login", AuthController.login);

// Route for password reset
router.post("/reset-password", AuthController.resetPassword);

// Route for password update
router.patch("/update-password", AuthController.updatePassword);

// Route for email verification
router.patch("/verify-email", authGuard, AuthController.verifyEmail);

// Route for enabling 2FA
router.patch("/enable-2fa", authGuard, AuthController.enableTwoFa);

// Route for disabling 2FA
router.patch("/disable-2fa", authGuard, AuthController.disableTwoFa);

// Route for requesting an OTP for 2FA
router.post("/request-otp", AuthController.requestOtp);

// Route for verifying OTP
router.post("/verify-otp", AuthController.verifyOtp);

export default router;
