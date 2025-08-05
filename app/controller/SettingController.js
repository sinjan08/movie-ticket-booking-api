const Roles = require("../models/RoleModel");
const { apiResponse, HTTP_STATUS } = require("../utils/response.helper");

class SettingController {

  async getRoles(req, res) {
    try {
      const roles = await Roles.find({ is_deleted: false }, { _id: 1, name: 1 });
      return apiResponse(res, true, HTTP_STATUS.OK, "Roles fetched successfully", roles);
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, "Failed to fetch roles");
    }
  }


  async createRole(req, res) {
    try {
      const { name } = req.body;
      const role = await Roles.create({ name });
      return apiResponse(res, true, HTTP_STATUS.CREATED, "Role created successfully", role);
    } catch (error) {
      return apiResponse(res, false, HTTP_STATUS.SERVER_ERROR, "Failed to create role");
    }
  }
}

module.exports = new SettingController();