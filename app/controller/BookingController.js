const Bookings = require("../models/BookingModel");
const Movies = require("../models/MovieModel");
const MovieTheaterMap = require("../models/MovieTheaterMapModel");
const Screens = require("../models/ScreenModel");
const Theaters = require("../models/TheatreModel");
const Users = require("../models/UserModel");
const { bookingSchema } = require("../rules/bookingRules");
const { sendBookingConfirmationMail, sendBookingCancellationMail } = require("../service/booking.mail");
const { apiResponse, HTTP_STATUS } = require("../utils/response.helper");
const { fetchMovies } = require("./MovieController");
const mongoose = require("mongoose");

class BookingController {
  constructor() {
    this.getTotalBookedSeats = this.getTotalBookedSeats.bind(this);
    this.bookMovie = this.bookMovie.bind(this);
    this.getMovieList = this.getMovieList.bind(this);
  }
  /**
   * Fetches movie list along with showtimes for the given theater id.
   *
   * This method expects a request parameter containing the id of the theater
   * for which the movie list needs to be fetched. The method then calls the
   * fetchMovies method of the MovieController to fetch the movie list and
   * returns the response with the fetched movie data if successful, otherwise
   * an error response is sent.
   *
   * @param {Object} req - Express request object containing the theater id in the params.
   * @param {Object} res - Express response object used to send the response back to the client.
   * @returns {Promise<void>} - Sends a response with the fetched movie data or an error message.
   *
   * API: GET /api/v1/booking/movie/:id
   */
  async getMovieList(req, res) {
    try {
      // Destructuring 'id' from request params
      const { id } = req.params;

      // Validating 'id'
      if (!id) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Required parameter missing");
      }

      // Fetching movie list with show times based on theater ID
      const movies = await fetchMovies(id);

      // If no movies are found, return error
      if (!movies || movies.length === 0) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Movie not found");
      }

      // Iterating over each show time of the first movie
      for (const show_time of movies[0].show_times) {
        // Get the total number of booked seats for the current show
        const totalBookedTickets = await this.getTotalBookedSeats(
          movies[0]._id,         // Movie ID
          show_time.theater_id,       // Theater ID
          show_time._id               // Show time ID
        );

        // Fetch screen details to get total seat count
        const screen = await Screens.findOne({ _id: show_time.screen_id });

        // Check if screen exists before accessing total_seats
        if (!screen) {
          return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Screen not found for show time");
        }

        // Calculate available seats and set it in the show_time object
        show_time.available_seats = Number(Number(screen.seats) - Number(totalBookedTickets));
      }

