const { ObjectID } = require('mongodb');
const data = require('../utils/data');
const log = require('../utils/log');
const { pusher, pushEvents } = require('../utils/pusher');
const { NOTIFICATIONS_COLLECTION } = require('../constants/collections');
const { getUserByEmail } = require('./users');

const getUserNotifications = async (page, size, userEmail) => {
  log.cool(`Getting Notifications for ${userEmail}`);

  const notificationData = await data.getSome(
    NOTIFICATIONS_COLLECTION,
    page,
    size,
    'userEmail',
    userEmail,
    {},
    { _id: -1 }
  );

  const allNotifications = await Promise.all(notificationData.items.map(async notification => {
    const user = await getUserByEmail(notification.createdBy);

    return {
      ...notification,
      timestamp: ObjectID(notification._id).getTimestamp(),
      createdByUser: user
    };
  })).then(notifications => ({
    ...notificationData,
    items: notifications
  }));

  return allNotifications;
};

const createNotification = async (createdBy, userEmail, title, message, link) => {
  log.cool(`Creating Notification`, { createdBy, userEmail, title, message, link });

  const newNotification = await data.insertOne(NOTIFICATIONS_COLLECTION, { createdBy, userEmail, title, message, link });

  pusher.trigger(userEmail, pushEvents.NOTIFY, newNotification);

  return newNotification;
};

module.exports = {
  getUserNotifications,
  createNotification
};
