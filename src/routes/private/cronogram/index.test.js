const request = require('supertest');
const express = require('express');
const router = require('./index');
const Cronograma = require('../../../models/Cronogram');

jest.mock('../../../models/Cronogram');
describe('Router Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/cronograma', router);
  });

  //* Success Case

  //* 201 - Created Cronogram

  it('should return 200 if created a cronograma successfully', async () => {
    // Mock do retorno do modelo
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

    // Payload enviado
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
      .post('/cronograma/') // Rota sendo testada
      .send(payload); // Envia o payload como JSON

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

  //! Error Cases

  //! 500 - Internal Server Error
  it('should return 500 with detailed error message if creation fails', async () => {
    Cronograma.create.mockRejectedValue(new Error('Erro ao criar cronograma'));

    const payload = {
      title: 'Erro Cronograma',
      description: 'Detalhes do erro',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      tasks: [],
      userId: '63f9e18e68d8d830f8e4f1a3'
    };

    const response = await request(app).post('/cronograma/').send(payload);

    expect(response.status).toBe(500);
    expect(response.body.error).toContain(
      'Erro ao criar cronograma. Erro interno do servidor'
    );
  });

  //! 422 - Invalid UserId (Unprocessable Entity)
  it('should return 422 if the form data is ok, but there is an invalid userId value', async () => {
    const payload = {
      title: 'Erro Cronograma',
      description: 'Detalhes do erro',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      tasks: [],
      userId: undefined
    };

    const response = await request(app).post('/cronograma/').send(payload);

    expect(response.status).toBe(422);
    expect(response.body.error).toContain(
      'Erro de validação: UserId inválido.'
    );
  });

  //! 400 - Invalid Form Data Request (Bad Request)
  it('should return 400 if the client send a request with unexpected values in form fields', async () => {
    const payload = {
      title: undefined,
      description: 'Detalhes do erro',
      startDate: null,
      endDate: '2024-01-31',
      tasks: [],
      userId: '63f9e18e68d8d830f8e4f1a3'
    };

    const response = await request(app).post('/cronograma/').send(payload);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Erro de validação');
  });

  //! 404 - Method Not Allowed (Not Found)
  it('should return 404 if the request method is different then POST', async () => {
    const response = await request(app).get('/cronograma/');
    expect(response.status).toBe(404);
  });
});
