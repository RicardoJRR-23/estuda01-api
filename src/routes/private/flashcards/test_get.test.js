const request = require('supertest');
const app = require('../../../app.js');
const mongoose = require('mongoose');

const { Flashcard } = require('../../../models/index.js');

const {
  dbConnect,
  dbDisconnect
} = require('../../../__helpers__/mongodbServer/index.js');

describe('GET /flashcards/ ', () => {
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
    noFlashcard: 'Nenhuma flashcard encontrada.',
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
  const flashcard_payload = [
    {
      question: 'Is this real life?',
      answer: 'Yes, it is.',
      subject: 'Philosophy'
    },
    {
      question: '1+1?',
      answer: '2',
      subject: 'Math'
    },
    {
      question: 'What is the longitude and latitude of Brazil?',
      answer: '-46.633333, -23.716667',
      subject: 'Geography'
    }
  ];
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

    access_token = response.body.access_token;
  });

  beforeEach(async () => {
    await request(app)
      .post('/flashcards/')
      .set('Authorization', `Bearer ${authentication_token}`)
      .send(flashcard_payload);
  });

  afterAll(async () => {
    await dbDisconnect();
  });

  afterEach(async () => {
    await Flashcard.deleteMany({});
  });

  describe('Suceess cases', () => {
    describe('200 - OK', () => {
      it('Should return a flaschard  object', async () => {
        await Flashcard.deleteMany({});

        const single_flashcard_payload = {
          question: 'Is this real life?',
          answer: 'Yes, it is.',
          subject: 'Philosophy'
        };

        await request(app)
          .post('/flashcards/')
          .set('Authorization', `Bearer ${authentication_token}`)
          .send(single_flashcard_payload);

        const response = await request(app)
          .get('/flashcards/')
          .set('Authorization', `Bearer ${authentication_token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.flashcard)).toBe(false);
        expect(typeof response.body.flashcard).toBe('object');

        expect(response.body.flashcard).toMatchObject({
          question: 'Is this real life?',
          answer: 'Yes, it is.',
          subject: 'Philosophy',
          userId: user_id
        });
      });

      it('Should get an array of flashcards', async () => {
        const response = await request(app)
          .get('/flashcards/')
          .set('Authorization', `Bearer ${authentication_token}`);

        console.log(response.body);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.flashcards)).toBe(true);

        const actualFlashcards = response.body.flashcards.map(
          ({ question, answer, subject }) => ({
            question,
            answer,
            subject
          })
        );

        // Validate that all expected flashcards are present
        expect(actualFlashcards).toEqual(
          expect.arrayContaining(
            flashcard_payload.map(({ question, answer, subject }) => ({
              question,
              answer,
              subject
            }))
          )
        );
      });
    });
  });

  describe('Error cases', () => {

    describe('404 - Not Found', () => {
      test('if the user has no flashcards', async () => {
        await Flashcard.deleteMany({});
        const response = await request(app)
          .get('/flashcards/')
          .set('Authorization', `Bearer ${authentication_token}`)
          .expect(404);
        expect(response.body.error).toBe(messages.noFlashcard);
      });
    });

    describe('500 - Internal Server Error', () => {
      it('Should return 500 if an unexpected error happens', async () => {
        jest.spyOn(Flashcard, 'find').mockImplementation(() => {
          throw new Error('Unexpected Error');
        });
        const response = await request(app)
          .get('/flashcards/')
          .set('Authorization', `Bearer ${authentication_token}`)
          .expect(500);
        expect(response.body.error).toBe(
          'Ocorreu um erro inesperado. Tente novamente mais tarde.'
        );
      });
    });
  });
});


describe('GET /flashcards/:flashcardId  ', () => {
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
      .post('/flashcards/')
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

    it('Should return the correct structure for a valid flashcard', async () => {
      //Get the flashcard
      const response = await request(app)
        .get(`/flashcards/${flashcard_id}`)
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
        .post('/flashcards/') // Route to create cronograma being tested
        .set('authorization', `Bearer ${authentication_token}`)
        .send(flashcard_payload);

      //Get the flashcard
      const response = await request(app)
        .get(`/flashcards/${flashcard.body._id}`)
        .set('authorization', `Bearer ${authentication_token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(messages.myFlashcard);
      console.log(response.body);
    });

    it('Should return the flashcard, but does not belong to user', async () => {
      //Get the flashcard
      const response = await request(app)
        .get(`/flashcards/${flashcard_id}`)
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
            .get(`/flashcards/${invalid_id[i]}`)
            .set('authorization', `Bearer ${authentication_token}`);

          expect(response.status).toBe(400);
          expect(response.body.message).toBe(messages.invalidFlashcardId);
          console.log(response.body);
        }
      });
    });
   
    describe('404 - Not Found', () => {
      it('Should return 404 if, the flaschard was Not Found', async () => {
        const response = await request(app)
          .get(`/flashcards/123456789012345678901234`) //Inexistend flashcard id
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
          .get(`/flashcards/${flashcard_id}`)
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
