const express = require("express");
const SettingController = require("../controller/SettingController");
const router = express.Router();

router.post('/role/create', SettingController.createRole);
router.get('/role', SettingController.getRoles);

module.exports = router;