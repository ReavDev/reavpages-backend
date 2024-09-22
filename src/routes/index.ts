import { Router } from "express";
import authRoutes from "./auth.route";

const router = Router();

// Route for authentication
router.use("/auth", authRoutes);

export default router;
