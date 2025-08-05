const express = require("express");
const router = express.Router();
const authController = require('../controller/AuthController');
const fileUpload = require("../utils/upload.helper");
const authentication = require("../middleware/Authentication");

router.post("/signup", fileUpload.single("profile_image"), authController.signup);
router.get("/verify/:token", authController.verify);
router.post("/login", authController.login);
router.get('/profile', authentication, authController.getProfile);
router.put('/update', authentication, fileUpload.single("profile_image"), authController.updateUser);

module.exports = router;