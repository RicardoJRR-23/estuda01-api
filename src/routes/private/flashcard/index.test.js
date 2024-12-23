const request = require('supertest');
const { Flashcard } = require('../../../models');
const app = require('../../../app.js');
const {
  dbConnect,
  dbDisconnect
} = require('../../../__helpers__/mongodbServer/index.js');

jest.mock('../../../models/Flashcard');

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
    //* 201 - Created Flashcard
    it('should return 201 if created a flashcard successfully', async () => {
      // Model Return Mock (see example in ficheiro 'src/models/Flashcard/index.js')
      Flashcard.create.mockResolvedValue({
        _id: '71f9e18e68d8d830f8e4f1a0',
        question: 'Is this real life?',
        answer: 'Yes, it is.',
        subject: 'Philosophy',
        userId: '63f9e18e68d8d830f8e4f1a3'
      });

      // Correctly filled form payload
      const payload = {
        question: 'Is this real life?',
        answer: 'Yes, it is.',
        subject: 'Philosophy',
        userId: '63f9e18e68d8d830f8e4f1a3'
      };

      const response = await await request(app)
        .post('/flashcard/') // Route to create flashcard being tested
        .set('authorization', `Bearer ${authentication_token}`)
        .send(payload); // Sends the payload as a JSON Object
      expect(response.status).toBe(201);

      expect(response.body).toEqual({
        flashcard: expect.objectContaining({
          _id: expect.any(String),
          question: payload.question,
          answer: payload.answer,
          subject: payload.subject,
          userId: payload.userId
        })
      });
      expect(Flashcard.create).toHaveBeenCalledWith(payload);
    });
  });

  //! Error Cases
  describe('Error Cases', () => {
    //! 400 - Invalid Form Data Request (Bad Request)
    it('should return 400 if unexpected values in form fields', async () => {
      // Invalid values ​​for fields question and answer
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
        question: invalidAnswers,
        answer: invalidAnswers,
        subject: 'Philosophy',
        userId: '63f9e18e68d8d830f8e4f1a3'
      };

      const response = await request(app)
        .post('/flashcard/')
        .set('authorization', `Bearer ${authentication_token}`)
        .send(payload);

      expect(response.status).toBe(400);

      expect(response.body.error).toEqual(expect.any(String));
    });

    //! 404 - Method Not Allowed (Not Found)
    it('should return 404 if the request method is different then POST, for example: get', async () => {
      // Méthod not expected (example: GET) for the Create Flashcard Route
      const response = await request(app)
        .get('/flashcard/')
        .set('authorization', `Bearer ${authentication_token}`);
      expect(response.status).toBe(404);
    });

    //! 500 - Internal Server Error
    it('should return 500 if an internal server error occurs', async () => {
      const mockErrorMessage =
        'Ocorreu um erro inesperado. Tente novamente mais tarde.';
      Flashcard.create.mockRejectedValue(new Error(mockErrorMessage));

      // Mock of the model return (see example in the file'src/models/Flashcard/index.js')
      const payload = {
        question: 'Is this real life?',
        answer: 'Yes, it is.',
        subject: 'Philosophy',
        userId: '63f9e18e68d8d830xxxxxxx'
      };

      const response = await request(app)
        .post('/flashcard/')
        .set('authorization', `Bearer ${authentication_token}`)
        .send(payload);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: mockErrorMessage
      });
    });
  });
});
