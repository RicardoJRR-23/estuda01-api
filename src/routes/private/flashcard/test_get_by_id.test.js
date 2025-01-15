const request = require('supertest');
const app = require('../../../app.js');
const mongoose = require('mongoose');

const { Flashcard } = require('../../../models/index.js');

const {
  dbConnect,
  dbDisconnect
} = require('../../../__helpers__/mongodbServer/index.js');

describe('GET /flashcard/:flashcardId  ', () => {
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

  const flashcard_payload = {
    question: 'Is this real life?',
    answer: 'Yes, it is.',
    subject: 'Philosophy'
  };

  const messages = {
    myFlashcard: 'É meu flashcard',
    notMyFlashcard: 'Não é meu flashcard',
    invalidFlashcardId: 'FlashcardId inválido.',
    tokenNotSent: 'Token não foi enviado.',
    tokenInvalid: 'Token inválido.',
    flashcardNotFound: 'O flashcard não foi encontrado',
    internalError: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
  };

  let authentication_token;
  let user_id;
  let flashcard_id;
  let jhon_doe_id;
  let jhon_doe_access_token;

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

    const jhon_doe_created = await request(app)
      .post('/users')
      .send(jonh_doe_payload);
    jhon_doe_id = jhon_doe_created.body.id;
    const jonh_doe_response = await request(app).post('/sessions').send({
      email: jonh_doe_payload.email,
      password: jonh_doe_payload.password
    });

    jhon_doe_access_token = jonh_doe_response.body.access_token;
  });

  beforeEach(async () => {
    const response = await request(app)
      .post('/flashcard/')
      .set('Authorization', `Bearer ${authentication_token}`)
      .send(flashcard_payload);

    flashcard_id = response.body._id;
  });

  afterAll(async () => {
    await dbDisconnect();
  });

  afterEach(async () => {
    await Flashcard.deleteMany({});
  });

  describe('Suceess cases, response with status 200', () => {
    //* 200 - Find all flashcards of a user

    it('Should return the correct structure for a valid flashcard', async () => {
      //Get the flashcard
      const response = await request(app)
        .get(`/flashcard/${flashcard_id}`)
        .set('authorization', `Bearer ${authentication_token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(messages.myFlashcard);
      expect(response.body.flashcard).toMatchObject({
        _id: flashcard_id,
        question: flashcard_payload.question,
        answer: flashcard_payload.answer,
        subject: flashcard_payload.subject
      });
      console.log(response.body);
    });

    it('Should return a flashcard with no subject', async () => {
      const flashcard_payload = {
        question: 'Is this real life?',
        answer: 'Yes, it is.'
      };
      const flashcard = await request(app)
        .post('/flashcard/') // Route to create cronograma being tested
        .set('authorization', `Bearer ${authentication_token}`)
        .send(flashcard_payload);

      //Get the flashcard
      const response = await request(app)
        .get(`/flashcard/${flashcard.body._id}`)
        .set('authorization', `Bearer ${authentication_token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(messages.myFlashcard);
      console.log(response.body);
    });

    it('Should return the flashcard, but does not belong to user', async () => {
      //Get the flashcard
      const response = await request(app)
        .get(`/flashcard/${flashcard_id}`)
        .set('authorization', `Bearer ${jhon_doe_access_token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(messages.notMyFlashcard);
      expect(response.body.flashcard).toMatchObject({
        _id: flashcard_id,
        question: flashcard_payload.question,
        answer: flashcard_payload.answer,
        subject: flashcard_payload.subject
      });
      console.log(response.body);
    });
  });
  describe('Error cases', () => {

    describe('400 - Bad Request', () => {
      it('Should return 400 if, the flashcard id is invalid', async () => {
        const invalid_id = [
          null,
          undefined,
          ['invalid_id', 'invalid_id'],
          { invalid_id: 'invalid_id' },
          0,
          true,
          false,
          'invalid_id'
        ];

        for (let i = 0; i < invalid_id.length; i++) {
          const response = await request(app)
            .get(`/flashcard/${invalid_id[i]}`)
            .set('authorization', `Bearer ${authentication_token}`);

          expect(response.status).toBe(400);
          expect(response.body.message).toBe(messages.invalidFlashcardId);
          console.log(response.body);
        }
      });
    });
    describe('401 - Unauthorized', () => {
      it('Should return 401 if the authentication token is invalid', async () => {
        const invalid_token = 'invalid_token';
        const response = await request(app)
          .get(`/flashcard/${flashcard_id}`)
          .set('authorization', `Bearer ${invalid_token}`)
          .expect(401);
        expect(response.body.error).toBe(messages.tokenInvalid);
      });

      it('Should return 401 if the user is not authenticated', async () => {
        const response = await request(app)
          .get(`/flashcard/${flashcard_id}`)
          .expect(401);
        expect(response.body.error).toBe('Token não foi enviado.');
      });
    });
    describe('404 - Not Found', () => {
      it('Should return 404 if, the flaschard was Not Found', async () => {
        const response = await request(app)
          .get(`/flashcard/123456789012345678901234`) //Inexistend flashcard id
          .set('authorization', `Bearer ${authentication_token}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe(messages.flashcardNotFound);
        console.log(response.body);
      });
    });
    describe('500 - Internal Server Error', () => {
      it('Should return 500 with if there was an unexpected error occurred', async () => {
        const mockErrorMessage = messages.internalError;
        // Mocking the `create` method of the `Cronogram` model
        jest
          .spyOn(Flashcard, 'findOne')
          .mockRejectedValue(new Error(mockErrorMessage));

        const response = await request(app)
          .get(`/flashcard/${flashcard_id}`)
          .set('authorization', `Bearer ${authentication_token}`);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
        expect(response.body).toEqual({
          error: mockErrorMessage
        });
        //Deleting the mock to avoid interfering with other tests
        jest.restoreAllMocks();
      });
    });
  });
});
