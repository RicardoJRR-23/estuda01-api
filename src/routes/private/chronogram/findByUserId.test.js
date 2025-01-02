const request = require('supertest');
const app = require('../../../app.js');
const mongoose = require('mongoose');

const { Chronogram } = require('../../../models/index.js');

const {
  dbConnect,
  dbDisconnect
} = require('../../../__helpers__/mongodbServer/index.js');

describe('GET /:userId ', () => {
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
  });

  afterAll(async () => {
    await dbDisconnect();
  });

  describe('Suceess cases, response with status 200', () => {
    //* 200 - Find all Chronograms of a user

    it('Should return a empty array, if not finding any chronogram', async () => {
      const response = await request(app)
        .get(`/chronogram/`)
        .set('authorization', `Bearer ${authentication_token}`);

      expect(response.status).toBe(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toEqual(0);
    });
    it('Should return a chronogram with userId of the authenticated user', async () => {
      //simulate a chronogram payload for creation
      const chronogram_payload = {
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

      //Create the chronogram
      await request(app)
        .post('/chronogram/') // Route to create cronograma being tested
        .set('authorization', `Bearer ${authentication_token}`)
        .send(chronogram_payload);

      // Regex to validate the yyyy-mm-dd format
      const date_regex = /^\d{4}-\d{2}-\d{2}$/;

      //Get all chronograms
      const response = await request(app)
        .get(`/chronogram/`)
        .set('authorization', `Bearer ${authentication_token}`);

      expect(date_regex.test(chronogram_payload.startDate)).toBe(true);
      expect(date_regex.test(chronogram_payload.endDate)).toBe(true);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);

      console.log(response.body);
      //Check if the chronogram created is in the response
      response.body.forEach(chronogram => {
        expect(chronogram).toMatchObject({
          title: chronogram_payload.title,
          description: chronogram_payload.description,
          tasks: expect.arrayContaining(
            chronogram_payload.tasks.map(task =>
              expect.objectContaining({
                name: task.name,
                completed: task.completed
              })
            )
          ),
          userId: user_id
        });
      });
    });
    it('Should return a chronogram with empty task array', async () => {
      const chronogram_payload = {
        title: 'Novo Cronograma',
        description: 'Detalhes do cronograma',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        tasks: [],
        userId: user_id
      };

      await request(app)
        .post('/chronogram/') // Route to create cronograma being tested
        .set('authorization', `Bearer ${authentication_token}`)
        .send(chronogram_payload);

      // Regex to validate the yyyy-mm-dd format
      const date_regex = /^\d{4}-\d{2}-\d{2}$/;

      const response = await request(app)
        .get(`/chronogram/`)
        .set('authorization', `Bearer ${authentication_token}`);

      expect(date_regex.test(chronogram_payload.startDate)).toBe(true);
      expect(date_regex.test(chronogram_payload.endDate)).toBe(true);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);

      response.body.forEach(chronogram => {
        expect(chronogram).toMatchObject({
          title: chronogram_payload.title,
          description: chronogram_payload.description,
          tasks: expect.arrayContaining([]),
          userId: user_id
        });
      });
    });
  });
  describe('Error cases', () => {
    //! 401 - Unauthorized
    it('Should return 401 if the token was not sended', async () => {
      const response = await request(app).get(`/chronogram/`);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: 'Token não foi enviado.'
      });
    });

    it('Should return 401 if invalid token', async () => {
      const invalid_token = 'invalid-token';
      const response = await request(app)
        .get(`/chronogram/`)
        .set('authorization', `Bearer ${invalid_token}`);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: 'Token não é válido.'
      });
    });

    //! 500 - Internal Server Error
    it('Should return 500 with if there was an unexpected error occurred', async () => {
      const mockErrorMessage =
        'Ocorreu um erro inesperado. Tente novamente mais tarde.';
      // Mockando o método `create` do modelo `Cronogram`
      jest
        .spyOn(Chronogram, 'find')
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
        .get(`/chronogram/`)
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
