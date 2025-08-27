import nodemailer from "nodemailer";
import { checkMailtrapUsage } from "./checkMailtrapLimit.js";

export const emailRegister = async ({ email, name, token }) => {
    if (await checkMailtrapUsage()) {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Send the email
        const info = await transporter.sendMail({
            from: "VPA - Veterinarian patients administrator",
            to: email,
            subject: "Confirm email",
            text: "Confirm your account in VPA",
            html: `<p>Hi ${name}!, confirm your account in VPA.</p>
            <p>Your account is ready. All you have to do is confirm it at the following link:
                <a href="${process.env.FRONTEND_URL}/confirm/${token}">Confirm Account</a>
            </p>
            <p>If you dont create this account then ignore this message</p>  
        `,
        });

        console.log(`Message sent ${info.messageId}`);
    }
};
