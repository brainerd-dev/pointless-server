const { ObjectID } = require('mongodb');
const data = require('../utils/data');
const log = require('../utils/log');
const { POOLS_COLLECTION } = require('../constants/collections');

const getUserPools = async (page, size, userEmail) => {
  log.cool(`Getting Pools for ${userEmail}`);
  return await data.getSome(
    POOLS_COLLECTION,
    page,
    size,
    'users',
    userEmail,
    { wagers: 0 },
    { poolId: -1 }
  );
};

const getPoolById = async poolId => {
  log.cool(`Getting Pool with ID ${poolId}`);
  return await data.getById(POOLS_COLLECTION, poolId);
};

const createPool = async (name, createdBy, users) => {
  log.cool(`Creating Pool "${name}" for user ${createdBy}`);
  return await data.insertOne(POOLS_COLLECTION, { name, createdBy, users });
};

const deletePool = async poolId => {
  log.cool(`Deleting Pool ${poolId}`);
  return await data.deleteOne(POOLS_COLLECTION, poolId);
};

const addUser = async (poolId, userEmail) => {
  log.cool(`Adding User ${userEmail} to pool ${poolId}`);
  return await data.addToSet(
    POOLS_COLLECTION,
    poolId,
    { 'users': userEmail }
  );
};

const addWager = async (poolId, wager) => {
  log.cool(`Adding Wager ${wager._id} to pool ${poolId}`);
  return await data.addToSet(
    POOLS_COLLECTION,
    poolId, {
    'wagers': {
      _id: new ObjectID(),
      ...wager
    }
  });
};

const removeWager = async (poolId, wagerId) => {
  log.cool(`Removing Wager ${wagerId} from pool ${poolId}`);
  return await data.pullFromSet(POOLS_COLLECTION, poolId, { wagers: { _id: ObjectID(wagerId) } });
};

module.exports = {
  getUserPools,
  getPoolById,
  createPool,
  deletePool,
  addUser,
  addWager,
  removeWager
};
