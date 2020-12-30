const users = require('express').Router();
const usersData = require('../data/users');
const status = require('../utils/statusMessages');
const { validator } = require('../utils/validator');
const { postUserBody, getUserByEmailQuery, getUserByUsernameQuery } = require('./validation/users');

users.post('/', validator.body(postUserBody), async (req, res) => {
  const { body: { user } } = req;

  const newUser = await usersData.createUser(user);
  if (!newUser) return status.serverError(res, 'Failed', `Failed to create user [${user}]`);

  return status.created(res, { ...newUser });
});

users.get('/email', validator.query(getUserByEmailQuery), async (req, res) => {
  const { query: { email } } = req;

  const user = await usersData.getUserByEmail(email);

  return status.success(res, { doesNotExist: !user, ...user });
});

users.get('/username', validator.query(getUserByUsernameQuery), async (req, res) => {
  const { query: { username } } = req;

  const user = await usersData.getUserByUsername(username);

  return status.success(res, { doesNotExist: !user, ...user });
});

module.exports = users;
