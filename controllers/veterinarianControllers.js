import { Veterinarian } from "../models/Veterinarian.js";
import { generateJWT } from "../helpers/generateJWT.js";
import { generateToken } from "../helpers/generateToken.js";
import { emailRegister } from "../helpers/emailRegister.js";
import { emailForgotPassword } from "../helpers/emailForgotPassword.js";
import { sendErrorResponse } from "../helpers/errorResponse.js";
import { validateForm } from "../helpers/validateForm.js";

export const register = async (req, res) => {
    // Read req.body to access the information sent by API
    const { email, password } = req.body;

    const validation = validateForm(email, password);
    if (validation) return res.status(validation.status).json(validation.json);

    // Prevent duplicated users
    // findOne allows get a log by a condition
    const existingUser = await Veterinarian.findOne({ email });

    // If an user with the same email already exists
    if (existingUser)
        // Create a new error
        return res.status(400).json({ msg: "Already registerd user" });

    try {
        // Save a new veterinarian
        const veterinarian = new Veterinarian(req.body);
        const veterinarianSaved = await veterinarian.save();

        // Once new veterinarian has been saved send an email
        emailRegister({
            email,
            name: veterinarianSaved.name,
            token: veterinarianSaved.token,
        });

        res.status(200).json({
            msg: "User correctly created, check your email",
        });
    } catch (e) {
        sendErrorResponse(res, e, "register");
    }
};

export const confirm = async (req, res) => {
    // Read the token from URL params
    const { token } = req.params;

    // Find veterinarian by their token
    const veterinarian = await Veterinarian.findOne({ token });

    // If veterinarian cannot be found
    if (!veterinarian)
        return res.status(404).json({ msg: "This link has expired" });

    if (veterinarian.confirmed)
        return res.status(400).json({ msg: "User already confirm" });

    try {
        // Cofirm veterinarian account and clear token
        veterinarian.confirmed = true;
        veterinarian.token = null;
        await veterinarian.save();
        return res.status(200).json({ msg: "User correctly confirmed" });
    } catch (e) {
        sendErrorResponse(res, e, "confirm");
    }
};

export const authenticate = async (req, res) => {
    const { email, password: passwordForm } = req.body;

    // If email or password are empty
    const validation = validateForm(email, passwordForm);
    if (validation) return res.status(validation.status).json(validation.json);

    try {
        // Check if the user exists
        // find user by their email
        const veterinarian = await Veterinarian.findOne({ email });

        if (!veterinarian) {
            return res
                .status(401)
                .json({ msg: "There is no user with that email" });
        }

        // Check if is a confirmed user
        if (!veterinarian.confirmed) {
            return res.status(403).json({ msg: "User not confirmed" });
        }

        // Check password
        const result = await veterinarian.checkPassword(passwordForm);
        if (!result) return res.status(401).json({ msg: "Invalid password" });

        // If everything is okay

        res.status(200).json({
            _id: veterinarian._id,
            name: veterinarian.name,
            email: veterinarian.email,
            web: veterinarian.web,
            phone: veterinarian.phone,
            // generaJWT takes veterinarian id
            token: generateJWT(veterinarian._id),
        });
    } catch (e) {
        sendErrorResponse(res, e, "authenticate");
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    // Check if user exists
    const existsUser = await Veterinarian.findOne({ email });
    if (!existsUser) {
        return res.status(400).json({ msg: "User does not exist" });
    }
    if (!existsUser.confirmed) {
        return res.status(401).json({ msg: "User is not confirmed" });
    }

    // If user already exists and his token did not expire
    if (existsUser.token && existsUser.expirationToken > Date.now()) {
        return res
            .status(400)
            .json({ msg: "You already have a password reset request open" });
    }

    // If user.token dont exists or it's expired create a new one
    existsUser.token = generateToken();
    existsUser.expirationToken = Date.now() * 60 * 60 * 1000;
    try {
        // Save token
        await existsUser.save();

        // Send instructions email
        emailForgotPassword({
            email,
            name: existsUser.name,
            token: existsUser.token,
        });

        return res
            .status(200)
            .json({ msg: "We sent a email with instructions" });
    } catch (e) {
        sendErrorResponse(res, e, "forgotPassword");
    }
};

export const checkToken = async (req, res) => {
    // Check if is a valid token
    const { token } = req.params;

    // Find user by token
    const userToken = await Veterinarian.findOne({ token });

    if (!userToken) {
        console.log("Invalid token");
        return res
            .status(404)
            .json({ msg: "There has been an error with the link" });
    }

    // Clear user token if is expired
    if (userToken.tokenExpiration < Date.now()) {
        userToken.token = null;
        userToken.tokenExpiration = null;
        await userToken.save();
        return res
            .status(400)
            .json({ msg: "Token expired, request a new reset" });
    }

    // If exists an user with that token
    res.status(200).json({ msg: "Add your new password" });
};

export const newPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    // Validate token
    const user = await Veterinarian.findOne({ token });
    if (!user) {
        console.log(`[newPassword] Invalid token received: ${token}`);
        return res.status(404).json({ msg: "The link no longer works" });
    }

    // Clear user token if is expired
    if (user.tokenExpiration < Date.now()) {
        user.token = null;
        user.tokenExpiration = null;
        await user.save();
        return res
            .status(400)
            .json({ msg: "Token expired, request a new reset" });
    }

    try {
        // Clear token and change password
        user.token = null;
        user.password = password;
        await user.save();
        res.status(200).json({ msg: "New password saved" });
    } catch (e) {
        sendErrorResponse(res, e, "newPassword");
    }
};

export const profile = (req, res) => {
    const { veterinarian } = req;

    if (!veterinarian) return res.send(404).json({ msg: "Invalid access" });
    res.status(200).json(veterinarian);
};

export const updateProfile = async (req, res) => {
    const { id } = req.params;
    const veterinarian = await Veterinarian.findById(id);
    if (!veterinarian) return res.send(400).json({ msg: "User not found" });

    // if the user tries to add an email that belongs to another user
    const { email } = req.body;
    if (veterinarian.email !== email) {
        const existsEmail = await Veterinarian.findOne({ email });
        if (existsEmail)
            return res
                .status(404)
                .json({ msg: "This email is already in use" });
    }

    try {
        Object.assign(veterinarian, req.body);
        const veterinarianSaved = await veterinarian.save();
        res.status(200).json({
            msg: "Profile correctly updated",
            profile: {
                name: veterinarianSaved.name,
                email: veterinarianSaved.email,
                phone: veterinarianSaved.phone,
                web: veterinarianSaved.web,
                _id: veterinarianSaved._id,
            },
        });
    } catch (error) {
        sendErrorResponse(res, error, "updateProfile");
    }
};

export const updatePassword = async (req, res) => {
    // Read data

    const { _id } = req.veterinarian;

    const { currentPassword, newPassword } = req.body;

    // Check if veterianarian exists
    const veterinarian = await Veterinarian.findById(_id);
    if (!veterinarian) return res.status(400).json({ msg: "Invalid access" });

    // Check password
    if (!(await veterinarian.checkPassword(currentPassword)))
        return res.status(404).json({ msg: "Current password is wrong" });
    // Save the new one
};
