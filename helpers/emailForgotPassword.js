import nodemailer from "nodemailer";
import { checkMailtrapUsage } from "./checkMailtrapLimit.js";
export const emailForgotPassword = async ({ email, name, token }) => {
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
            subject: "Recover your password",
            text: "Recover password",
            html: `<p>Hi ${name}!, you have requested to reset your password.</p>
            <p>To reset your password all you have to do is following link:
                <a href="${process.env.FRONTEND_URL}/forgot-password/${token}">Reset Password</a>
            </p>
            <p>If you dont create this account then ignore this message</p>  
        `,
        });

        console.log(`Message sent ${info.messageId}`);
    }
};
