import { Router } from "express";
import {
    addPatient,
    getPatients,
    getPatient,
    updatePatient,
    deletePatient,
} from "../controllers/patientControllers.js";
import { checkAuth } from "../middleware/authMiddleware.js";
export const router = Router();

// Private route
// Apply checkAuth to all routes because these are privates
router.use(checkAuth);
router.route("/").post(addPatient).get(getPatients);
router.route("/:id").get(getPatient).put(updatePatient).delete(deletePatient);
