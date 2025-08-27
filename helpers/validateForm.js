export const validateForm = (email, password) => {
    if (!email?.trim() || !password?.trim())
        return {
            status: 400,
            json: { msg: "Email and password are required" },
        };

    if (password?.length < 6)
        return {
            status: 422,
            json: { msg: "Password is too short" },
        };

    return null;
};
