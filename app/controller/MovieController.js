const Movies = require("../models/MovieModel");
const { movieCreateSchema } = require("../rules/movieRules");
const { apiResponse, HTTP_STATUS } = require("../utils/response.helper");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

class MovieController {
  constructor() {
    this.fetchMovies = this.fetchMovies.bind(this);
    this.getMovieShoTimes = this.getMovieShoTimes.bind(this);
  }

  /**
   * Creates a new movie entry in the database.
   *
   * This method expects a request containing details about the movie
   * such as title, description, genre, language, duration, cast, director,
   * release date, and an optional poster image. The request body is validated
   * against the defined schema, and any errors result in an appropriate error response.
   *
   * If the cast field is provided as a JSON string, it is parsed into an array.
   * The poster image, if uploaded, is saved and its filename is stored in the movie entry.
   *
   * Upon successful creation, a response with the newly created movie data is returned.
   * In case of any failures, an error response is sent.
   *
   * @param {Object} req - Express request object containing movie details and optional file.
   * @param {Object} res - Express response object used to send the response back to the client.
   * @returns {Promise<void>} - Sends a response with the created movie data or an error message.
   * 
   * API: POST /api/v1/movie/create
   */
  async create(req, res) {
    try {
      // Manually parse cast if it's a string
      if (typeof req.body.cast === 'string') {
        try {
          req.body.cast = JSON.parse(req.body.cast);
        } catch (err) {
          return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Invalid format for cast field");
        }
      }
      // validating request body
      const { error } = movieCreateSchema.validate(req.body);
      if (error) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, error.details[0].message);
      }
      // getting request body
      const { title, description, genre, language, duration, cast, director, release_date } = req.body;
      // creating movie
      let poster = null;
      if (req.file) {
        poster = req.file.filename;
      }
      const movie = await Movies.create({ title, description, genre, language, duration, cast, director, release_date, poster });
      // checking movie is created or not
      if (!movie) {
        return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, "Failed to create movie");
      }

      return apiResponse(res, true, HTTP_STATUS.CREATED, "Movie created successfully", movie);
    } catch (error) {
      console.error(error);
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, error.message);
    }
  }


  /**
   * Updates a movie with the given data.
   *
   * @function
   * @param {Object} req - Express request object containing the movie data in the body.
   * @param {Object} res - Express response object used to send the response back to the client.
   * @returns {Promise<void>} - Sends a response with the updated movie data if successful, otherwise an error message.
   *
   * @throws Will return a server error response if an exception occurs during the process.
   * 
   * API: PUT /api/v1/movie/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Required parameter missing");
      }
      // Manually parse cast if it's a string
      if (typeof req.body.cast === 'string') {
        try {
          req.body.cast = JSON.parse(req.body.cast);
        } catch (err) {
          return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Invalid format for cast field");
        }
      }
      // validating payload
      const { error } = movieCreateSchema.validate(req.body);
      if (error) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, error.details[0].message);
      }
      // getting current movie data
      const movie = await Movies.findOne({ _id: id });
      if (!movie) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Movie not found");
      }
      // getting request body
      const { title, description, genre, language, duration, cast, director, release_date } = req.body;
      // getting request body
      const updateData = req.body;
      // removing old poster if new poster is uploaded
      if (req.file) {
        const poster = req.file.filename;
        const oldPath = path.join(__dirname, "../..", "uploads", movie.poster);
        updateData['poster'] = poster;
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      const update = await Movies.findOneAndUpdate({ _id: id }, updateData, { new: true });
      // checking movie is updated or not
      if (!update) {
        return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, "Failed to update movie");
      }
      return apiResponse(res, true, HTTP_STATUS.OK, "Movie updated successfully", update);
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, error.message);
    }
  }


  /**
   * Deletes a movie entry from the database.
   *
   * This method expects a request parameter containing the id of the movie to be deleted.
   * The movie is first retrieved and checked if it exists. If it does, the corresponding
   * poster image is deleted. Finally, the movie entry is deleted from the database.
   *
   * If the deletion is successful, a response with the deleted movie data is sent back
   * to the client. If any errors occur, an appropriate error response is sent instead.
   *
   * @param {Object} req - Express request object containing the movie id in the params.
   * @param {Object} res - Express response object used to send the response back to the client.
   * @returns {Promise<void>} - Sends a response with the deleted movie data or an error message.
   * 
   * API: DELETE /api/v1/movie/:id
   */
  async deleteMovie(req, res) {
    try {
      // getting id from parameter
      const { id } = req.params;
      // validating id
      if (!id) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Required parameter missing");
      }
      // getting movie and checking movie is present or not and if present deleting movie poster
      const movie = await Movies.findOne({ _id: id });
      if (!movie) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Movie not found");
      }
      // checking movie poster is vailable or not
      if (movie.poster !== null) {
        // current path of movie poster
        const oldPath = path.join(__dirname, "../..", "uploads", movie.poster);
        // checking and deleting the movie poster
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      // finally delteing the movie
      const deleteMovie = await Movies.findOneAndDelete({ _id: id });
      if (!deleteMovie) {
        return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, "Failed to delete movie");
      }
      // sending success response
      return apiResponse(res, true, HTTP_STATUS.OK, "Movie deleted successfully");
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, error.message);
    }
  }

  /**
   * Fetches all movies from the database.
   *
   * This method executes a MongoDB query to fetch all movies that are not deleted.
   * The result is then sent back to the client as a response.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object used to send the response back to the client.
   * @returns {Promise<void>} - Sends a response with the fetched movies data or an error message.
   * 
   * API: GET /api/v1/movies
   */
  async getMovies(req, res) {
    try {
      // getting all movies
      const movies = await Movies.find({ is_deleted: false }, { _id: 1, title: 1, poster: 1 }).sort({ title: 1 });
      if (movies.length === 0) {
        return apiResponse(res, false, HTTP_STATUS.OK, "No movies found");
      }
      movies.forEach(movie => {
        movie.poster = movie.poster ? `${process.env.APP_URL}:${process.env.PORT}/uploads/${movie.poster}` : null;
      });
      return apiResponse(res, true, HTTP_STATUS.OK, "Movies fetched successfully", movies);
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, "Failed to fetch movies");
    }
  }

  /**
   * Fetches all movies from the database with their corresponding theater and show time information.
   *
   * This method executes a MongoDB aggregation query to fetch all movies that are not deleted, along
   * with their associated theater details and showtimes. The showtime information is constructed by
   * joining the movietheatermaps collection to fetch the theater and screen details. The final result
   * contains the movie data with an array of showtime objects.
   *
   * @param {Number} id - Optional: The ID of a single movie to fetch. If not provided, all movies are fetched.
   * @returns {Promise<Object[]>} - An array of movie objects with their showtime information.
   */
  async fetchMovies(id = null) {
    try {
      // preparing query to get movie and corresponding theater and show time
      const query = [
        // Step 1: Filter only non-deleted movies
        {
          $match: {
            is_deleted: false
          }
        },

        // Step 2: Lookup movietheatermaps for each movie
        {
          $lookup: {
            from: "movietheatermaps",
            localField: "_id",
            foreignField: "movie_id",
            as: "movietheatermaps"
          }
        },

        // Step 3: Unwind movietheatermaps array
        { $unwind: "$movietheatermaps" },

        // Step 4: Unwind show_time array inside movietheatermaps
        { $unwind: "$movietheatermaps.show_time" },

        // Step 5: Lookup the theater using theater_id from movietheatermaps
        {
          $lookup: {
            from: "theatres",
            localField: "movietheatermaps.theater_id",
            foreignField: "_id",
            as: "theater"
          }
        },

        // Step 6: Unwind the single theater result
        { $unwind: "$theater" },

        // Step 7: Lookup the screen using screen_id from each show_time entry
        {
          $lookup: {
            from: "screens",
            localField: "movietheatermaps.show_time.screen_id",
            foreignField: "_id",
            as: "screen"
          }
        },

        // Step 8: Unwind the single screen result
        { $unwind: "$screen" },

        // Step 9: Project only the required fields, and construct a clean show_time object
        {
          $project: {
            _id: 1,
            title: 1,
            genre: 1,
            language: 1,
            duration: 1,
            release_date: 1,
            director: 1,
            poster: 1,

            // Custom structure for each show time with joined theater and screen info
            show_time: {
              _id: "$movietheatermaps.show_time._id",
              screen_id: "$screen._id",
              screen_name: "$screen.name",
              start_time: "$movietheatermaps.show_time.start_time",
              end_time: "$movietheatermaps.show_time.end_time",
              theater_id: "$theater._id",
              theater_name: "$theater.name",
              theater_location: "$theater.location",
              price: "$movietheatermaps.show_time.price"
            }
          }
        },

        // Step 10: Group back by movie._id, and collect all show_time entries into an array
        {
          $group: {
            _id: "$_id", // movie ID
            title: { $first: "$title" },
            genre: { $first: "$genre" },
            language: { $first: "$language" },
            duration: { $first: "$duration" },
            release_date: { $first: "$release_date" },
            director: { $first: "$director" },
            poster: { $first: "$poster" },
            show_times: { $push: "$show_time" } // collect all show_times
          }
        }
      ];

      if (id) query[0].$match._id = new mongoose.Types.ObjectId(id);

      // const executing the query
      const movies = await Movies.aggregate(query);
      if (movies.length > 0) {
        movies.forEach(movie => {
          movie.poster = movie.poster ? `${process.env.APP_URL}:${process.env.PORT}/uploads/${movie.poster}` : null;
          // converting minute to hh:mm
          movie.duration == 0 ? 0 : `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m`;
          movie.release_date = new Date(movie.release_date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          movie.show_times.forEach(show_time => {
            show_time.start_time = new Date(show_time.start_time).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            show_time.end_time = new Date(show_time.end_time).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
          })
        });
      }

      return movies;
    } catch (error) {
      throw new Error("Failed to fetch movies: " + error.message);
    }
  }


  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Fetches movie showtimes along with associated theaters.
   *
   * This method executes an aggregation query on the Movies collection to
   * retrieve movies that are not deleted, along with their corresponding
   * theater details and showtimes. The query involves joining the movies
   * with the MovieTheaterMap and Theaters collections to fetch the required
   * information. The result is then sent back to the client as a response.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object used to send the response back to the client.
   * @returns {Promise<void>} - Sends a response with the fetched movie data, including theater and showtime details, or an error message.
   * 
   * API: GET /api/v1/movies/showtimes
   */
  /*******  50271ffa-f004-4087-be35-050b336d9a9a  *******/
  async getMovieShoTimes(req, res) {
    try {
      // const executing the query
      const movies = await this.fetchMovies();

      return apiResponse(res, true, HTTP_STATUS.OK, "Movies fetched successfully", movies);
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, error.message);
    }
  }

}

module.exports = new MovieController();