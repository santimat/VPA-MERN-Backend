import { Patient } from "../models/Patient.js";
import { sendErrorResponse } from "../helpers/errorResponse.js";

export const addPatient = async (req, res) => {
    // Create patient instance
    const patient = new Patient(req.body);

    // get veterinarian from request and add veterinarian-id to patient object
    const { _id: veterinarianId } = req.veterinarian;
    patient.veterinarian = veterinarianId;

    // Save in database
    try {
        const existingPatient = await Patient.findOne({
            name: patient.name,
            email: patient.email,
            veterinarian: veterinarianId,
        });

        if (existingPatient)
            return res.status(400).json({ msg: "This patient already exists" });

        await patient.save();
        res.status(200).json({ msg: "Patient saved", patient });
    } catch (error) {
        sendErrorResponse(res, error, "addPatient");
    }
};
export const getPatients = async (req, res) => {
    const { _id: veterinarian } = req.veterinarian;

    try {
        const patients = await Patient.find({ veterinarian });
        // If veterinarian does not have patients
        if (patients.length === 0) {
            return res
                .status(404)
                .json({ msg: "No patients found for this veterinarian" });
        }
        res.status(200).json(patients);
    } catch (error) {
        sendErrorResponse(res, error, "getPatients");
    }
};

export const getPatient = async (req, res) => {
    // Get a patient by id
    const { id: patientId } = req.params;
    // Extract _id from veterinarian authenticated
    const { _id: veterinarianId } = req.veterinarian;

    try {
        const patient = await Patient.validatePatientOwnership(
            patientId,
            veterinarianId
        );

        if (!patient)
            return res
                .status(404)
                .json({ msg: "There is no user with that id" });

        res.status(200).json(patient);
    } catch (error) {
        sendErrorResponse(
            res,
            error,
            "getPatient",
            error.status,
            error.message
        );
    }
};

export const updatePatient = async (req, res) => {
    const { id: patientId } = req.params;
    const { _id: veterinarianId } = req.veterinarian;

    try {
        const patient = await Patient.validatePatientOwnership(
            patientId,
            veterinarianId
        );

        // Update patient
        // merge fields from body into patient
        // this Object method assigns values to properties that match
        Object.assign(patient, req.body);

        await patient.save();
        res.status(200).json({ msg: "Patient correctly updated" });
    } catch (error) {
        sendErrorResponse(
            res,
            error,
            "updatePatient",
            error.status,
            error.message
        );
    }
};

export const deletePatient = async (req, res) => {
    const { id: patientId } = req.params;
    const { _id: veterinarianId } = req.veterinarian;

    try {
        const patient = await Patient.validatePatientOwnership(
            patientId,
            veterinarianId
        );

        // Delete patient
        await patient.deleteOne();
        res.status(200).json({ msg: "Patient deleted" });
    } catch (error) {
        sendErrorResponse(
            res,
            error,
            "deletePatient",
            error.status,
            error.message
        );
    }
};
