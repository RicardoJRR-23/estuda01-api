const express = require('express');
const router = express.Router();

const chronogram_routes = require('./chronogram');
const users = require('./users');

//Roteadores utilizados
router.use('/users', users);
router.use('/chronogram', chronogram_routes);

module.exports = router;
