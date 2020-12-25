const notifications = require('express').Router();
const notificationsData = require('../data/notifications');
const status = require('../utils/statusMessages');
const { validator } = require('../utils/validator');
const { getUserNotificationsQuery } = require('./validation/notifications');

notifications.get('/', validator.query(getUserNotificationsQuery), async (req, res) => {
  const { query: { pageNum, pageSize, userEmail } } = req;
  const page = parseInt(pageNum) || 1;
  const size = parseInt(pageSize) || 50;

  const { items, totalItems, totalPages } = await notificationsData.getUserNotifications(page, size, userEmail);

  if (!items) return status.serverError(res, 'Failed', 'Failed to get notifications');

  return status.success(res, {
    items,
    pageNum: page,
    pageSize: size,
    totalItems,
    totalPages
  });
});

module.exports = notifications;
