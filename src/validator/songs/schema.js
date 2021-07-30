const Joi = require('joi');

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(2999).required(),
  performer: Joi.string().required(),
  genre: Joi.string(),
  duration: Joi.number().integer().min(0).max(9999),

});

module.exports = { SongPayloadSchema };
