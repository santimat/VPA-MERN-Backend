import mongoose from "mongoose";

const PatientSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        owner: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        symptoms: {
            type: String,
            required: true,
        },
        veterinarian: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Veterinarian",
        },
    },
    {
        timestamps: true,
    }
);

PatientSchema.statics.validatePatientOwnership = async function (
    patientId,
    veterinarianId
) {
    if (!mongoose.isValidObjectId(patientId))
        throw { status: 422, message: "Id must be a ObjectId" };

    const patient = await this.findById(patientId);

    if (!patient) throw { status: 404, message: "Patient not found" };

    if (patient.veterinarian.toString() !== veterinarianId.toString())
        throw { status: 401, message: "Unauthorized access" };

    return patient;
};

export const Patient = mongoose.model("Patient", PatientSchema);
