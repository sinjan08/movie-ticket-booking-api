const { apiResponse, HTTP_STATUS } = require("../utils/response.helper");
const { fetchMovies } = require("./MovieController");

class BookingController {
  async getMovieList(req, res) {
    try {
      // destructuring params
      const { id } = req.params;
      // validating params
      if (!id) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Required parameter missing");
      }
      // getting movie list with show times
      const movies = await fetchMovies(id);
      // returning response
      return apiResponse(res, true, HTTP_STATUS.OK, "Movie list fetched successfully", movies);
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, error.message);
    }
  }

}

module.exports = new BookingController();