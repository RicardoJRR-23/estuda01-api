const express = require('express');
const router = express.Router();

const users = require('./users');
const notices = require('./notices');

router.use('/users', users);

router.use('/notices', notices);

module.exports = router;