const sendMail = require("../utils/mail.heleper");
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
dotenv.config();

/**
 * Sends a signup email to a new user with a verification link.
 *
 * @param {Object} user - The user object containing user details.
 * @param {string} user.id - The unique identifier of the user.
 * @param {string} user.email - The email address of the user.
 * @param {string} user.name - The name of the user.
 *
 * @throws Will throw an error if there is an issue sending the email.
 */
const sendSignupMail = async (user) => {
  try {
    // getting mail to
    const mailTo = user.email;
    // email subject
    const subject = "🎉 Welcome to Sinjan's's Movie Ticket Booking Assessment";
    // generating verification token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    // generating verification link
    const verificationLink = `${process.env.APP_URL}:${process.env.PORT}/api/v1/auth/verify/${token}`;
    // preparing html email body
    const message = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Verify Your Email</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        .header {
          background-color: #ff4b2b;
          color: #ffffff;
          text-align: center;
          padding: 30px 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
        }
        .content {
          padding: 30px 20px;
          color: #333;
        }
        .content p {
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          margin: 20px 0;
          padding: 12px 25px;
          font-size: 16px;
          background-color: #ff4b2b;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
        }
        .footer {
          text-align: center;
          font-size: 13px;
          color: #888;
          padding: 20px;
          background-color: #f9f9f9;
        }
        @media (max-width: 600px) {
          .header h1 {
            font-size: 22px;
          }
          .content {
            padding: 20px 15px;
          }
          .button {
            padding: 10px 20px;
            font-size: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome, ${user.name}!</h1>
        </div>
        <div class="content">
          <p>Thank you for joining <strong>Sinjan's's Movie Ticket Booking Assessment</strong> 🎬</p>
          <p>We’re excited to have you on board! To complete your signup, please verify your email address:</p>
          <p style="text-align: center;">
            <a href="${verificationLink}" class="button">Verify Email</a>
          </p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${verificationLink}">${verificationLink}</a></p>
          <p>If you didn’t sign up, you can safely ignore this email.</p>
          <p>See you at the movies! 🍿</p>
          <p>— The Sinjan's Movie Ticket Booking Team</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Sinjan's's Movie Ticket Booking. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;
    // finally sending mail
    await sendMail(mailTo, subject, message);
  } catch (error) {
    throw new Error("Error sending signup mail: " + error.message);
  }
};

module.exports = {
  sendSignupMail
};

