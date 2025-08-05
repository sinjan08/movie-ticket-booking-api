const jwt = require("jsonwebtoken");
const { apiResponse } = require("../utils/response.helper");

const authentication = (req, res, next) => {
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

    req.user = {
      id: decoded.id,
      role_id: decoded.role_id,
      email: decoded.email || null // include other fields if needed
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return apiResponse(res, false, 401, "Error: Token expired");
    } else if (error.name === "JsonWebTokenError") {
      return apiResponse(res, false, 401, "Error: Invalid token");
    } else {
      return apiResponse(res, false, 500, "Internal server error: ", error.message);
    }
  }
};

module.exports = authentication;
