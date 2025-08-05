const Joi = require("joi");

const movieCreateSchema = Joi.object({
  title: Joi.string().required('title is required'),
  description: Joi.string().allow('', null).optional(),
  genre: Joi.string().required('genre is required'),
  language: Joi.string().required('language is required'),
  duration: Joi.number().required('duration is required'),
  cast: Joi.array().required('cast is required'),
  director: Joi.string().required('director is required'),
  release_date: Joi.date().required('release_date is required'),
  poster: Joi.string().allow('', null).optional()
});

module.exports = {
  movieCreateSchema
};