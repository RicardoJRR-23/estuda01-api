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
    role: 'student',
    password: '@123password'
  };
  const jonh_doe_payload = {
    name: 'John Doe',
    email: 'jonh_doe@email.com',
    role: 'student',
    password: '@123password'
  };
  const admin_payload = {
    name: 'admin',
    email: 'admin@email.com',
    role: 'admin',
    password: '@123password'
  };
  const flashcard_payload = {
    question: 'What is the longitude and latitude of Brazil?',
    answer: '-46.633333, -23.716667',
    subject: 'Geography'
  };

  let flashcard_created;
  let user_id;
  let authentication_token;
  let jhon_doe_id;
  let jhon_doe_access_token;
  let admin_id;
  let admin_access_token;

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

    const admin_created = await request(app).post('/users').send(admin_payload);
    admin_id = admin_created.body.id;

    const admin_response = await request(app).post('/sessions').send({
      email: admin_payload.email,
      password: admin_payload.password
    });

    admin_access_token = admin_response.body.access_token;
  });

  beforeEach(async () => {
    flashcard_created = await request(app)
      .post('/flashcards/')
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

  describe('delete /flashcards/:flashcardId', () => {
    describe('Success Cases', () => {
      describe('200 - OK', () => {
        it('should return 200 if the flashcard is deleted', async () => {
          const response = await request(app)
            .delete(`/flashcards/${flashcard_created.body._id}`)
            .set('Authorization', `Bearer ${authentication_token}`);

          expect(response.status).toBe(200);
          expect(response.body.message).toBe('Flashcard apagado com sucesso.');
          console.log('🔸RESPONSE:', response.body);
        });
        it('should return 200 if the admin tries to delete a flashcard', async () => {
          const response = await request(app)
            .delete(`/flashcards/${flashcard_created.body._id}`)
            .set('Authorization', `Bearer ${admin_access_token}`);

          expect(response.status).toBe(200);
        });
      });
    });

    describe('Error Cases', () => {
      describe('404 - Not Found', () => {
        it('should return 404 if the flashcard with the given ID is not found', async () => {
          const response = await request(app)
            .delete(`/flashcards/098765432167890543215678`)
            .set('Authorization', `Bearer ${authentication_token}`);

          expect(response.status).toBe(404);
          expect(response.body.error).toBe(messages.flashcardNotFound);
        });
      });
      describe('403 - Forbidden', () => {
        it('Should return 403 if the flashcard id is found but does not belong to the authenticated user, and the user is not admin', async () => {
          const response = await request(app)
            .delete(`/flashcards/${flashcard_created.body._id}`)
            .set('authorization', `Bearer ${jhon_doe_access_token}`);

          expect(response.status).toBe(403);
        });
      });
      describe('500 - Internal Server Error', () => {
        it('should return 500 if an internal server error occurs', async () => {
          jest.spyOn(Flashcard, 'findByIdAndDelete').mockImplementation(() => {
            throw new Error('Unexpected Error');
          });
          // Mock of the model return (see example in the file'src/models/Flashcards/index.js')

          const response = await request(app)
            .delete(`/flashcards/${flashcard_created.body._id}`)
            .set('Authorization', `Bearer ${authentication_token}`);

          expect(response.status).toBe(500);
          expect(response.body.error).toBe(
            'Ocorreu um erro inesperado. Tente novamente mais tarde.'
          );
        });
      });
    });
  });
});
