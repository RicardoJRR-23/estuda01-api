const express = require("express")
const router = express.Router()

const cronogramaRoutes = require("./cronogram")
const users = require('./users');
const flashcardRoutes = require("./flashcard")

//Roteadores utilizados
router.use('/users', users);
router.use("/cronogram", cronogramaRoutes);
router.use("/flashcard", flashcardRoutes);

module.exports = router
