const router = require('express').Router();
const appInfo = require('../../package.json');

router.get('/', (req, res) => {
  res.send({
    message: `Welcome to the Pointless API v${appInfo.version}!`
  });
});

router.use('/pools', require('./pools'));
router.use('/notifications', require('./notifications'));

module.exports = router;
