const sendMail = require("../utils/mail.heleper");
const dotenv = require("dotenv");
dotenv.config();

/**
 * Sends a booking confirmation email to the user.
 *
 * @param {Object} user - The user object.
 * @param {string} user.name - The user's name.
 * @param {string} user.email - The user's email.
 * @param {Object} booking - The booking details.
 * @param {string} booking.movieTitle - The title of the movie.
 * @param {string} booking.theaterName - The name of the theater.
 * @param {string} booking.screen - The screen number/name.
 * @param {string} booking.seats - Comma-separated seat numbers.
 * @param {string} booking.date - Date of the show (formatted).
 * @param {string} booking.time - Show time.
 */
const sendBookingConfirmationMail = async (user, booking) => {
  try {
    const mailTo = user.email;
    const subject = "🎟️ Your Movie Booking is Confirmed!";
    const message = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Booking Confirmed</title>
      <style>
        body {
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .header {
          background-color: #2d2dff;
          color: #ffffff;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
        }
        .content {
          padding: 30px 20px;
          color: #333333;
        }
        .content p {
          line-height: 1.6;
        }
        .ticket {
          background-color: #f9f9f9;
          border: 1px dashed #cccccc;
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
        }
        .ticket h3 {
          margin: 0 0 10px;
          font-size: 18px;
          color: #444;
        }
        .ticket p {
          margin: 4px 0;
        }
        .footer {
          text-align: center;
          font-size: 13px;
          color: #888888;
          padding: 20px;
          background-color: #f0f0f0;
        }
        @media (max-width: 600px) {
          .header h1 {
            font-size: 22px;
          }
          .content {
            padding: 20px 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hey <strong>${user.name}</strong>,</p>
          <p>Your movie booking is all set. Grab your popcorn and get ready for an awesome time! 🍿</p>
          <div class="ticket">
            <h3>🎬 Booking Details</h3>
            <p><strong>Movie:</strong> ${booking.movieTitle}</p>
            <p><strong>Theater:</strong> ${booking.theaterName}</p>
            <p><strong>Screen:</strong> ${booking.screen}</p>
            <p><strong>Seats:</strong> ${booking.seats}</p>
            <p><strong>Date:</strong> ${booking.date}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
          </div>
          <p>We’ll see you at the movies! If you need to manage your booking, head to your account.</p>
          <p>— Sinjan’s Movie Ticket Booking Team 🎥</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Sinjan’s Movie Ticket Booking. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;
    await sendMail(mailTo, subject, message);
  } catch (error) {
    throw new Error("Error sending booking confirmation email: " + error.message);
  }
};


/**
 * Sends a booking cancellation email to the user.
 *
 * @param {Object} user - The user object.
 * @param {string} user.name - The user's name.
 * @param {string} user.email - The user's email.
 * @param {Object} booking - The booking details.
 * @param {string} booking.movieTitle - The title of the movie.
 * @param {string} booking.theaterName - The name of the theater.
 * @param {string} booking.screen - The screen number/name.
 * @param {string} booking.seats - Comma-separated seat numbers.
 * @param {string} booking.date - Date of the show (formatted).
 * @param {string} booking.time - Show time.
 */
const sendBookingCancellationMail = async (user, booking) => {
  try {
    const mailTo = user.email;
    const subject = "❌ Your Movie Booking Has Been Cancelled";
    const message = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Booking Cancelled</title>
      <style>
        body {
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .header {
          background-color: #d32f2f;
          color: #ffffff;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
        }
        .content {
          padding: 30px 20px;
          color: #333333;
        }
        .content p {
          line-height: 1.6;
        }
        .ticket {
          background-color: #fff0f0;
          border: 1px dashed #e57373;
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
        }
        .ticket h3 {
          margin: 0 0 10px;
          font-size: 18px;
          color: #b71c1c;
        }
        .ticket p {
          margin: 4px 0;
        }
        .footer {
          text-align: center;
          font-size: 13px;
          color: #888888;
          padding: 20px;
          background-color: #f0f0f0;
        }
        @media (max-width: 600px) {
          .header h1 {
            font-size: 22px;
          }
          .content {
            padding: 20px 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Cancelled</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>We're sorry to inform you that your movie booking has been successfully cancelled. 😔</p>
          <div class="ticket">
            <h3>🎬 Cancelled Booking Details</h3>
            <p><strong>Movie:</strong> ${booking.movieTitle}</p>
            <p><strong>Theater:</strong> ${booking.theaterName}</p>
            <p><strong>Screen:</strong> ${booking.screen}</p>
            <p><strong>Seats:</strong> ${booking.seats}</p>
            <p><strong>Date:</strong> ${booking.date}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
          </div>
          <p>If this was a mistake or you'd like to book again, feel free to return to our platform anytime.</p>
          <p>Thank you for using Sinjan’s Movie Ticket Booking! 🎥</p>
          <p>— The Sinjan’s Movie Ticket Booking Team</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Sinjan’s Movie Ticket Booking. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;
    await sendMail(mailTo, subject, message);
  } catch (error) {
    throw new Error("Error sending booking cancellation email: " + error.message);
  }
};


/**
 * Sends the booking history email with status for each booking.
 *
 * @param {Object} user - The user details.
 * @param {string} user.name - User's full name.
 * @param {string} user.email - User's email address.
 * @param {Array<Object>} bookings - List of booking entries.
 * Each booking object contains:
 *    movieTitle, theaterName, screen, seats, date, time, status (BOOKED | CANCELLED)
 */
const sendBookingHistoryMail = async (user, bookings = []) => {
  try {
    const mailTo = user.email;
    const subject = "📋 Your Booking History - Sinjan's Movie Ticket Booking";

    // generating table rows
    const rows = bookings
      .map(
        (b, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${b.movie_title}</td>
          <td>${b.theater_name}</td>
          <td>${b.screen_name}</td>
          <td>${b.number_of_seats}</td>
          <td>${parseFloat(b.total_amount)}</td>
          <td>${new Date(b.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
          <td>${new Date(b.show_start_time).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</td>
          <td style="color: ${b.status === "CANCELLED" ? "#d32f2f" : "#388e3c"}; font-weight: bold;">
            ${b.status}
          </td>
        </tr>
      `
      )
      .join("");

    const message = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Booking History</title>
      <style>
        body {
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }
        .container {
          max-width: 800px;
          margin: 30px auto;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          overflow-x: auto;
        }
        .header {
          background-color: #1976d2;
          color: #ffffff;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
        }
        .content {
          padding: 30px 20px;
          color: #333333;
        }
        .content p {
          line-height: 1.6;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        table th, table td {
          border: 1px solid #dddddd;
          text-align: center;
          padding: 10px;
          font-size: 14px;
        }
        table th {
          background-color: #f0f0f0;
        }
        .footer {
          text-align: center;
          font-size: 13px;
          color: #888888;
          padding: 20px;
          background-color: #f0f0f0;
        }
        @media (max-width: 600px) {
          table, thead, tbody, th, td, tr {
            display: block;
          }
          table tr {
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 10px;
          }
          table td {
            text-align: left;
            padding: 8px 10px;
            border: none;
          }
          table td::before {
            content: attr(data-label);
            font-weight: bold;
            display: block;
            margin-bottom: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Booking History</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Here’s a summary of your recent movie bookings with Sinjan’s Movie Ticket Booking. 🎬</p>
          ${bookings.length === 0
        ? "<p><em>No booking records found.</em></p>"
        : `
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Movie</th>
                    <th>Theater</th>
                    <th>Screen</th>
                    <th>Seats</th>
                    <th>Total Amount</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            `
      }
          <p>If you have any questions or need help with your bookings, feel free to contact our support team.</p>
          <p>— The Sinjan’s Movie Ticket Booking Team 🎥</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Sinjan’s Movie Ticket Booking. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;

    await sendMail(mailTo, subject, message);
  } catch (error) {
    throw new Error("Error sending booking history email: " + error.message);
  }
};


module.exports = {
  sendBookingConfirmationMail,
  sendBookingCancellationMail,
  sendBookingHistoryMail
};
