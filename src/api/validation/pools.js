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

const patchWagerBody = Joi.object({
  userEmail: Joi.string().required()
});

const completeWagerBody = Joi.object({
  completedBy: Joi.string().required(),
  winners: Joi.array().required()
});

module.exports = {
  getUserPoolsQuery,
  defaultPoolParams,
  postPoolBody,
  postUserBody,
  postWagerBody,
  defaultWagerParams,
  patchWagerBody,
  completeWagerBody
};
