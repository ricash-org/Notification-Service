"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailTransporter = void 0;
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.mailTransporter = nodemailer_1.default.createTransport({
    service: "gmail", // tu peux aussi utiliser mailtrap, outlook, etc.
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});
async function sendEmail(to, subject, text) {
    try {
        await exports.mailTransporter.sendMail({
            from: `"RICASH" <${process.env.MAIL_USER}>`,
            to,
            subject,
            text,
        });
        console.log(`Email envoyé à ${to}`);
    }
    catch (error) {
        console.error("Erreur envoi e-mail :", error);
        throw new Error("Erreur lors de l'envoi de l'email");
    }
}
