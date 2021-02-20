const ObjectId = require('mongodb').ObjectId;

const getWagerById = (pool, wagerId) => {
  return pool.wagers.find(w => ObjectId(w._id).equals(ObjectId(wagerId)));
};

const getOtherWagers = (pool, wagerId) => {
  return pool.wagers.filter(wager => !ObjectId(wager._id).equals(ObjectId(wagerId)));
};

const getOtherUsers = (wager, winningUsers) => {
  return wager.activeUsers.find(userEmail => !winningUsers.includes(userEmail));
};

module.exports = {
  getWagerById,
  getOtherWagers,
  getOtherUsers
};
