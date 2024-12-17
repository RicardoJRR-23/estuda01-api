const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Estuda01 CRUD REST API',
      version: '1.0.0'
    },
    servers: [
      {
        url: process.env.API_BASE_URL || `http://localhost:${process.env.PORT}`,
        description: 'Servidor de desenvolvimento'
      }
    ]
  },
  apis: ['./src/routes/**/*.js']
}

module.exports = options;
