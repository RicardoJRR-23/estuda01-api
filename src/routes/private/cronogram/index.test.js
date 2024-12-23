const request = require('supertest');
const app = require('../../../app.js');

const { Cronograma } = require('../../../models');

const {
  dbConnect,
  dbDisconnect
} = require('../../../__helpers__/mongodbServer/index.js');

jest.mock('../../../models/Cronograma');

describe('Router Tests ', () => {
  //Pre-requisites: User register and session simulation
  // 'src/routes/public/users/index.js'
  // 'src/routes/public/sessions/index.js'

  //user payload to simulate user register
  const user_payload = {
    name: 'Ricardo Rosário',
    email: 'ricardo@gmail.com',
    role: 'admin',
    password: '@123password'
  };

  let authentication_token;
  let user_id;
  let expected_user_payload;

  //beforeAll: Connect to the database, create a user and simulate a session
  beforeAll(async () => {
    await dbConnect();

    const user_created = await request(app).post('/users').send(user_payload);
    user_id = user_created.body.id;

    const response = await request(app).post('/sessions').send({
      email: user_payload.email,
      password: user_payload.password
    });

    authentication_token = response.body.access_token;

    expected_user_payload = {
      id: user_id,
      ...user_payload
    };
    delete expected_user_payload.password;
  });

  afterAll(async () => {
    await dbDisconnect();
  });

  //* Success Case
  describe('Success Cases', () => {
    //* 201 - Created Cronogram

    it('should return 200 if created a cronograma successfully', async () => {
      // Model Return Mock (see example in ficheiro 'src/models/Cronograma/index.js')
      Cronograma.create.mockResolvedValue({
        _id: '63f9e18e68d8d830f8e4f1a3',
        title: 'Novo Cronograma',
        description: 'Detalhes do cronograma',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        tasks: [
          { name: 'Task 1', completed: false },
          { name: 'Task 2', completed: true }
        ],
        userId: '63f9e18e68d8d830f8e4f1a3'
      });

      // Correctly filled form payload
      const payload = {
        title: 'Novo Cronograma',
        description: 'Detalhes do cronograma',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        tasks: [
          { name: 'Task 1', completed: false },
          { name: 'Task 2', completed: true }
        ],
        userId: '63f9e18e68d8d830f8e4f1a3'
      };

      const response = await request(app)
        .post('/cronogram/') // Route to create cronograma being tested
        .set('authorization', `Bearer ${authentication_token}`)
        .send(payload); // Sends the payload as a JSON Object

      expect(response.status).toBe(201);

      expect(response.body).toEqual({
        cronograma: expect.objectContaining({
          _id: expect.any(String),
          title: payload.title,
          description: payload.description,
          startDate: payload.startDate,
          endDate: payload.endDate,
          tasks: expect.any(Array),
          userId: payload.userId
        })
      });
      expect(Cronograma.create).toHaveBeenCalledWith(payload);
    });
  });
  //! Error Cases
  describe('Error Cases', () => {
    //! 400 - Missing or wrongly filled required fields or invalid fields (Bad Request)
    it('should return 400 if the client send a request with missing or wrongly filled required fields or invalid fields in form fields', async () => {
      // Invalid values ​​for fields title and startDate
      const invalidAnswers = [
        undefined,
        null,
        '',
        0,
        false,
        'asdassdad',
        [],
        {}
      ];
      const payload = {
        title: invalidAnswers,
        description: 'Detalhes do erro',
        startDate: invalidAnswers,
        endDate: '2024-01-31',
        tasks: [],
        userId: '63f9e18e68d8d830f8e4f1a3'
      };

      const response = await request(app)
        .post('/cronogram/')
        .set('authorization', `Bearer ${authentication_token}`)
        .send(payload);

      expect(response.status).toBe(400);

      expect(response.body.error).toEqual(expect.any(String));
    });

    //! 404 - Method Not Allowed (Not Found)
    it('should return 404 if the request method is different then POST', async () => {
      // Méthod not expected (example: GET) for the Create Cronogram Route
      const response = await request(app)
        .get('/cronogram/')
        .set('authorization', `Bearer ${authentication_token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toEqual('Rota não encontrada');
    });

    //! 500 - Internal Server Error
    it('should return 500 with detailed error message if creation fails', async () => {
      const mockErrorMessage =
        'Erro ao criar cronograma. Erro interno do servidor';
      Cronograma.create.mockRejectedValue(new Error(mockErrorMessage));

      // Mock of the model return (see example in the file'src/models/Cronograma/index.js')
      const payload = {
        title: 'Erro Cronograma',
        description: 'Detalhes do erro',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        tasks: [
          { name: 'Task 1', completed: false },
          { name: 'Task 2', completed: true }
        ],
        userId: '63f9e18e68d8d830f8e4f1a3'
      };

      const response = await request(app)
        .post('/cronogram/')
        .set('authorization', `Bearer ${authentication_token}`)
        .send(payload);

      expect(response.status).toBe(500);
      // Checking whether the error value, in body object is in the expected format
      expect(response.body).toHaveProperty('error');
      expect(response.body).toEqual({
        error: mockErrorMessage
      });
    });
  });
}); 