const pools = require('express').Router();
const poolsData = require('../data/pools');
const status = require('../utils/statusMessages');
const { validator } = require('../utils/validator');
const {
  getUserPoolsQuery,
  defaultPoolParams,
  postPoolBody,
  postWagerBody
} = require('./validation/pools');

pools.get('/', validator.query(getUserPoolsQuery), async (req, res) => {
  const { query: { pageNum, pageSize, userEmail } } = req;
  const page = parseInt(pageNum) || 1;
  const size = parseInt(pageSize) || 50;

  const { items, totalItems, totalPages } = await poolsData.getUserPools(page, size, userEmail);

  if (!items) return status.serverError(res, 'Failed', 'Failed to get pools');

  return status.success(res, {
    items,
    pageNum: page,
    pageSize: size,
    totalItems,
    totalPages
  });
});

pools.get('/:poolId', validator.params(defaultPoolParams), async (req, res) => {
  const { params: { poolId } } = req;

  const pool = await poolsData.getPoolById(poolId);

  return status.success(res, { ...pool });
});

pools.post('/', validator.body(postPoolBody), async (req, res) => {
  const { body: { name, createdBy, users } } = req;
  const poolUsers = [createdBy, ...users];

  const pool = await poolsData.createPool(name, createdBy, poolUsers);

  return status.success(res, { ...pool });
});

pools.post('/:poolId/wagers',
  validator.params(defaultPoolParams),
  validator.body(postWagerBody), async (req, res) => {
    const { params: { poolId }, body: { amount, description, users } } = req;

    const newWager = await poolsData.addWager(poolId, { amount, description, users });

    return status.success(res, { ...newWager });
  }
);

module.exports = pools;
