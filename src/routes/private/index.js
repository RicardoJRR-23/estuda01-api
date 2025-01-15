const express = require('express');
const router = express.Router();

const chronogram_routes = require('./chronograms');
const users = require('./users');
const notices = require('./notices');
const study_modules = require('./studyModules');
const flashcardRoutes = require("./flashcard")


// Private routes
router.use('/users', users);

router.use('/chronograms', chronogram_routes);

router.use('/notices', notices);

router.use('/studyModules', study_modules);

router.use("/flashcard", flashcardRoutes);

module.exports = router;
