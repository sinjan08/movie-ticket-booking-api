const Joi = require("joi");

const signupSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("[a-z]"), "lowercase letter")
    .pattern(new RegExp("[A-Z]"), "uppercase letter")
    .pattern(new RegExp("[0-9]"), "number")
    .pattern(new RegExp("[^a-zA-Z0-9]"), "special character")
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long.",
      "string.pattern.name": "Password must include at least one {#name}.",
      "string.empty": "Password is required.",
      "any.required": "Password is required."
    }),
  address: Joi.string().allow("", null).optional(),
  profile_image: Joi.string().allow("", null).optional(),
  role_id: Joi.string().required()
});

module.exports = {
  signupSchema
};
