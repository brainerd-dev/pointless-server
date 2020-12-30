const Joi = require('joi');

const postUserBody = Joi.object({
  user: Joi.object({
    name: Joi.string().required(),
    given_name: Joi.string(),
    family_name: Joi.string(),
    locale: Joi.string(),
    nickname: Joi.string().required(),
    email: Joi.string().required(),
    picture: Joi.string().required(),
    updated_at: Joi.string(),
    email_verified: Joi.boolean(),
    sub: Joi.string()
  })
});

const getUserByEmailQuery = Joi.object({
  email: Joi.string()
});

const getUserByUsernameQuery = Joi.object({
  username: Joi.string()
});

module.exports = {
  postUserBody,
  getUserByEmailQuery,
  getUserByUsernameQuery
};
