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
    const subject = "🎉 Welcome to Sinjan's Movie Ticket Booking Assessment";
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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f2ffeb;
      font-family: 'Inter', sans-serif;
      color: #333333;
    }
    .email-wrapper {
      width: 100%;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
    .header {
      background-color: #88ab75;
      color: #ffffff;
      text-align: center;
      padding: 30px 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
    }
    .content p {
      font-size: 15px;
      line-height: 1.7;
      margin-bottom: 20px;
    }
    .button-wrapper {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 28px;
      background-color: #eddb2f;
      color: #333333;
      text-decoration: none;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 600;
    }
    .footer {
      background-color: #f0f2f5;
      text-align: center;
      font-size: 13px;
      color: #888;
      padding: 20px;
    }
    a {
      color: #88ab75;
      word-break: break-word;
    }
    @media (max-width: 600px) {
      .content {
        padding: 20px;
      }
      .button {
        padding: 10px 24px;
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <h1>Welcome, ${user.name}!</h1>
      </div>
      <div class="content">
        <p>Thank you for signing up for <strong>Sinjan's Movie Ticket Booking Assessment</strong> 🎬</p>
        <p>To get started, please verify your email address by clicking the button below:</p>
        <div class="button-wrapper">
          <a href="${verificationLink}" class="button">Verify Email</a>
        </div>
        <p>If the button above doesn’t work, you can also copy and paste the following link into your browser:</p>
        <p><a href="${verificationLink}">${verificationLink}</a></p>
        <p>If you did not sign up, you can safely ignore this email.</p>
        <p>Looking forward to seeing you at the movies! 🍿</p>
        <p>— The Sinjan’s Movie Booking Team</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Sinjan's Movie Ticket Booking. All rights reserved.
      </div>
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

