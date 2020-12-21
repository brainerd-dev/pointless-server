const validator = require('express-joi-validation').createValidator({
  passError: true // Pass along the error so we can build a custom response.
});

const validationErrorHandler = (err, req, res, next) => {
  if (err && err.error && err.error.isJoi) {
    res.status(400).json({
      message: err.error.toString()
    });
  } else {
    next(err);
  }
}

module.exports = {
  validator,
  validationErrorHandler
};
