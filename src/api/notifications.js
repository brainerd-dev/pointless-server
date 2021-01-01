const notifications = require('express').Router();
const emailClient = require('@sendgrid/mail');
const notificationsData = require('../data/notifications');
const getInviteHtml = require('../utils/getInviteHtml');
const status = require('../utils/statusMessages');
const { validator } = require('../utils/validator');
const { getUserNotificationsQuery, postInvitationBody } = require('./validation/notifications');

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

notifications.post('/invitation', validator.body(postInvitationBody), async (req, res) => {
  const { body: { to, poolId, location } } = req;

  const from = 'Pointless <noreplay@pntls.app>';
  const subject = 'You have been invited to a Pointless pool';
  const text = 'We bet you will have a lot of fun joining this pool';
  const html = getInviteHtml(poolId, location);

  emailClient.setApiKey(process.env.SENDGRID_API_KEY);
  emailClient.send({ to, from, subject, text, html });

  return status.created(res, { to, from, subject, text, html });
});

module.exports = notifications;
