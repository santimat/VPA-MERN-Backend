export const sendErrorResponse = (res, e, fn, status = 500, userMessage) => {
    console.error(`[${fn}] Error: ${e.message}`);
    res.status(status).json({
        msg:
            userMessage ?? "There has been an error with the server, try later",
    });
};
