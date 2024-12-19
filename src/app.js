const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path')
if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config();
} else {
  require('dotenv').config({ path: path.join(process.cwd(), './.env.example') });
}

const swagger_options = require('./swagger');
const private_routes = require('./routes/private');
const public_routes = require('./routes/public');

const app = express();

app.use(express.json());

app.use(public_routes);

app.use(private_routes);

const swagger_specs = swaggerJSDoc(swagger_options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger_specs));

module.exports = app;
