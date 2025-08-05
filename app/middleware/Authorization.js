const jwt = require("jsonwebtoken");
const { apiResponse } = require("../utils/response.helper");

const authorization = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return apiResponse(res, false, 401, "Authorization token missing or malformed");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return apiResponse(res, false, 401, "Token missing");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optional: Validate required fields
    if (!decoded || !decoded.id || !decoded.role_id) {
      return apiResponse(res, false, 401, "Invalid token");
    }

    if (decoded.role_name.toLowerCase() !== 'admin') {
      return apiResponse(res, false, 401, "You are not authorized to perform this action");
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return apiResponse(res, false, 401, "Token expired");
    } else {
      return apiResponse(res, false, 500, "Internal server error: ", error.message);
    }
  }
}

module.exports = authorization;