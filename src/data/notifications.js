const { ObjectID } = require('mongodb');
const data = require('../utils/data');
const log = require('../utils/log');
const { pusher, pushEvents } = require('../utils/pusher');
const { NOTIFICATIONS_COLLECTION } = require('../constants/collections');

const getUserNotifications = async (page, size, userEmail) => {
  log.cool(`Getting Notifications for ${userEmail}`);

  const userNotifications = await data.getSome(
    NOTIFICATIONS_COLLECTION,
    page,
    size,
    'userEmail',
    userEmail,
    {},
    { _id: -1 }
  );

  const notifications = {
    ...userNotifications,
    items: userNotifications.items.map(notification => {
      return {
        ...notification,
        timestamp: ObjectID(notification._id).getTimestamp()
      };
    })
  };

  return notifications;
};

const createNotification = async (userEmail, title, message, link) => {
  log.cool(`Creating Notification`, { userEmail, title, message, link });

  const newNotification = await data.insertOne(NOTIFICATIONS_COLLECTION, { userEmail, title, message, link });

  pusher.trigger(userEmail, pushEvents.NOTIFY, newNotification);

  return newNotification;
};

module.exports = {
  getUserNotifications,
  createNotification
};
