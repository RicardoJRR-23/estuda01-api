const express = require('express');
const router = express.Router();

const cronograma_routes = require('./cronogram');
const users = require('./users');

//Roteadores utilizados
router.use('/users', users);
router.use('/cronogram', cronograma_routes);

module.exports = router;
