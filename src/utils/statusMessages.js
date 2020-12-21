const {
  SUCCESS,
  CREATED,
  BAD_REQUEST,
  DOES_NOT_EXIST,
  CONFLICT,
  SERVER_ERROR
} = require('../constants/responseCodes');

const success = (res, body) => res.status(SUCCESS).send(body);

const created = (res, body) => res.status(CREATED).send(body);

const badRequest = (res, body) => res.status(BAD_REQUEST).send(body);

const doesNotExist = (res, type, property, container) =>
  res.status(DOES_NOT_EXIST).send({
    message: `${type} [${property}] does not exist${container ? ` in ${container}` : ''}`
  });

const alreadyExists = (res, type, property, value, container) =>
  res.status(CONFLICT).send({
    message: `${type} with ${property} [${value}] already exists${container ? ` in ${container}` : ''}` 
  });

const serverError = (res, error, message) => res.status(SERVER_ERROR).send({ message, error });

module.exports = {
  success,
  created,
  badRequest,
  doesNotExist,
  alreadyExists,
  serverError
};
