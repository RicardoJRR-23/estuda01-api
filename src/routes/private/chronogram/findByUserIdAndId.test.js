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

    it('Should return a chronogram with its Id if it belongs to the authenticated user', async () => {
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
      const chronogram_payload_2 = {
        title: '2 Novo Cronograma',
        description: '2 Detalhes do cronograma',
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
      await request(app)
        .post('/chronogram/') // Route to create cronograma being tested
        .set('authorization', `Bearer ${authentication_token}`)
        .send(chronogram_payload_2);

      //Get all chronograms
      const response = await request(app)
        .get(`/chronogram/`)
        .set('authorization', `Bearer ${authentication_token}`);

      //Check if the chronogram created is in the response
      response.body.forEach(async chronogram => {
        const found = await request(app)
          .get(`/chronogram/${response.body[1]._id}`)
          .set('authorization', `Bearer ${authentication_token}`);
        expect(found.status).toBe(200);
        expect(found.body).toBeInstanceOf(Array);
        expect(found.body.length).toBeGreaterThan(0);

        console.log('Found:',found.body[0])

        expect(found.body[0]).toMatchObject({
          title: chronogram_payload_2.title,
          description: chronogram_payload_2.description,
          tasks: expect.arrayContaining(
            chronogram_payload_2.tasks.map(task =>
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

  });
  describe('Error cases', () => {
    //! 401 - Unauthorized
    it('Should return 401 if the token was not sended', async () => {
      const response = await request(app).get(`/chronogram/1234`);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: 'Token não foi enviado.'
      });
    });

    it('Should return 401 if invalid token', async () => {
      const invalid_token = 'invalid-token';
      const response = await request(app)
        .get(`/chronogram/33333`)
        .set('authorization', `Bearer ${invalid_token}`);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: 'Token inválido.'
      });
    });

    //! 404 - Not Found
    it('Should return 404 if the chronogram was not found', async () => {
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


      //Testing error 404 with invalid id
      const response = await request(app)
        .get(`/chronogram/123456789012345678901234`)
        .set('authorization', `Bearer ${authentication_token}`);
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: 'Cronograma não encontrado.'
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
