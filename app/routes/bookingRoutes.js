const express = require("express");
const BookingController = require("../controller/BookingController");
const router = express.Router();

router.get("/movie/:id", BookingController.getMovieList);
router.post("/", BookingController.bookMovie);
router.put("/:id", BookingController.cancelBooking);
router.get("/history", BookingController.bookingHistory);

module.exports = router;