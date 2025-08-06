const Bookings = require("../models/BookingModel");
const Movies = require("../models/MovieModel");
const Users = require("../models/UserModel");
const { sendBookingHistoryMail } = require("../service/booking.mail");
const { apiResponse, HTTP_STATUS } = require("../utils/response.helper");
const mongoose = require("mongoose");

class ReportController {
  /**
   * Fetches the total booking details for each movie.
   *
   * This method executes an aggregation query on the Bookings collection to
   * calculate the total number of booked seats and total ticket price for each
   * movie. It first filters out the deleted and cancelled bookings, then groups
   * the bookings by movie id. The result is enriched with movie details such as
   * title, genre, and language by joining with the Movies collection. The final
   * response is sorted by the total number of booked seats in descending order.
   * If any errors occur during the process, an error response is sent instead.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object used to send the response back to the client.
   * @returns {Promise<void>} - Sends a response with the movie wise total booking data or an error message.
   * 
   * API: GET /api/v1/report/movie
   */
  async getMovieWiseTotalBooking(req, res) {
    try {
      // prepare aggregation query
      const query = [
        {
          $match: {
            is_deleted: false,
            is_cancelled: false
          }
        },
        {
          $group: {
            _id: "$movie_id",
            total_booked_seats: { $sum: "$number_of_seats" },
            total_ticket_price: { $sum: "$price" }
          }
        },
        {
          $lookup: {
            from: "movies",
            localField: "_id",
            foreignField: "_id",
            as: "movie"
          }
        },
        {
          $unwind: "$movie"
        },
        {
          $project: {
            _id: 0,
            movie_id: "$_id",
            title: "$movie.title",
            genre: "$movie.genre",
            language: "$movie.language",
            total_booked_seats: 1,
            total_ticket_price: 1
          }
        },
        {
          $sort: { total_booked_seats: -1 }
        }
      ];

      // get movie wise total booking
      const movieWiseTotalBooking = await Bookings.aggregate(query);
      return apiResponse(res, true, HTTP_STATUS.SUCCESS, "Movie Wise Total Booking", movieWiseTotalBooking);
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, "Failed to get movie wise total booking: " + error.message);
    }
  }


  /**
   * Fetches theater wise booking details.
   * 
   * This method executes an aggregation query that first filters out the deleted and cancelled bookings.
   * It then groups all bookings by theater id and calculates the total number of booked seats and total price collected.
   * The result is then looked up with the theaters collection to get the associated theater data.
   * The final response contains the theater data with the associated booking details.
   * If any errors occur during the process, an error response is sent instead.
   * 
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object used to send the response back to the client.
   * @returns {Promise<void>} - Sends a response with the fetched theater wise booking data or an error message.
   * 
   * API: GET /api/v1/report/theater
   */
  async getTheaterWiseBooking(req, res) {
    try {
      // preparing aggregation query
      const query = [
        {
          $match: {
            is_deleted: false,
            is_cancelled: false
          }
        },
        {
          $group: {
            _id: "$theater_id",
            total_booked_seats: { $sum: "$number_of_seats" },
            total_price_collected: { $sum: "$price" }
          }
        },
        {
          $lookup: {
            from: "theatres",
            localField: "_id",
            foreignField: "_id",
            as: "theater"
          }
        },
        {
          $unwind: {
            path: "$theater",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 0,
            theater_id: "$_id",
            theater_name: "$theater.name",
            theater_location: "$theater.location",
            total_booked_seats: 1,
            total_price_collected: 1
          }
        },
        {
          $sort: {
            total_booked_seats: -1
          }
        }
      ];

      // get theater wise booking
      const theaterWiseBooking = await Bookings.aggregate(query);
      return apiResponse(res, true, HTTP_STATUS.SUCCESS, "Theater Wise Booking", theaterWiseBooking);
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, "Failed to get theater wise booking: " + error.message);
    }
  }


  async getUserWiseBookingSummary(req, res) {
    try {
      // getting user id from param
      const id = req.user.id;
      const user = await Users.findOne({ _id: id });
      if (!user) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "User not found");
      }
      // prepare aggregation query
      const query = [
        {
          $match: {
            user_id: new mongoose.Types.ObjectId(id),
            is_deleted: false
          }
        },
        {
          $lookup: {
            from: "movies",
            localField: "movie_id",
            foreignField: "_id",
            as: "movie"
          }
        },
        { $unwind: "$movie" },
        {
          $lookup: {
            from: "theatres",
            localField: "theater_id",
            foreignField: "_id",
            as: "theater"
          }
        },
        { $unwind: "$theater" },
        {
          $lookup: {
            from: "movietheatermaps",
            localField: "show_time_id",
            foreignField: "show_time._id",
            as: "movie_theater_map"
          }
        },
        {
          $unwind: {
            path: "$movie_theater_map",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            show_time_detail: {
              $first: {
                $filter: {
                  input: "$movie_theater_map.show_time",
                  as: "show",
                  cond: { $eq: ["$$show._id", "$show_time_id"] }
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: "screens",
            localField: "show_time_detail.screen_id",
            foreignField: "_id",
            as: "screen"
          }
        },
        {
          $unwind: {
            path: "$screen",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 0,
            booking_id: "$_id",
            movie_title: "$movie.title",
            theater_name: "$theater.name",
            theater_location: "$theater.location",
            screen_name: "$screen.name",
            number_of_seats: 1,
            price: 1,
            total_amount: {
              $multiply: ["$price", "$number_of_seats"]
            },
            status: {
              $cond: { if: "$is_cancelled", then: "Cancelled", else: "Booked" }
            },
            show_start_time: "$show_time_detail.start_time",
            show_end_time: "$show_time_detail.end_time",
            createdAt: 1
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ];


      // get user wise booking summary
      const userWiseBookingSummary = await Bookings.aggregate(query);
      // return apiResponse(res, true, HTTP_STATUS.SUCCESS, "User Wise Booking Summary", userWiseBookingSummary);
      // sending summary to user mail
      await sendBookingHistoryMail(user, userWiseBookingSummary);

      return apiResponse(res, true, HTTP_STATUS.SUCCESS, "User Wise Booking Summary mail sent successfully");
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, "Failed to get user wise booking summary: " + error.message);
    }
  }
}

module.exports = new ReportController();