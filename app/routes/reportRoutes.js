const express = require("express");
const ReportController = require("../controller/ReportController");
const router = express.Router();

router.get("/total-booking", ReportController.getMovieWiseTotalBooking);

module.exports = router;