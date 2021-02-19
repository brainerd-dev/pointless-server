const ObjectId = require('mongodb').ObjectId;

const getWagerById = (pool, wagerId) => {
  return pool.wagers.find(w => ObjectId(w._id).equals(ObjectId(wagerId)));
};

const getOtherWagers = (pool, wagerId) => {
  return pool.wagers.filter(wager => !ObjectId(wager._id).equals(ObjectId(wagerId)));
};

const getOtherUser = (wager, winningUser) => {
  return wager.activeUsers.find(userEmail => userEmail !== winningUser);
};

module.exports = {
  getWagerById,
  getOtherWagers,
  getOtherUser
};
