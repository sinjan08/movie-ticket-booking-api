const express = require("express");
const ReportController = require("../controller/ReportController");
const authorization = require("../middleware/Authorization");
const router = express.Router();

router.get("/movie", authorization, ReportController.getMovieWiseTotalBooking);
router.get("/theater", authorization, ReportController.getTheaterWiseBooking);
router.get("/user", ReportController.getUserWiseBookingSummary);

module.exports = router;