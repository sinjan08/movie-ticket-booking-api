const express = require("express");
const router = express.Router();
const movieController = require("../controller/MovieController");
const authorization = require("../middleware/Authorization");
const fileUpload = require("../utils/upload.helper")

router.post("/create", fileUpload.single("poster"), authorization, movieController.create);
router.put("/:id", fileUpload.single("poster"), authorization, movieController.update);
router.delete("/:id", authorization, movieController.deleteMovie);
router.get("/", movieController.getMovies);
router.get("/showtimes", authorization, movieController.getMovieShoTimes);

module.exports = router;