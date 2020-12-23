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
  createdBy: Joi.string().required()
});

const postUserBody = Joi.object({
  userEmail: Joi.string().required()
});

const postWagerBody = Joi.object({
  amount: Joi.number().required(),
  description: Joi.string().required(),
  createdBy: Joi.string().required(),
  users: Joi.array().required()
});

const defaultWagerParams = Joi.object({
  poolId: Joi.string().required(),
  wagerId: Joi.string().required()
});

module.exports = {
  getUserPoolsQuery,
  defaultPoolParams,
  postPoolBody,
  postUserBody,
  postWagerBody,
  defaultWagerParams
};