      // Sending successful response with movie data
      return apiResponse(res, true, HTTP_STATUS.OK, "Movie list fetched successfully", movies[0]);

    } catch (error) {
      // Catching and returning any unexpected server error
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, error.message);
    }
  }



  /**
   * Calculates the total number of booked seats for a given movie, theater, and showtime.
   *
   * This method uses a MongoDB aggregation pipeline to group all bookings for the given
   * movie, theater, and showtime and sum up the number of seats booked. If no bookings are
   * found, it returns 0.
   *
   * @param {string} movieId - The id of the movie for which to calculate the total booked seats.
   * @param {string} theaterId - The id of the theater for which to calculate the total booked seats.
   * @param {string} showTimeId - The id of the showtime for which to calculate the total booked seats.
   * @returns {number} The total number of booked seats or 0 if no bookings are found.
   */
  async getTotalBookedSeats(movieId, theaterId, showTimeId) {
    try {
      const query = [
        {
          $match: {
            movie_id: new mongoose.Types.ObjectId(movieId),     // ✅ Correct usage
            theater_id: new mongoose.Types.ObjectId(theaterId), // ✅ Correct usage
            show_time_id: new mongoose.Types.ObjectId(showTimeId),
            is_deleted: false,
            is_cancelled: false
          }
        },
        {
          $group: {
            _id: null,
            totalSeats: { $sum: "$number_of_seats" }
          }
        }
      ]

      const total = await Bookings.aggregate(query);

      // Return the totalSeats or 0 if no bookings found
      return total.length > 0 ? total[0].totalSeats : 0;

    } catch (error) {
      console.error("Error calculating booked seats:", error);
      throw new Error("Failed to calculate booked seats");
    }
  }


  /**
   * Books a movie for the given show time and theater.
   * 
   * This method expects a request body containing the movie id, theater id, show time id and number of tickets.
   * The method first validates the request body and then verifies if the movie, theater and show time exist.
   * If any errors occur during validation or verification, an error response is sent.
   * 
   * The method then checks if the user has enough available tickets for the given show time and theater.
   * If not enough tickets are available, an error response is sent.
   * 
   * If all verifications pass, the method creates a new booking and returns the booking data in the response.
   * If any errors occur during booking creation, an error response is sent.
   * 
   * @param {Object} req - Express request object containing the movie id, theater id, show time id and number of tickets in the body.
   * @param {Object} res - Express response object used to send the response back to the client.
   * @returns {Promise<void>} - Sends a response with the booking data or an error message.
   * 
   * API: POST /api/v1/booking
   */
  async bookMovie(req, res) {
    try {
      // 1. Validate request payload using Joi schema
      const { error } = bookingSchema.validate(req.body);
      if (error) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, error.details[0].message);
      }

      // 2. Extract required fields from request body
      const { movie_id, theater_id, show_time_id, no_of_tickets } = req.body;

      // 3. Get user ID from authenticated request
      const user_id = req?.user?.id;
      if (!user_id) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "User not found");
      }

      // 4. Validate that the movie exists
      const movie = await Movies.findOne({ _id: movie_id });
      if (!movie) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Movie not found");
      }

      // 5. Fetch the MovieTheaterMap entry with matching movie, theater, and show_time._id
      const movieShowTime = await MovieTheaterMap.findOne({
        movie_id,
        theater_id,
        "show_time._id": show_time_id
      });

      if (!movieShowTime) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Show time not found");
      }

      // 6. Get the specific show_time object using its _id
      const selectedShowTime = movieShowTime.show_time.find(
        st => st._id.toString() === show_time_id.toString()
      );
      console.log("selectedShowTime", selectedShowTime)
      if (!selectedShowTime) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Exact show time not found");
      }

      // 7. Calculate total number of already booked seats for this movie, theater, and show time
      const totalBooked = await this.getTotalBookedSeats(movie_id, theater_id, show_time_id);

      // 8. Compute total seats already booked
      const totalSeatsBooked = totalBooked;

      // 9. Define total available seats (can be dynamic or fixed per show)
      const totalAvailableSeats = movieShowTime.seats || 100; // Default to 100 if not defined

      // 10. Calculate how many seats are still available
      const remainingSeats = totalAvailableSeats - totalSeatsBooked;

      // 11. Check if enough seats are available for this booking
      if (remainingSeats < no_of_tickets) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Tickets not available");
      }

      // 12. Calculate total price based on selected show_time's price
      const total_price = selectedShowTime.price * no_of_tickets;

      // 13. Create a new booking entry
      const newBooking = await Bookings.create({
        user_id,
        movie_id,
        theater_id,
        show_time_id,
        number_of_seats: no_of_tickets,
        price: total_price
      });

      if (!newBooking) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Booking failed");
      }

      // getting user details
      const user = await Users.findOne({ _id: user_id });
      // getting theater details
      const theater = await Theaters.findOne({ _id: theater_id });
      // getting screen details
      const screen = await Screens.findOne({ _id: selectedShowTime.screen_id });
      // sending booking confirmation mail
      await sendBookingConfirmationMail(user, {
        movieTitle: movie.title,
        theaterName: theater.name,
        screen: screen.name,
        seats: no_of_tickets,
        date: new Date(newBooking.createdAt).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        time: new Date(selectedShowTime.start_time).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
      });

      // 14. Return success response with new booking details
      return apiResponse(res, true, HTTP_STATUS.OK, "Booking successful", newBooking);
    } catch (error) {
      // 15. Handle any unexpected errors
      console.error("Booking error:", error);
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, error.message);
    }
  }


  /**
   * Cancels a booking.
   *
   * This method expects a request with the booking id in the params.
   * The method first validates the booking id, then checks if the booking
   * exists and if it's already cancelled. If the booking is eligible for
   * cancellation, the method updates the booking status to cancelled and
   * returns a success response. If any errors occur, an error response is
   * sent instead.
   *
   * @param {Object} req - Express request object containing the booking id in the params.
   * @param {Object} res - Express response object used to send the response back to the client.
   * @returns {Promise<void>} - Sends a response with the updated booking data or an error message.
   *
   * API: PUT /api/v1/booking/:id
   */
  async cancelBooking(req, res) {
    try {
      // getting id from param
      const { id } = req.params;
      // validating id
      if (!id) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Required parameter missing");
      }
      // getting movie and checking movie is present or not and if present deleting movie poster
      const booking = await Bookings.findOne({ _id: id });
      if (!booking) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Booking not found");
      }
      // checking movie poster is vailable or not
      if (booking.is_cancelled) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Booking already cancelled");
      }
      // updating booking
      const updatedBooking = await Bookings.findOneAndUpdate({ _id: id }, { is_cancelled: true }, { new: true });
      if (!updatedBooking) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Failed to cancel booking");
      }
      // getting user id
      const user_id = req.user.id;
      // getting user details
      const user = await Users.findOne({ _id: user_id });
      // getting movie details
      const movie = await Movies.findOne({ _id: booking.movie_id });
      // getting theater details
      const theater = await Theaters.findOne({ _id: booking.theater_id });
      // getting show time details
      const movieShowTime = await MovieTheaterMap.findOne({ "show_time._id": booking.show_time_id });
      // 6. Get the specific show_time object using its _id
      const selectedShowTime = movieShowTime.show_time.find(
        st => st._id.toString() === booking.show_time_id.toString()
      );
      // getting screen details
      const screen = await Screens.findOne({ _id: selectedShowTime.screen_id });
      // getting no of tickets
      const no_of_tickets = booking.number_of_seats;
      // sending cancelled email
      await sendBookingCancellationMail(user, {
        movieTitle: movie.title,
        theaterName: theater.name,
        screen: screen.name,
        seats: no_of_tickets,
        date: new Date(booking.createdAt).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        time: new Date(selectedShowTime.start_time).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
      })
      // returning response
      return apiResponse(res, true, HTTP_STATUS.OK, "Booking cancelled successfully", updatedBooking);
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, error.message);
    }
  }


  /**
   * Fetches the booking history for the given user.
   *
   * This method executes an aggregation query that first filters out the bookings
   * for the given user. It then performs a lookup on the movies, theaters, and
   * MovieTheaterMap collections to get the associated movie, theater, and show
   * time data. The lookup result is then filtered to only include the show time
   * which matches the booking's show time id. The final response contains the
   * booking data with the associated movie, theater, and show time information.
   * If any errors occur during the process, an error response is sent instead.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object used to send the response back to the client.
   * @returns {Promise<void>} - Sends a response with the fetched booking history data or an error message.
   *
   * API: GET /api/v1/booking/history
   */
  async bookingHistory(req, res) {
    try {
      // getting id from request
      const user_id = req?.user?.id;
      // preparing aggregation query
      const query = [
        {
          $match: {
            user_id: new mongoose.Types.ObjectId(user_id),
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
            as: "mtm"
          }
        },
        { $unwind: "$mtm" },
        {
          $addFields: {
            matched_show_time: {
              $first: {
                $filter: {
                  input: "$mtm.show_time",
                  as: "st",
                  cond: { $eq: ["$$st._id", "$show_time_id"] }
                }
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            movie_title: "$movie.title",
            genre: "$movie.genre",
            language: "$movie.language",
            theater_name: "$theater.name",
            theater_location: "$theater.location",
            number_of_seats: 1,
            price: 1,
            status: {
              $cond: {
                if: { $eq: ["$is_cancelled", true] },
                then: "Cancelled",
                else: "Booked"
              }
            },
            show_start_time: "$matched_show_time.start_time",
            show_end_time: "$matched_show_time.end_time",
            screen_id: "$matched_show_time.screen_id"
          }
        }
      ];

      // getting booking list
      const bookingList = await Bookings.aggregate(query);
      if (!bookingList || bookingList.length === 0) {
        return apiResponse(res, false, HTTP_STATUS.OK, "No booking yet");
      }
      // returning response
      return apiResponse(res, true, HTTP_STATUS.OK, "Booking history", bookingList);
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, error.message);
    }
  }
}

module.exports = new BookingController();