const express = require('express');
const router = express.Router();

const chronogram_routes = require('./chronogram');
const users = require('./users');
const notices = require('./notices');
const study_modules = require('./studyModules');
const flashcardRoutes = require("./flashcard")


// Private routes
router.use('/users', users);

router.use('/chronogram', chronogram_routes);

router.use('/notices', notices);

router.use('/studyModules', study_modules);

router.use("/flashcards", flashcardRoutes);

module.exports = router;
