const Joi = require("joi");

const bookingSchema = Joi.object({
  movie_id: Joi.string().required().messages({
    'any.required': 'Movie id is required',
    'string.empty': 'Movie id is required',
  }),
  theater_id: Joi.string().required().messages({
    'any.required': 'Theater id is required',
    'string.empty': 'Theater id is required',
  }),
  show_time_id: Joi.string().required().messages({
    'any.required': 'Show time id is required',
    'string.empty': 'Show time id is required',
  }),
  no_of_tickets: Joi.number().required().messages({
    'any.required': 'No of tickets is required',
    'number.base': 'No of tickets must be a number',
  }),
});

module.exports = {
  bookingSchema
};