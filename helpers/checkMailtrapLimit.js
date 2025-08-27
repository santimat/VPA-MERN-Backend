const MAILTRAP_TOKEN = process.env.MAILTRAP_API_TOKEN;

export const checkMailtrapUsage = async () => {
    try {
        const res = await fetch("https://mailtrap.io/api/accounts", {
            headers: {
                Authorization: `Bearer ${MAILTRAP_TOKEN}`,
            },
        });
        if (!res.ok) return false;

        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error("Error:", e.message);
    }
};
