const express = require("express");
const router = express.Router();
const movieController = require("../controller/MovieController");
const authentication = require("../middleware/Authentication");
const authorization = require("../middleware/Authorization");
const fileUpload = require("../utils/upload.helper")

router.post("/create", fileUpload.single("poster"), movieController.create);
router.put("/:id", fileUpload.single("poster"), movieController.update);
router.delete("/:id", movieController.deleteMovie);
router.get("/", movieController.getMovies);
router.get("/showtimes", movieController.getMovieShoTimes);

module.exports = router;