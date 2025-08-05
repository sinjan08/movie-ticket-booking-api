// app/config/mailConfig.js
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Mail configuration error:", error);
  } else {
    console.log("Mail server is ready to take messages");
  }
});

module.exports = transporter; // ❗ Do NOT wrap in { transporter }
