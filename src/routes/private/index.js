const express = require('express');
const router = express.Router();

const chronogram_routes = require('./chronogram');
const users = require('./users');
const notices = require('./notices');

//Roteadores utilizados
router.use('/users', users);
router.use('/chronogram', chronogram_routes);
router.use('/notices', notices);

module.exports = router;


