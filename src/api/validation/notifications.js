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

const defaultNotificationParams = Joi.object({
  notificationId: Joi.string().required()
});

const patchNotificationBody = Joi.object({
  userEmail: Joi.string().required()
});

module.exports = {
  getUserNotificationsQuery,
  postInvitationBody,
  defaultNotificationParams,
  patchNotificationBody
};
