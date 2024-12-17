const mongoose = require('mongoose');

const dbConnect = async () => {
  try {
    console.info('Conectando a base de dados...');
    await mongoose.connect(process.env.DATABASE_URL);
    console.info('Conectado a base de dados com sucesso.');
  } catch(error) {
    console.error('Erro ao conectar a base de dados:', error);
  }
}

module.exports = {
  dbConnect,
  mongoose
};
