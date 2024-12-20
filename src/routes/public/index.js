const express = require('express');
const router = express.Router();

const users = require('./users');
const sessions = require('./sessions');

router.use('/users', users);

router.use('/sessions', sessions);

module.exports = router;