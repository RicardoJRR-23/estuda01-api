const request = require('supertest');
const app = require('../../../app.js');
const mongoose = require('mongoose');

const { Chronogram } = require('../../../models/index.js');

const {
  dbConnect,
  dbDisconnect
} = require('../../../__helpers__/mongodbServer/index.js');

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
    //* 201 - Created Chronogram

    it('Should return 201 if created a cronograma successfully', async () => {
      // Model Return Mock (see example in ficheiro 'src/models/Cronograma/index.js')

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
        userId: user_id
      };

      // Regex to validate the yyyy-mm-dd format
      const date_regex = /^\d{4}-\d{2}-\d{2}$/;

      const response = await request(app)
        .post('/chronogram/') // Route to create chronogram being tested
        .set('authorization', `Bearer ${authentication_token}`)
        .send(payload); // Sends the payload as a JSON Object

      expect(date_regex.test(payload.startDate)).toBe(true);
      expect(date_regex.test(payload.endDate)).toBe(true);

      expect(response.status).toBe(201);

      const chronogram = await Chronogram.findOne({ userId: user_id });
      const chronogram_object = chronogram.toObject();

      expect(chronogram).not.toBeNull();
      expect(chronogram_object).toMatchObject({
        title: payload.title,
        description: payload.description,
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
        tasks: expect.arrayContaining(
          payload.tasks.map(task =>
            expect.objectContaining({
              name: task.name,
              completed: task.completed
            })
          )
        )
      });
    });
  });
  //! Error Cases
  describe('Error Cases', () => {
    //! 400 - Missing or wrongly filled required fields or invalid fields (Bad Request)
    it('Should return 400 if the  the required "title" field  is send in a request with missing or wrongly filled, or type other then String', async () => {
      // Invalid values ​​for fields title
      const invalid_answers = [
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
        title: invalid_answers,
        description: 'Detalhes do erro',
        startDate: '2024-01-10',
        endDate: '2024-01-31',
        tasks: [],
        userId: '63f9e18e68d8d830f8e4f1a3'
      };

      const response = await request(app)
        .post('/chronogram/')
        .set('authorization', `Bearer ${authentication_token}`)
        .send(payload);

      expect(response.status).toBe(400);

      expect(response.body.error).toEqual(expect.any(String));
    });
    it('Should return 400 if the the required "startDate" field  is send in a request with missing or wrongly filled, or invalid Date form', async () => {
      // Invalid values ​​for fields startDate
      const invalid_answers = [
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
        title: 'Titulo do erro 400',
        description: 'Detalhes do erro',
        startDate: invalid_answers,
        endDate: '2024-01-31',
        tasks: [],
        userId: '63f9e18e68d8d830f8e4f1a3'
      };

      // Regex to validate the yyyy-mm-dd format
      const date_regex = /^\d{4}-\d{2}-\d{2}$/;

      const response = await request(app)
        .post('/chronogram/')
        .set('authorization', `Bearer ${authentication_token}`)
        .send(payload);

      expect(date_regex.test(payload.startDate)).toBe(false);

      expect(response.status).toBe(400);

      expect(response.body.error).toEqual(expect.any(String));
    });

    it('Should return 400 if the the required "endDate" field  is send in a request with missing or wrongly filled, or invalid Date form', async () => {
      // Invalid values ​​for fields startDate
      const invalid_answers = [
        undefined,
        null,
        '',
        0,
        false,
        'asdassdad',
        [],
        {},
        '31_01_2024'
      ];
      const payload = {
        title: 'Titulo do erro 400',
        description: 'Detalhes do erro',
        startDate: '2024-01-01',
        endDate: invalid_answers,
        tasks: [],
        userId: '63f9e18e68d8d830f8e4f1a3'
      };

      // Regex to validate the yyyy-mm-dd format
      const date_regex = /^\d{4}-\d{2}-\d{2}$/;

      const response = await request(app)
        .post('/chronogram/')
        .set('authorization', `Bearer ${authentication_token}`)
        .send(payload);

      expect(response.status).toBe(400);

      expect(date_regex.test(invalid_answers)).toBe(false);

      expect(response.body.error).toEqual(expect.any(String));
    });

    //! 404 - Method Not Allowed (Not Found)
    it('Should return 404 if the request method is different then POST', async () => {
      // Méthod not expected (example: GET) for the Create Cronogram Route
      const response = await request(app)
        .get('/chronogram/')
        .set('authorization', `Bearer ${authentication_token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toEqual('Rota não encontrada');
    });

    //! 500 - Internal Server Error
    it('Should return 500 with detailed error message if creation fails', async () => {
      const mockErrorMessage =
        'Erro ao criar cronograma. Erro interno do servidor';
      // Mockando o método `create` do modelo `Cronogram`
      jest
        .spyOn(Chronogram, 'create')
        .mockRejectedValue(new Error(mockErrorMessage));

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
        .post('/chronogram/')
        .set('authorization', `Bearer ${authentication_token}`)
        .send(payload);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toEqual({
        error: mockErrorMessage
      });
      // Limpando o mock para evitar interferências em outros testes
      jest.restoreAllMocks();
    });
  });
});
