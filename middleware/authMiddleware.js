import jwt from "jsonwebtoken";
import { Veterinarian } from "../models/Veterinarian.js";
import { sendErrorResponse } from "../helpers/errorResponse.js";

export const checkAuth = async (req, res, next) => {
    let token;

    // Get json web token from headers
    const { authorization } = req.headers;

    // Check if the token exists and if it's has "Bearer"
    if (authorization && authorization.startsWith("Bearer")) {
        try {
            // Split string where there is a space and select the part where token is
            token = authorization.split(" ")[1];

            // Token and secret word
            // get id from token
            const { id } = jwt.verify(token, process.env.JWT_SECRET);

            // Find user by id and get from his data except password, token and confirmed
            // put veterinarian inside request
            req.veterinarian = await Veterinarian.findById(id).select(
                "-password -token -confirmed -expirationToken"
            );

            return next();
        } catch (e) {
            sendErrorResponse(res, e, "checkAuth");
        }
    }

    if (!token) {
        res.status(401).json({ msg: "Unauthorized user" });
        next();
    }
};
