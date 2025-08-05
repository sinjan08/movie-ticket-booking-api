const Joi = require("joi");

const theaterSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Name is required',
    'string.empty': 'Name is required',
  }),
  location: Joi.string().required().messages({
    'any.required': 'Location is required',
    'string.empty': 'Location is required',
  }),
  screens: Joi.array().items(
    Joi.object({
      screen_name: Joi.string().required().messages({
        'any.required': 'Screen name is required',
        'string.empty': 'Screen name is required',
      }),
      seats: Joi.number().required().messages({
        'any.required': 'Seats count is required',
        'number.base': 'Seats must be a number',
      }),
    })
  ).min(1).required().messages({
    'any.required': 'Screens are required',
    'array.min': 'At least one screen is required',
  }),
});


const assignMovieTheaterSchema = Joi.object({
  theater_id: Joi.string().required().messages({
    'any.required': 'Theater id is required',
    'string.empty': 'Theater id is required',
  }),
  movie_id: Joi.string().required().messages({
    'any.required': 'Movie id is required',
    'string.empty': 'Movie id is required',
  }),
  show_time: Joi.array().items(
    Joi.object({
      screen_id: Joi.string().required().messages({
        'any.required': 'Screen id is required',
        'string.empty': 'Screen id is required',
      }),
      start_time: Joi.date().required().messages({
        'any.required': 'Start time is required',
        'date.base': 'Start time must be a date',
      }),
    })
  ).min(1).required().messages({
    'any.required': 'Show time is required',
    'array.min': 'At least one show time is required',
  }),
})


module.exports = {
  theaterSchema,
  assignMovieTheaterSchema
};
