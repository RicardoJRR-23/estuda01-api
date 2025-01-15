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
    describe('Success Cases', () => {
      describe('200 - OK', () => {
        it('should return 200, if the flashcards are updated', async () => {
          const flashcards_update = {
            question: 'Updated question ',
            answer: 'updated answer',
            subject: 'updated subject'
          };

          const response = await request(app)
            .put(`/flashcard/${flashcard_created.body._id}`)
            .set('Authorization', `Bearer ${authentication_token}`)
            .send(flashcards_update);
          expect(response.status).toBe(200);
          expect(response.body.question).toBe(flashcards_update.question);
          expect(response.body.answer).toBe(flashcards_update.answer);
          expect(response.body.subject).toBe(flashcards_update.subject);
        });
        it('should update the flashcards, if there is no subject', async () => {
          const flashcard_no_subject_created = await request(app)
            .post('/flashcard/')
            .set('Authorization', `Bearer ${authentication_token}`)
            .send(flashcard_no_subject_payload);
          const flashcards_update = {
            question: 'Updated question ',
            answer: 'updated answer'
          };
          console.log('should update the flashcards, if there is no subject');
          const response = await request(app)
            .put(`/flashcard/${flashcard_no_subject_created.body._id}`)
            .set('Authorization', `Bearer ${authentication_token}`)
            .send(flashcards_update);

          expect(response.body.question).toBe(flashcards_update.question);
          expect(response.body.answer).toBe(flashcards_update.answer);
        });
        describe('Missing Fields', () => {
          it('Should return 200 if subject is missing, but the returned object has a null subject', async () => {
            const flashcards_update = {
              question: 'Updated question',
              answer: 'updated answer'
            };

            const response = await request(app)
              .put(`/flashcard/${flashcard_created.body._id}`)
              .set('Authorization', `Bearer ${authentication_token}`)
              .send(flashcards_update);

            expect(response.status).toBe(200);
            expect(response.body.subject).toBe(null);
          });
        });
      });
    });

    describe('Error Cases', () => {
      describe('400 - Bad Request', () => {
        describe('Unexpected Field Values', () => {
          it('should return 400 if different Flashcards have an unexpected field', async () => {
            // Invalid values for fields question and answer
       
              const invalid_payload_update = {
                question: 'Updated question ',
                answer: 'updated answer',
                subject: 'Math',
                invalidField: 'invalidValue'
              };
              const response = await request(app)
                .put(`/flashcard/${flashcard_created.body._id}`)
                .set('Authorization', `Bearer ${authentication_token}`)
                .send(invalid_payload_update);

              expect(response.status).toBe(400);
              expect(response.body.error).toEqual(expect.any(String));
              const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
              console.error(normalize(response.body.error));
            
          });

          it('should return 400 if different Flashcards have an invalid playload', async () => {
            // Invalid values for fields question and answer
            const invalidQuestions = [[], {}, null];
            const invalidAnswers = [[], {}, null];
            for (let i = 0; i < invalidQuestions.length; i++) {
              const invalid_payload_update = {
                question: invalidQuestions[i],
                answer: invalidAnswers[i],
                subject: 'Math'
              };
              const response = await request(app)
                .put(`/flashcard/${flashcard_created.body._id}`)
                .set('Authorization', `Bearer ${authentication_token}`)
                .send(invalid_payload_update);

              expect(response.status).toBe(400);
              expect(response.body.error).toEqual(expect.any(String));
              const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
              console.error(normalize(response.body.error));
            }
          });

          it('should return 400 if unexpected `subject` value in form', async () => {
            // Invalid values for fields question and answer
            const invalidSubjects = [[], {}];
            for (const invalidSubject of invalidSubjects) {
              const invalid_payload_update = {
                question: 'Updated question ',
                answer: 'updated answer',
                subject: invalidSubject
              };

              const response = await request(app)
                .put(`/flashcard/${flashcard_created.body._id}`)
                .set('Authorization', `Bearer ${authentication_token}`)
                .send(invalid_payload_update);

              expect(response.status).toBe(400);
              expect(response.body.error).toEqual(expect.any(String));
              const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
              console.error(normalize(response.body.error));
            }
          });
        });

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
          it('Should return 400 if answer is missing', async () => {
            const flashcards_update = {
              question: 'Updated question',
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
      describe('401 - Unauthorized', () => {
        it('should return 401 if the user is not authenticated', async () => {
          const response = await request(app)
            .put(`/flashcard/${flashcard_created.body._id}`)
            .send(flashcard_payload);
          expect(response.status).toBe(401);
          expect(response.body.error).toBe('Token não foi enviado.');
        });
        it('should return 401 if the user is not authorized', async () => {
          const invalid_token = 'invalid_token';
          const response = await request(app)
            .put(`/flashcard/${flashcard_created.body._id}`)
            .set('Authorization', `Bearer ${invalid_token}`)
            .send(flashcard_payload);
          expect(response.status).toBe(401);
          expect(response.body.error).toBe('Token inválido.');
        });
      });
      describe('404 - Not Found', () => {
        it('should return 404 if the flashcard with the given ID is not found', async () => {
          const flashcards_update = {
            question: 'Updated question ',
            answer: 'updated answer',
            subject: 'updated subject'
          };

          const response = await request(app)
            .put(`/flashcard/098765432167890543215678`)
            .set('Authorization', `Bearer ${authentication_token}`)
            .send(flashcards_update);
          expect(response.status).toBe(404);
          expect(response.body.error).toBe(messages.flashcardNotFound);
        });

        it('Should return 404 if the flashcard id is found but does not belong to the authenticated user', async () => {
          const flashcards_update = {
            question: 'Updated question ',
            answer: 'updated answer',
            subject: 'updated subject'
          };

          const response = await request(app)
            .put(`/flashcard/${flashcard_created.body._id}`)
            .set('authorization', `Bearer ${jhon_doe_access_token}`)
            .send(flashcards_update);
          expect(response.status).toBe(404);
        });
      });
      describe('500 - Internal Server Error', () => {
        it('should return 500 if an internal server error occurs', async () => {
          jest.spyOn(Flashcard, 'findOneAndUpdate').mockImplementation(() => {
            throw new Error('Unexpected Error');
          });
          // Mock of the model return (see example in the file'src/models/Flashcard/index.js')

          const flashcards_update = {
            question: 'Updated question ',
            answer: 'updated answer',
            subject: 'updated subject'
          };
          const response = await request(app)
            .put(`/flashcard/${flashcard_created.body._id}`)
            .set('Authorization', `Bearer ${authentication_token}`)
            .send(flashcards_update);

          expect(response.status).toBe(500);
          expect(response.body.error).toBe(
            'Ocorreu um erro inesperado. Tente novamente mais tarde.'
          );
        });
      });
    });
  });
});
