const express = require("express")
const router = express.Router()
const cronogramaRoutes = require("./cronogram")

//Roteadores utilizados
router.use("/cronogram", cronogramaRoutes);

module.exports = router
