const Joi = require('joi');

const getUserPoolsQuery = Joi.object({
  pageNum: Joi.number(),
  pageSize: Joi.number(),
  userEmail: Joi.string().required()
});

const defaultPoolParams = Joi.object({
  poolId: Joi.string().required()
});

const postPoolBody = Joi.object({
  name: Joi.string().required(),
  userEmail: Joi.string().required()
});

const patchWagersBody = Joi.object({
  amount: Joi.number().required(),
  description: Joi.string().required(),
  users: Joi.array().required()
});

module.exports = {
  getUserPoolsQuery,
  defaultPoolParams,
  postPoolBody,
  patchWagersBody
};
