const Movies = require("../models/MovieModel");
const { apiResponse, HTTP_STATUS } = require("../utils/response.helper");

class ReportController {

  async getMovieWiseTotalBooking(req, res) {
    try {
      // prepare aggregation query
      const query = [
        {
          $match: {
            is_deleted: false
          }
        },
        {
          $lookup: {
            from: "bookings",
            localField: "_id",
            foreignField: "movie_id",
            as: "bookings"
          }
        },
        {
          $unwind: {
            path: "$bookings",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: "$_id",
            title: { $first: "$title" },
            total_booked_seats: {
              $sum: {
                $cond: [
                  {
                    $gt: [
                      "$bookings.number_of_seats",
                      0
                    ]
                  },
                  "$bookings.number_of_seats",
                  0
                ]
              }
            },
            box_office_collection: {
              $sum: {
                $cond: [
                  {
                    $gt: [
                      "$bookings.price",
                      0
                    ]
                  },
                  "$bookings.price",
                  0
                ]
              }
            },
            genre: { $first: "$genre" },
            language: { $first: "$language" },
            genre: { $first: "$genre" }
          }
        },
        {
          $sort: {
            total_booked_seats: -1
          }
        },
      ];

      // get movie wise total booking
      const movieWiseTotalBooking = await Movies.aggregate(query);
      return apiResponse(res, true, HTTP_STATUS.SUCCESS, "Movie Wise Total Booking", movieWiseTotalBooking);
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, "Failed to get movie wise total booking: " + error.message);
    }
  }
}

module.exports = new ReportController();