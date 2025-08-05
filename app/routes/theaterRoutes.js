const express = require("express");
const authorization = require("../middleware/Authorization");
const TheaterController = require("../controller/TheaterController");
const router = express.Router();

router.post("/create", authorization, TheaterController.addTheater);
router.get("/:theater_id/screens", authorization, TheaterController.screensByTheaterId);
router.get("/", authorization, TheaterController.getTheaters);
router.post('/assign-movie', authorization, TheaterController.assignMovieToTheater);

module.exports = router;