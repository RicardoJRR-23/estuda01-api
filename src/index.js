const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const { dbConnect } = require('./config');
const swagger_options = require('./swagger');
const private_routes = require('./routes/private');
const public_routes = require('./routes/public');

const main = async () => {
  await dbConnect();

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  app.use(public_routes);
  
  app.use(private_routes);

  const swagger_specs = swaggerJSDoc(swagger_options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger_specs));

  app.listen(PORT, () => { 
    console.log(`O servidor está escutando na porta ${PORT}`); 
  });
};

main();
