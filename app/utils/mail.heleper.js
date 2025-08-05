// app/utils/mail.helper.js
const transporter = require("../config/mailConfig"); // ✅ Correct import
const dotenv = require("dotenv");
dotenv.config();

const sendMail = async (mailTo, subject, message) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.MAIL_USER}>`,
      to: mailTo,
      subject,
      html: message,
    });

    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendMail;
