const express = require("express")
const router = express.Router()

const cronogramaRoutes = require("./cronogram")
const users = require("./users")

//Roteadores utilizados
router.use("/users", users)
router.use("/cronogram", cronogramaRoutes)

module.exports = router
