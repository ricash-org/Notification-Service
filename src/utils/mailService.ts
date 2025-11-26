import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const mailTransporter = nodemailer.createTransport({
  service: "gmail", // tu peux aussi utiliser mailtrap, outlook, etc.
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendEmail(to: string, subject: string, text: string) {
  try {
    await mailTransporter.sendMail({
      from: `"RICASH" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log(`Email envoyé à ${to}`);
  } catch (error) {
    console.error("Erreur envoi e-mail :", error);
    throw new Error("Erreur lors de l'envoi de l'email");
  }
}
