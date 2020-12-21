/* eslint node/exports-style: off */

const mongo = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const log = require('./log');
const { omit } = require('lodash');

const dbUri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true };

var db;

const connectToMongoDB = async () => {
  mongo.connect(dbUri, mongoOptions, (err, client) => {
    if (err) {
      log.error(err);
      connect(false);
      return;
    }

    db = client.db(dbName);

    log.cool(`Connected to DB: ${dbName}`);
    connect(true);
  });
}

const connect = async (connected) => !connected && connectToMongoDB();

const calculateTotalPages = (items, size) => items > size ? Math.ceil(items / size) : 1;

connect();

const insertOne = async (collectionName, document) => {
  return new Promise((resolve, reject) => {
    db.collection(collectionName)
      .insertOne(document, (err, result) => {
        err ? reject(err) : resolve(((result || {}).ops || [])[0]);
      });
  });
};

const getSome = async (collectionName, page, size, identifier, idValue, projection = {}, sort = {}) => {
  const collection = db.collection(collectionName);
  const totalItems = await collection.countDocuments({});
  const totalPages = calculateTotalPages(totalItems, size);
  const sorting = sort || { $natural: -1 };

  return new Promise((resolve, reject) => {
    const query = identifier && idValue ? { [identifier]: idValue } : {};
    collection
      .find(query)
      .project(projection)
      .skip(size * (page - 1))
      .limit(size)
      .sort(sorting)
      .toArray((err, items) => {
        err ? reject(err) : resolve({
          items,
          totalItems,
          totalPages
        });
      });
  });
};

const getById = async (collectionName, id) => {
  return new Promise((resolve, reject) => {
    db.collection(collectionName)
      .find({ _id: ObjectId(id) })
      .toArray((err, result) =>
        err ? reject(err) : resolve(result[0])
      );
  });
};

const getByProperty = (collectionName, property, value) => {
  return new Promise((resolve, reject) => {
    db.collection(collectionName)
      .find({ [property]: value })
      .toArray((err, result) =>
        err ? reject(err) : resolve(result[0])
      );
  });
};

const getByProperties = (collectionName, query) => {
  return new Promise((resolve, reject) => {
    db.collection(collectionName)
      .find(query)
      .toArray((err, result) =>
        err ? reject(err) : resolve(result[0])
      );
  });
};

const getAllByProperty = (collectionName, property, value) => {
  return new Promise((resolve, reject) => {
    db.collection(collectionName)
      .find({ [property]: value })
      .toArray((err, result) =>
        err ? reject(err) : resolve(result)
      );
  });
};

const updateOne = async (collectionName, id, update) => {
  return new Promise((resolve, reject) => {
    try {
      db.collection(collectionName)
        .updateOne(
          { _id: ObjectId(id) },
          { $addToSet: update },
          (err, result) => {
            const { matchedCount, modifiedCount } = result || {};
            if (err) reject(err);
            const alreadyExists = matchedCount === 1 && modifiedCount === 0;
            resolve({ alreadyExists, id });
          }
        );
    } catch (err) {
      reject(err);
    }
  })
};

const saveObject = async(collectionName, item) => {
  return new Promise((resolve, reject) => {
    try {
      db.collection(collectionName)
        .update(
          { _id: item._id },
          { $set: omit(item, '_id')},
          { upsert: true },
          err => err ? reject(err) : resolve()
        );
    } catch(err) {
      reject(err);
    }
  });
};

const deleteOne = async (collectionName, id) => {
  return new Promise((resolve, reject) => {
    db.collection(collectionName)
      .deleteOne(
        { _id: ObjectId(id) },
        err => err ? reject(err) : resolve(id)
      )
  });
};

const addToSet = async (collectionName, id, addition) => {
  return new Promise((resolve, reject) => {
    db.collection(collectionName)
      .updateOne(
        { _id: ObjectId(id) },
        { $addToSet: addition },
        (err, { matchedCount, modifiedCount }) => {
          if (err) reject(err);
          const alreadyExists = matchedCount === 1 && modifiedCount === 0;
          resolve({ alreadyExists, id });
        }
      );
  });
};

const pullFromSet = async (collectionName, id, removal) => {
  return new Promise((resolve, reject) => {
    db.collection(collectionName)
      .updateOne(
        { _id: ObjectId(id) },
        { $pull: removal },
        (err, { matchedCount, modifiedCount }) => {
          if (err) reject(err);
          const notAMember = matchedCount === 1 && modifiedCount === 0;
          resolve({ notAMember, id });
        }
      );
  });
};

module.exports = {
  db,
  calculateTotalPages,
  insertOne,
  getSome,
  getById,
  getByProperty,
  getByProperties,
  getAllByProperty,
  updateOne,
  saveObject,
  deleteOne,
  addToSet,
  pullFromSet
};
