const request = require('supertest');
const app = require('../../../app.js');
const mongoose = require('mongoose');

const { Flashcard } = require('../../../models/index.js');

const {
  dbConnect,
  dbDisconnect
} = require('../../../__helpers__/mongodbServer/index.js');

describe('Router Tests ', () => {
  //Pre-requisites: User register and session simulation
  // 'src/routes/public/users/index.js'
  // 'src/routes/public/sessions/index.js'

  const messages = {
    myFlashcard: 'É meu flashcard',
    notMyFlashcard: 'Não é meu flashcard',
    notMyFlashcards: 'Não são meus flashcards',
    invalidFlashcardId: 'FlashcardId inválido.',
    tokenNotSent: 'Token não foi enviado.',
    tokenInvalid: 'Token inválido.',
    flashcardNotFound: 'O Flashcard não foi encontrado.',
    internalError: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
  };

  //user payload to simulate user register
  const user_payload = {
    name: 'Ricardo Rosário',
    email: 'ricardo@gmail.com',
    role: 'admin',
    password: '@123password'
  };
  const jonh_doe_payload = {
    name: 'John Doe',
    email: 'jonh_doe@email.com',
    role: 'student',
    password: '@123password'
  };
  const flashcard_payload = {
    question: 'What is the longitude and latitude of Brazil?',
    answer: '-46.633333, -23.716667',
    subject: 'Geography'
  };
  const flashcard_no_subject_payload = {
    question: 'Is this real life?',
    answer: 'Yes, it is.'
  };

  let flashcard_created;
  let authentication_token;
  let user_id;
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

    const jonh_doe_created = await request(app)
      .post('/users')
      .send(jonh_doe_payload);
    jhon_doe_id = jonh_doe_created.body.id;

    const jonh_doe_response = await request(app).post('/sessions').send({
      email: jonh_doe_payload.email,
      password: jonh_doe_payload.password
    });

    jhon_doe_access_token = jonh_doe_response.body.access_token;
  });

  beforeEach(async () => {
    flashcard_created = await request(app)
      .post('/flashcard/')
      .set('Authorization', `Bearer ${authentication_token}`)
      .send(flashcard_payload);
  });

  afterAll(async () => {
    await dbDisconnect();
  });

  afterEach(async () => {
    await Flashcard.deleteMany({});
    flashcard_created.length = 0;
  });

  describe('PUT /flashcard/', () => {
    describe('Error Cases', () => {
      describe('400 - Bad Request', () => {
        describe('Missing Fields', () => {
          it('Should return 400 if question is missing', async () => {
            const flashcards_update = {
              answer: 'updated answer',
              subject: 'updated subject'
            };

            const response = await request(app)
              .put(`/flashcard/${flashcard_created.body._id}`)
              .set('Authorization', `Bearer ${authentication_token}`)
              .send(flashcards_update);

            expect(response.status).toBe(400);
            console.error(response.body.error);
          });
        });
      });
    });
  });
});
