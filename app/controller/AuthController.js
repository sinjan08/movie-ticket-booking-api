const Users = require("../models/UserModel");
const Roles = require("../models/RoleModel");
const UserRoleMap = require("../models/UserRoleMap");
const { signupSchema } = require("../rules/authRules");
const { apiResponse, HTTP_STATUS } = require("../utils/response.helper");
const { sendSignupMail } = require("../service/signup.mail");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

class AuthController {

  /**
   * Signup user
   *
   * @function
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   * @throws {Error}
   * 
   * API: POST /api/v1/auth/signup
   */
  async signup(req, res) {
    try {
      // validating request body
      const { error } = signupSchema.validate(req.body);
      if (error) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, error.details[0].message);
      }
      // getting request body
      const { name, email, password, address, role_id } = req.body;
      // checking user exists or not
      const user = await Users.findOne({ email });
      if (user) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "User already exists");
      }
      // checking role exist or not
      const role = await Roles.findOne({ _id: role_id });
      if (!role) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Role not found");
      }
      // hashing password
      const hashedPassword = await bcrypt.hash(password, 10);
      // saving profile image
      let profile_image = null;
      if (req.file) {
        profile_image = req.file.filename
      }
      // creating user
      const newUser = await Users.create({
        name,
        email,
        password: hashedPassword,
        address,
        profile_image
      });

      if (!newUser) {
        return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, "Failed to create user");
      }
      // creating user role map
      const userRoleMap = await UserRoleMap.create({
        user_id: newUser?._id,
        role_id: role._id
      });
      if (!userRoleMap) {
        return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, "Failed to create user role map");
      }
      // sending success mail
      await sendSignupMail({ id: newUser?._id, name, email });
      // returning final response
      return apiResponse(res, true, HTTP_STATUS.OK, "Signup successfully");
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, error.message);
    }
  }


  /**
   * Verify user with given token
   *
   * @function
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   * @throws {Error}
   * 
   * API: GET /api/v1/auth/verify/:token
   */
  async verify(req, res) {
    try {
      // taking token from param
      const { token } = req.params;
      // verifying token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { id, email, name } = decoded;

      // checking user exists or not
      const user = await Users.findOne({ _id: id });
      if (!user) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "User not found");
      }
      // checking user already verified or not
      if (user[0]?.is_verified) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "User already verified");
      }
      // updating user
      await Users.updateOne({ _id: id }, { $set: { is_verified: true } });
      return apiResponse(res, true, HTTP_STATUS.OK, "User verified successfully");
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, error.message);
    }
  }



  /**
   * Authenticates a user using their email and password and returns a JSON Web Token (JWT) if successful.
   *
   * @param {Object} req - Express request object containing email and password in the body.
   * @param {Object} res - Express response object used to send the response back to the client.
   * @returns {Promise<void>} - Sends a response with a token and user data if authentication is successful,
   *                            otherwise sends an error response.
   *
   * @throws Will return a server error response if an exception occurs during the process.
   * 
   * API: POST /api/v1/auth/login
   */
  async login(req, res) {
    try {
      // getting request body
      const { email, password } = req.body;
      // aggregation query
      const query = [
        { $match: { email, is_deleted: false } },
        {
          $lookup: {
            from: "userrolemaps",
            localField: "_id",
            foreignField: "user_id",
            as: "userrolemap"
          }
        },
        { $unwind: "$userrolemap" },
        {
          $lookup: {
            from: "roles",
            localField: "userrolemap.role_id",
            foreignField: "_id",
            as: "role"
          }
        },
        { $unwind: "$role" },
        {
          $project: {
            _id: 1,
            email: 1,
            name: 1,
            password: 1,
            address: 1,
            profile_image: 1,
            is_verified: 1,
            role_id: "$role._id",
            role_name: "$role.name"
          }
        }
      ]
      // checking user exists or not
      const user = await Users.aggregate(query);
      if (!user) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "User not found");
      }
      // checking user verified or not
      if (!user[0]?.is_verified) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "User not verified");
      }
      // checking password
      const isMatch = await bcrypt.compare(password, user[0]?.password);
      if (!isMatch) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Invalid password");
      }
      // generating token
      const token = jwt.sign({ id: user[0]?._id, email: user[0]?.email, name: user[0]?.name, role_id: user[0]?.role_id, role_name: user[0]?.role_name },
        process.env.JWT_SECRET,
        { expiresIn: "1d" });
      // removing password from response
      delete user[0]?.password;
      user[0].profile_image = user[0]?.profile_image ? `${process.env.APP_URL}:${process.env.PORT}/uploads/${user[0]?.profile_image}` : null;
      // returning final response
      return apiResponse(res, true, HTTP_STATUS.OK, "Login successfully", { token, user: user[0] });
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, error.message);
    }
  }


  /**
   * Get user profile
   *
   * @function
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   * @throws {Error}
   * 
   * API: GET /api/v1/auth/profile
   */
  async getProfile(req, res) {
    try {
      // gettting user id from param
      const id = req?.user?.id;
      if (!id) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Required parameter missing");
      }
      // aggregation query
      const query = [
        { $match: { _id: new mongoose.Types.ObjectId(id), is_deleted: false, is_verified: true } },
        {
          $lookup: {
            from: "userrolemaps",
            localField: "_id",
            foreignField: "user_id",
            as: "userrolemap"
          }
        },
        { $unwind: "$userrolemap" },
        {
          $lookup: {
            from: "roles",
            localField: "userrolemap.role_id",
            foreignField: "_id",
            as: "role"
          }
        },
        { $unwind: "$role" },
        {
          $project: {
            _id: 1,
            email: 1,
            name: 1,
            address: 1,
            profile_image: 1,
            is_verified: 1,
            role_id: "$role._id",
            role_name: "$role.name"
          }
        }
      ]
      // getting the user
      const user = await Users.aggregate(query);
      // checking user
      if (!user) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "User not found");
      }
      // generating user profile image link
      user[0].profile_image = user[0]?.profile_image ? `${process.env.APP_URL}:${process.env.PORT}/uploads/${user[0]?.profile_image}` : null;
      // returning final response
      return apiResponse(res, true, HTTP_STATUS.OK, "User found successfully", user[0]);

    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, error.message);
    }
  }


  /**
   * Update user profile
   *
   * @function
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   * @throws {Error}
   * 
   * API: PUT /api/v1/auth/update
   */
  async updateUser(req, res) {
    try {
      // getting user id from param
      const id = req?.user?.id;
      if (!id) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Required parameter missing");
      }
      // getting current user
      const user = await Users.findOne({ _id: id });
      if (!user) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "User not found");
      }
      // getting user from request body
      const { email, name, address } = req.body;
      // update data
      const updateData = { email, name, address };
      // checking profile image is present or not
      if (req.file) {
        // Get the new profile image filename
        const profile_image = req.file.filename;
        // Set it for update
        updateData["profile_image"] = profile_image;
        // Build the full path to the previous image
        const oldImagePath = path.join(__dirname, "../..", "uploads", user.profile_image);
        console.log(oldImagePath);
        // Check if previous image exists and delete it
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // updating user
      const update = await Users.findOneAndUpdate({ _id: id }, updateData, { new: true });
      if (!update) {
        return apiResponse(res, false, HTTP_STATUS.BAD_REQUEST, "Failed to update user");
      }
      update.profile_image = update?.profile_image ? `${process.env.APP_URL}:${process.env.PORT}/uploads/${update?.profile_image}` : null;
      return apiResponse(res, true, HTTP_STATUS.OK, "User updated successfully", update);
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, error.message);
    }
  }
}

module.exports = new AuthController();