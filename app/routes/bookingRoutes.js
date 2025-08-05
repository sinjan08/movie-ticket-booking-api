const express = require("express");
const BookingController = require("../controller/BookingController");
const router = express.Router();

router.get("/:id", BookingController.getMovieList);

module.exports = router;