import { Router } from "express";
import {
    register,
    confirm,
    authenticate,
    profile,
    forgotPassword,
    checkToken,
    newPassword,
    updateProfile,
    updatePassword,
} from "../controllers/veterinarianControllers.js";
import { checkAuth } from "../middleware/authMiddleware.js";

export const router = Router();

// Public routes
router.post("/", register);
// URL with dynamic params
router.get("/confirm/:token", confirm);
router.post("/login", authenticate);
router.post("/forgot-password", forgotPassword);

// Get and post to same endpoint
router.route("/forgot-password/:token").get(checkToken).patch(newPassword);

// Private routes
router.use(checkAuth);
router.get("/profile", profile);
router.put("/profile/:id", updateProfile);
router.put("/update-password", updatePassword);
