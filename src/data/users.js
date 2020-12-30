const data = require('../utils/data');
const log = require('../utils/log');
const { USERS_COLLECTION } = require('../constants/collections');

const createUser = async user => {
  const newUser = await data.insertOne(USERS_COLLECTION, user);

  log.success(`Created new user ${newUser.name} (${newUser._id})`);

  return newUser;
};

const getUserByEmail = async email => {
  log.cool('Getting user by email', email);
  return await data.getByProperty(USERS_COLLECTION, 'email', email);
};

const getUserByUsername = async username => {
  log.cool('Getting user by username', username);
  return await data.getByProperty(USERS_COLLECTION, 'username', username);
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserByUsername
};
