import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { generateToken } from "../helpers/generateToken.js";

const VeterinarianSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        // Delete white spaces
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    phone: {
        type: String,
        default: null,
        trim: true,
    },
    web: {
        type: String,
        default: null,
        trim: true,
    },
    token: {
        type: String,
        // to generates a new token for every new veterinarian, generateToken will be passed as callback
        default: generateToken,
    },
    expirationToken: {
        type: Number,
        default: null,
    },
    confirmed: {
        type: Boolean,
        default: false,
    },
});

// Hooks from mongoose
// before save
// function is used to allows the use of "this"
VeterinarianSchema.pre("save", async function (next) {
    // If password is already hashed ignore the rest
    !this.isModified("password") && next();

    // Password hasing to prevent that it being recorded in logs
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Methods to schema
VeterinarianSchema.methods.checkPassword = async function (passwordForm) {
    // If user exists an it is confirmed
    // Validate password
    return await bcrypt.compare(passwordForm, this.password);
};

// First value is the name
// Second is the schame that will be used
export const Veterinarian = mongoose.model("Veterinarian", VeterinarianSchema);
