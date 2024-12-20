const app = require('./app');
const { dbConnect } = require('./config');

const main = async () => {
  await dbConnect();

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => { 
    console.log(`O servidor está escutando na porta ${PORT}`); 
  });
}

main();
