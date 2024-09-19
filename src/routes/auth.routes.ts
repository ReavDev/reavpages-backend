import { Router } from "express";
import AuthController from "../controllers/auth.controller";

const router = Router();

// Route for user signup
router.post("/register", AuthController.register);

// Route for user login
router.post("/login", AuthController.login);

// Route for password reset
router.post("/password-reset", AuthController.passwordReset);

// Route for enabling 2FA
router.post("/enable-2fa", AuthController.enable2FA);

// Route for disabling 2FA
router.post("/disable-2fa", AuthController.disable2FA);

export default router;
