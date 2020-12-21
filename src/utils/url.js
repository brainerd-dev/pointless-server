const isEmpty = require('lodash/isEmpty');

const formatUrlParams = options => {
  return (!isEmpty(options) &&
    `?${Object.keys(options).map(o =>
      `${o}=${options[o]}`
    ).join('&')}`) || '';
}

const isDefined = value => {
  if (typeof value === 'string') {
    return value !== 'undefined';
  }
  return !!value;
};

module.exports = {
  formatUrlParams,
  isDefined
};
