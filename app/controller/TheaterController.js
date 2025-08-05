const { pipeline } = require("nodemailer/lib/xoauth2");
const Movies = require("../models/MovieModel");
const MovieTheaterMap = require("../models/MovieTheaterMapModel");
const Screens = require("../models/ScreenModel");
const Theaters = require("../models/TheatreModel");
const { theaterSchema, assignMovieTheaterSchema } = require("../rules/theaterRules");
const { HTTP_STATUS, apiResponse } = require("../utils/response.helper");

class TheaterController {
  /**
   * Creates a new theater entry in the database.
   * 
   * This method expects a request containing details about the theater
   * such as name, location, and an array of screen objects each containing the
   * screen name and seats count. The request body is validated against the
   * defined schema, and any errors result in an appropriate error response.
   * 
   * If the theater is created successfully, the corresponding screens are
   * created and linked to the theater. A response with the newly created
   * theater data is sent back to the client. If any errors occur, an error
   * response is sent instead.
   * 
   * @param {Object} req - Express request object containing theater details in the body.
   * @param {Object} res - Express response object used to send the response back to the client.
   * @returns {Promise<void>} - Sends a response with the created theater data or an error message.
   * 
   * API: POST /api/v1/theater/create
   */
  async addTheater(req, res) {
    try {
      // vsalidating payload
      const { error } = theaterSchema.validate(req.body);
      if (error) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, error.details[0].message);
      }
      //destructuring payload
      const { name, location, screens } = req.body;
      //creating theater
      const theater = await Theaters.create({ name, location });
      // checking theater is created or not
      if (!theater) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Failed to create theater");
      }
      const theater_id = theater._id;
      // adding screens
      for (let i = 0; i < screens.length; i++) {
        const { screen_name, seats } = screens[i];
        const isScreenExist = await Screens.findOne({ name: screen_name, theater_id });
        if (isScreenExist) {
          continue;
        }
        // saving screen
        const saveScreen = await Screens.create({ name: screen_name, seats, theater_id });
        if (!saveScreen) {
          return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, `Failed to create screen: ${screen_name}`);
        }
      }
      // returning response
      return apiResponse(res, true, HTTP_STATUS.CREATED, "Theater created successfully", theater);
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, error.message);
    }
  }


  /**
   * Fetches all the theaters from the database.
   * 
   * This method executes an aggregation query that first filters out the deleted theaters
   * and then performs a lookup on the screens collection to get the associated screens.
   * The lookup result is then filtered to only include the screens which are not deleted.
   * The final response contains the theater data with an array of associated screens.
   * If any errors occur during the process, an error response is sent instead.
   * 
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object used to send the response back to the client.
   * @returns {Promise<void>} - Sends a response with the fetched theaters data or an error message.
   * 
   * API: GET /api/v1/theater
   */
  async getTheaters(req, res) {
    try {
      // preparing aggregatin query
      const query = [
        { $match: { is_deleted: false } },
        {
          $lookup: {
            from: "screens",
            localField: "_id",
            foreignField: "theater_id",
            as: "screens"
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            location: 1,
            screens: {
              $map: {
                input: {
                  $filter: {
                    input: "$screens",
                    as: "screen",
                    cond: { $eq: ["$$screen.is_deleted", false] }
                  }
                },
                as: "screen",
                in: {
                  screen_id: "$$screen._id",
                  screen_name: "$$screen.name",
                  seats: "$$screen.seats"
                }
              }
            }
          }
        }
      ];

      // executing
      const theaters = await Theaters.aggregate(query);
      // returning
      return apiResponse(res, true, HTTP_STATUS.OK, "Theaters fetched successfully", theaters);
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, error.message);
    }
  }


  /**
   * Fetches all the screens associated with the given theater id.
   * 
   * This method expects a request parameter containing the theater id.
   * The method validates the parameter and returns an appropriate error
   * response if it's invalid. If the parameter is valid, the method retrieves
   * the screens associated with the given theater id and returns them in the
   * response.
   * 
   * @param {Object} req - Express request object containing theater id in the params.
   * @param {Object} res - Express response object used to send the response back to the client.
   * @returns {Promise<void>} - Sends a response with the screens associated with the given theater id or an error message.
   * 
   * API: GET /api/v1/theater/:theater_id/screens
   */
  async screensByTheaterId(req, res) {
    try {
      // destructuring params
      const { theater_id } = req.params;
      // validating params
      if (!theater_id) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Required parameter missing");
      }
      // getting screens
      const screens = await Screens.find({ theater_id }, { _id: 1, name: 1, seats: 1 }).sort({ name: 1 });
      // returning response
      return apiResponse(res, true, HTTP_STATUS.OK, "Screens fetched successfully", screens);
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, error.message);
    }
  }


  /**
   * Assigns a movie to a theater by creating a mapping between the two.
   * 
   * This method expects a request body containing the movie id and theater id.
   * The method validates the request body and returns an appropriate error
   * response if it's invalid. If the request body is valid, the method creates a
   * new mapping between the movie and theater and returns the mapping in the
   * response.
   * 
   * @param {Object} req - Express request object containing movie id and theater id in the body.
   * @param {Object} res - Express response object used to send the response back to the client.
   * @returns {Promise<void>} - Sends a response with the movie to theater mapping or an error message.
   * 
   * API: POST /api/v1/theater/assign-movie
   */
  async assignMovieToTheater(req, res) {
    try {
      // validating payload
      const { error } = assignMovieTheaterSchema.validate(req.body);
      if (error) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, error.details[0].message);
      }
      // getting payload
      const { theater_id, movie_id, show_time } = req.body;
      // checking theater is present or not
      const theater = await Theaters.findOne({ _id: theater_id });
      if (!theater) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Theater not found");
      }
      // checking movie is present or not
      const movie = await Movies.findOne({ _id: movie_id });
      if (!movie) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Movie not found");
      }
      // looping show time
      for (let i = 0; i < show_time.length; i++) {
        // checking screen is present or not
        const screen = await Screens.findOne({ _id: show_time[i].screen_id });
        if (!screen) {
          return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Screen ID not found for array index: " + i);
        }
        // checking already is there any movie with the start time in same screen
        const runningMovie = await MovieTheaterMap.findOne({
          theater_id,
          show_time: {
            $elemMatch: {
              screen_id: show_time[i].screen_id,
              start_time: show_time[i].start_time
            }
          }
        });
        if (runningMovie) {
          return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, `Movie already assigned to this screen at this time. Theater: ${theater.name}, Screen: ${screen.name}, Start Time: ${show_time[i].start_time}`);
        }
        // calculating end time
        const startTime = new Date(show_time[i].start_time);
        const endTime = new Date(startTime.getTime() + movie.duration * 60 * 1000);
        // Format to YYYY-MM-DD HH:MM:SS
        const formattedEndTime = endTime.getFullYear() + '-' +
          String(endTime.getMonth() + 1).padStart(2, '0') + '-' +
          String(endTime.getDate()).padStart(2, '0') + ' ' +
          String(endTime.getHours()).padStart(2, '0') + ':' +
          String(endTime.getMinutes()).padStart(2, '0') + ':' +
          String(endTime.getSeconds()).padStart(2, '0');
        // appending end time in show time
        show_time[i].end_time = formattedEndTime;
      }
      // adding movie to theater
      const movieTheaterMap = await MovieTheaterMap.create({ movie_id, theater_id, show_time });
      if (!movieTheaterMap) {
        return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, "Failed to assign movie to theater");
      }
      return apiResponse(res, true, HTTP_STATUS.OK, "Movie assigned to theater successfully", movieTheaterMap);
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, error.message);
    }
  }
}

module.exports = new TheaterController();