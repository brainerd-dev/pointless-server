const { ObjectID } = require('mongodb');
const data = require('../utils/data');
const log = require('../utils/log');
const { POOLS_COLLECTION } = require('../constants/collections');

const getUserPools = async (page, size, userEmail) => {
  log.cool(`Get Pools for ${userEmail}`);
  return await data.getSome(
    POOLS_COLLECTION, page, size, 'userEmail', userEmail, {}, { poolId: -1 }
  );
};

const getPoolById = async poolId => {
  log.cool(`Get Pool with ID ${poolId}`);
  return await data.getById(POOLS_COLLECTION, poolId);
};

const createPool = async ({ name, userEmail }) => {
  log.cool(`Create Pool "${name}" for user ${userEmail}`);
  return await data.insertOne(POOLS_COLLECTION, { name, userEmail });
};

const addWager = async (poolId, wager) => {
  return await data.addToSet(
    POOLS_COLLECTION,
    poolId, {
    'wagers': {
      _id: new ObjectID(),
      ...wager
    }
  });
};

module.exports = {
  getUserPools,
  getPoolById,
  createPool,
  addWager
};
