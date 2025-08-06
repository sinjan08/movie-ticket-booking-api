const express = require("express");
const router = express.Router();
const authRoutes = require('./authRoutes');
const settingRoutes = require('./settingRoutes');
const movieRoutes = require('./movieRoutes');
const theaterRoutes = require('./theaterRoutes');
const bookingRoutes = require('./bookingRoutes');
const reportRoutes = require('./reportRoutes');
const authentication = require("../middleware/Authentication");
const authorization = require("../middleware/Authorization");

router.use('/settings', settingRoutes);
router.use('/auth', authRoutes);
router.use('/movie', authentication, movieRoutes);
router.use('/theater', authentication, theaterRoutes);
router.use('/booking', authentication, bookingRoutes);
router.use('/report', authentication, reportRoutes);

module.exports = router;