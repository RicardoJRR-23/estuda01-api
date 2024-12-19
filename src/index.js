const app = require('./app');
const { dbConnect } = require('./config');

const main = async () => {
  await dbConnect()

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => { 
    console.log(`O servidor está escutando na porta ${PORT}`); 
  });
}

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
