const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const appRoute = require("./app/routes/app.route");
const INIT_DATABASE = require("./app/config/database");
const errorHandler = require("./app/middleware/ErrorHandler");
dotenv.config();

const app = express();
app.use(bodyparser.json());
app.use(cors());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use('/uploads', express.static("uploads"));

app.use('/api/v1', errorHandler, appRoute);

const port = process.env.PORT || 5500;
const appName = process.env.APP_NAME;

INIT_DATABASE();

app.listen(port, () => {
  console.log(`${appName} is running on port ${port}`);
});