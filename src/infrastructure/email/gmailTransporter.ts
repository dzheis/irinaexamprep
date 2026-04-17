import nodemailer from "nodemailer";

export function createGmailTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env["EMAIL_USER"], pass: process.env["EMAIL_PASS"] },
  });
}
