const express = require("express")
const swaggerJSDoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")
require("dotenv").config()

const { dbConnect } = require("./config")
const swagger_options = require("./swagger")
const private_routes = require("./routes/private")
const public_routes = require("./routes/public")

const main = async () => {
  await dbConnect()

  const app = express()
  const PORT = process.env.PORT || 3000
  const swagger_specs = swaggerJSDoc(swagger_options)

  app.use(express.json())

  app.use(private_routes)

  app.use(public_routes)

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swagger_specs))

  // Middleware para rotas inexistentes (404)
  app.use((req, res, next) => {
    res.status(404).json({
      error: "Rota não encontrada",
      path: req.originalUrl,
    })
  })

  // Middleware de tratamento de erros gerais
  app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
      error: err.error || "Erro interno do servidor",
    })
  })



  app.listen(PORT, () => {
    console.log(`O servidor está escutando na porta ${PORT}`)
  })
}

main()
