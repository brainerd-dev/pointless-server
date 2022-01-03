const ObjectId = require('mongodb').ObjectId;
const data = require('../utils/data');
const log = require('../utils/log');
const { getOtherWagers, getWagerById } = require('../utils/pools');
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

const createPool = async (name, createdBy, users, startingPoints = 500) => {
  log.cool(`Creating Pool "${name}" for user ${createdBy}`);

  const user = await getUserByEmail(createdBy);

  const newPool = await data.insertOne(POOLS_COLLECTION, {
    name,
    createdBy,
    users,
    minimumBet: 5,
    config: {
      startingPoints
    },
    pointTotals: {
      [user._id]: startingPoints
    },
    pendingPoints: {
      [user._id]: 0
    }
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
    { users: userEmail }
  );

  await data.updateOne(
    POOLS_COLLECTION,
    poolId,
    {
      pointTotals: {
        ...pool.pointTotals,
        [user._id]: pool.startingPoints
      },
      pendingPoints: {
        ...pool.pendingPoints,
        [user._id]: 0
      }
    }
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
      _id: new ObjectId(),
      createdBy,
      ...wager
    }
  });

  await subtractUserPoints(poolId, createdBy, wager.amount);

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

  const pool = await getPoolById(poolId);
  const wager = await getWagerById(pool, wagerId);

  await Promise.all(wager.users.map(async userEmail => {
    await addUserPoints(poolId, userEmail, wager.amount);
  }));

  return await data.pullFromSet(POOLS_COLLECTION, poolId, { wagers: { _id: ObjectId(wagerId) } });
};

const acceptWager = async (pool, updatedWager) => {
  log.cool(`Accepting Wager ${updatedWager._id} in pool ${pool._id}`);

  const updatedWagers = [
    ...getOtherWagers(pool, updatedWager._id),
    updatedWager
  ];

  pusher.trigger(updatedWager.createdBy, pushEvents.PUSH, {
    category: pushTypes.SUCCESS,
    title: 'Wager Accepted',
    message: `Your wager was accepted`
  });

  createNotification(
    updatedWager.createdBy,
    updatedWager.createdBy,
    'Wager Accepted',
    `Your wager for ${updatedWager.amount} pts was accepted`,
    `${process.env.FRONTEND_URL}/pools/${pool._id}/wagers/${updatedWager._id}`
  );

  return await data.updateOne(POOLS_COLLECTION, pool._id, { wagers: updatedWagers });
};

const completeWager = async (pool, updatedWager, completedBy) => {
  log.cool(`Completing Wager ${updatedWager._id} in pool ${pool._id}`);

  const updatedWagers = [
    ...getOtherWagers(pool, updatedWager._id),
    updatedWager
  ];

  updatedWager.users.forEach(userEmail => {
    if (userEmail !== completedBy) {
      pusher.trigger(userEmail, pushEvents.PUSH, {
        category: pushTypes.SUCCESS,
        title: 'Wager Comleted',
        message: 'Your wager has been marked as complete'
      });

      createNotification(
        completedBy,
        userEmail,
        'Wager Complete',
        `${completedBy} says your wager for ${updatedWager.amount} is complete`,
        `${process.env.FRONTEND_URL}/pools/${pool._id}/wagers/${updatedWager._id}`
      );
    }
  });

  return await data.updateOne(POOLS_COLLECTION, pool._id, { wagers: updatedWagers });
};

const updateUserPoints = async (poolId, userEmail, points) => {
  log.cool(`Updating user ${userEmail} points ${points}`);

  const pool = await getPoolById(poolId);
  const user = await getUserByEmail(userEmail);

  const updatedPointTotals = {
    pointTotals: {
      ...pool.pointTotals,
      [user._id]: pool.pointTotals[user._id] + points
    }
  };

  return await data.updateOne(POOLS_COLLECTION, poolId, updatedPointTotals);
};

const updatePendingPoints = async (poolId, userEmail, points) => {
  log.cool(`Updating user ${userEmail} pending points ${points}`);

  const pool = await getPoolById(poolId);
  const user = await getUserByEmail(userEmail);

  const updatedPendingPoints = {
    pendingPoints: {
      ...pool.pendingPoints,
      [user._id]: pool.pendingPoints[user._id] + points
    }
  };

  return await data.updateOne(POOLS_COLLECTION, poolId, updatedPendingPoints);
};

const addUserPoints = async (poolId, userEmail, points) => {
  return Promise.all([
    updateUserPoints(poolId, userEmail, points),
    subtractPendingPoints(poolId, userEmail, points)
  ]);
};

const subtractUserPoints = async (poolId, userEmail, points) => {
  return Promise.all([
    updateUserPoints(poolId, userEmail, -1 * points),
    addPendingPoints(poolId, userEmail, points)
  ]);
};

const addPendingPoints = async (poolId, userEmail, points) => {
  await updatePendingPoints(poolId, userEmail, points);
};

const subtractPendingPoints = async (poolId, userEmail, points) => {
  await updatePendingPoints(poolId, userEmail, -1 * points);
};

const transferWinnerPoints = async (poolId, winners, points) => {
  await Promise.all(winners.forEach(async winnerEmail => {
    await addUserPoints(poolId, winnerEmail, points);
  }));
};

module.exports = {
  getUserPools,
  getPoolById,
  createPool,
  deletePool,
  addUser,
  addWager,
  removeWager,
  acceptWager,
  completeWager,
  updateUserPoints,
  updatePendingPoints,
  addUserPoints,
  subtractUserPoints,
  transferWinnerPoints
};
