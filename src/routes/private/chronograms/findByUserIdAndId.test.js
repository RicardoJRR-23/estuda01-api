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
  const jonh_doe_payload = {
    name: 'John Doe',
    email: 'jonh_doe@gmail.com',
    role: 'admin',
    password: '@123password'
  };
  //simulate a chronogram payload for creation
  const chronogram_payload = {
    title: 'Novo Cronograma',
    description: 'Detalhes do cronograma',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    tasks: [
      { name: 'Task 1', completed: false },
      { name: 'Task 2', completed: true }
    ]
  };
  const chronogram_payload_2 = {
    title: '2 Novo Cronograma',
    description: '2 Detalhes do cronograma',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    tasks: [
      { name: 'Task 1', completed: false },
      { name: 'Task 2', completed: true }
    ]
  };
  let authentication_token;
  let user_id;
  let jhon_doe_id;

  //beforeAll: Connect to the database, create a user and simulate a session
  beforeAll(async () => {
    await dbConnect();

    const user_created = await request(app).post('/users').send(user_payload);
    const jonh_doe_created = await request(app)
      .post('/users')
      .send(jonh_doe_payload);
    user_id = user_created.body.id;
    jhon_doe_id = jonh_doe_created.body.id;

    const response = await request(app).post('/sessions').send({
      email: user_payload.email,
      password: user_payload.password
    });

    authentication_token = response.body.access_token;
  });
  beforeEach(async () => {
    const chronogram_data = {
      ...chronogram_payload,
      userId: user_id
    };
    await Chronogram.create(chronogram_data);

    const chronogram_data_2 = {
      ...chronogram_payload_2,
      userId: user_id
    };
    await Chronogram.create(chronogram_data_2);
  });

  afterAll(async () => {
    await dbDisconnect();
  });

  afterEach(async () => {
    await Chronogram.deleteMany({});
  });

  describe('Suceess cases, response with status 200', () => {
    //* 200 - Find all Chronograms of a user

    it('Should return a chronogram with its Id if it belongs to the authenticated user', async () => {
      //Get all chronograms
      const response = await request(app)
        .get(`/chronograms/`)
        .set('authorization', `Bearer ${authentication_token}`);

      //Check if the chronogram created is in the response
      for (const chronogram of response.body) {
        const found = await request(app)
          .get(`/chronograms/${chronogram._id}`)
          .set('authorization', `Bearer ${authentication_token}`);
        expect(found.status).toBe(200);
        expect(found.body).toBeInstanceOf(Array);
        expect(found.body.length).toBeGreaterThan(0);

        expect(chronogram).toMatchObject({
          title: chronogram.title,
          description: chronogram.description,
          tasks: expect.arrayContaining(
            chronogram.tasks.map(task =>
              expect.objectContaining({
                name: task.name,
                completed: task.completed
              })
            )
          ),
          userId: user_id
        });
      }
    });
  });
  describe('Error cases', () => {
    //! 404 - Not Found
    it('Should return 404 if the chronogram was not found', async () => {
      //Testing error 404 with invalid id
      const response = await request(app)
        .get(`/chronograms/123456789012345678901234`)
        .set('authorization', `Bearer ${authentication_token}`);
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: 'Cronograma não encontrado.'
      });
    });
    it('Should return 404 if a user does not own the chronogram', async () => {
      const chronogram_data = {
        ...chronogram_payload,
        userId: jhon_doe_id
      };
      const jhon_doe_chronogram = await Chronogram.create(chronogram_data);
  

      //Testing error 404 with invalid id
      const response = await request(app)
        .get(`/chronograms/${jhon_doe_chronogram._id}`)
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
        .get(`/chronograms/`)
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
