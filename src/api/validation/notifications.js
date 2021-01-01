const Joi = require('joi');

const getUserNotificationsQuery = Joi.object({
  pageNum: Joi.number(),
  pageSize: Joi.number(),
  userEmail: Joi.string().required()
});

const postInvitationBody = Joi.object({
  to: Joi.string().required(),
  poolId: Joi.string().required(),
  location: Joi.object()
});

module.exports = {
  getUserNotificationsQuery,
  postInvitationBody
};
