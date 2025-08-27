import jwt from "jsonwebtoken";

export const generateJWT = (id) => {
    // Create a new Json Web Token
    return jwt.sign(
        // Structure
        { id },
        // Secret word
        process.env.JWT_SECRET,
        {
            expiresIn: "30d",
        }
    );
};
