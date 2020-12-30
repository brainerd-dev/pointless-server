const router = require('express').Router();
const appInfo = require('../../package.json');

router.get('/', (req, res) => {
  res.send({
    message: `Welcome to the Pointless API v${appInfo.version}!`
  });
});

router.use('/notifications', require('./notifications'));
router.use('/pools', require('./pools'));
router.use('/users', require('./users'));

module.exports = router;
