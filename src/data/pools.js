const { ObjectID } = require('mongodb');
const data = require('../utils/data');
const log = require('../utils/log');
const { pusher, pushEvents, pushTypes } = require('../utils/pusher');
const { POOLS_COLLECTION } = require('../constants/collections');
const { createNotification } = require('./notifications');
const { getUserByEmail } = require('./users');

const getUserPools = async (page, size, userEmail) => {
  log.cool(`Getting Pools for ${userEmail}`);
  return await data.getSome(
    POOLS_COLLECTION,
    page,
    size,
    { users: userEmail },
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

  const startingPoints = 500;
  const user = await getUserByEmail(createdBy);

  const newPool = await data.insertOne(POOLS_COLLECTION, {
    name,
    createdBy,
    users,
    minimumBet: 5,
    startingPoints,
    pointTotals: [
      { [user._id]: startingPoints }
    ]
  });

  if (name === 'My Test Pool') {
    deletePool(newPool._id);
  }

  return newPool;
};

const deletePool = async poolId => {
  log.cool(`Deleting Pool ${poolId}`);
  return await data.deleteOne(POOLS_COLLECTION, poolId);
};

const addUser = async (poolId, userEmail) => {
  log.cool(`Adding User ${userEmail} to pool ${poolId}`);

  const pool = await getPoolById(poolId);
  const user = await getUserByEmail(userEmail);

  const newUser = await data.addToSet(
    POOLS_COLLECTION,
    poolId,
    { 'users': userEmail }
  );

  await data.addToSet(
    POOLS_COLLECTION,
    poolId,
    { pointTotals: { [user._id]: pool.startingPoints } }
  );

  pool.users.map(poolUser => {
    if (poolUser !== userEmail) {
      pusher.trigger(poolUser, pushEvents.PUSH, {
        category: pushTypes.SUCCESS,
        title: 'User Added',
        message: `<i>${userEmail}</i> joined the <i>${pool.name}</i> pool`
      });
  
      createNotification(
        userEmail,
        poolUser,
        'New Pool Member',
        `<i>${userEmail}</i> joined <i>${pool.name}</i> pool`
      );
    }
  });

  return newUser;
};

const addWager = async (poolId, createdBy, wager) => {
  log.cool(`Adding Wager to pool ${poolId}`, wager);

  const newWager = await data.addToSet(
    POOLS_COLLECTION,
    poolId, {
    'wagers': {
      _id: new ObjectID(),
      ...wager
    }
  });

  wager.users.forEach(userEmail => {
    pusher.trigger(userEmail, pushEvents.PUSH, {
      category: pushTypes.SUCCESS,
      title: 'Wager Created',
      message: userEmail === createdBy ? `Successfully created wager` : `New wager created by ${createdBy}`
    });

    if (userEmail !== createdBy) {
      createNotification(
        createdBy,
        userEmail,
        'Wager Created',
        `${createdBy} wants to bet you ${wager.amount} pts`,
        `${process.env.FRONTEND_URL}/pools/${poolId}/wagers/${newWager.addition.wagers._id}`
      );
    }
  });

  return newWager;
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
