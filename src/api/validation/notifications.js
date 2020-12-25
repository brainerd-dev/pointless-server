const Joi = require('joi');

const getUserNotificationsQuery = Joi.object({
  pageNum: Joi.number(),
  pageSize: Joi.number(),
  userEmail: Joi.string().required()
});

module.exports = {
  getUserNotificationsQuery
};
