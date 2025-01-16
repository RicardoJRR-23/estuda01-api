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

  //user payload to simulate user register
  const user_payload = {
    name: 'Ricardo Rosário',
    email: 'ricardo@gmail.com',
    role: 'admin',
    password: '@123password'
  };

  const flashcard_payload = [
    {
      question: 'Is this real life?',
      answer: 'Yes, it is.',
      subject: 'Philosophy'
    },
    {
      question: '1+1=2?',
      answer: 'Yes, it is.',
      subject: 'Math'
    }
  ];
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

  describe('POST /flashcards/', () => {
    describe('Success Cases', () => {
      describe('For Array', () => {
        it('should create a new flashcard', async () => {
          const response = await request(app)
            .post('/flashcards/')
            .set('Authorization', `Bearer ${authentication_token}`)
            .send(flashcard_payload);

          expect(response.status).toBe(201);
          expect(response.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                question: flashcard_payload[0].question,
                answer: flashcard_payload[0].answer,
                subject: flashcard_payload[0].subject
              })
            ])
          );
          const created_flashcard = await Flashcard.findOne({
            question: flashcard_payload[0].question
          });

          expect(created_flashcard).not.toBeNull();
          for (let i = 0; i < flashcard_payload.length; i++) {
            expect(response.body[i].question).toBe(
              flashcard_payload[i].question
            );
            expect(response.body[i].answer).toBe(flashcard_payload[i].answer);
          }
        });

        it('should return 201 and the array containing flashcards, if created those successfully without subject', async () => {
          // Invalid values ​​for fields question and answer

          const payload_without_subject = [
            {
              question: 'Is this real life?',
              answer: 'Yes, it is.'
            },
            {
              question: '1+1=2?',
              answer: 'Yes, it is.'
            }
          ];

          const response = await request(app)
            .post('/flashcards/')
            .set('authorization', `Bearer ${authentication_token}`)
            .send(payload_without_subject);

          expect(response.status).toBe(201);
          for (let i = 0; i < payload_without_subject.length; i++) {
            expect(response.body[i].question).toBe(
              payload_without_subject[i].question
            );
            expect(response.body[i].answer).toBe(
              payload_without_subject[i].answer
            );
          }
        });
      });
      describe('For Object', () => {
        it('should create a new flashcard', async () => {
          const response = await request(app)
            .post('/flashcards/')
            .set('Authorization', `Bearer ${authentication_token}`)
            .send(flashcard_payload[0]);

          expect(response.status).toBe(201);
          expect(response.body).toEqual(
            expect.objectContaining({
              question: flashcard_payload[0].question,
              answer: flashcard_payload[0].answer,
              subject: flashcard_payload[0].subject
            })
          );
        });

        it('should return 201 and the flashcards object, if created successfully without subject', async () => {
          // Invalid values ​​for fields question and answer

          const payload_without_subject = {
            question: 'Is this real life?',
            answer: 'Yes, it is.'
          };

          const response = await request(app)
            .post('/flashcards/')
            .set('authorization', `Bearer ${authentication_token}`)
            .send(payload_without_subject);

          expect(response.status).toBe(201);

          expect(response.body.question).toBe(payload_without_subject.question);
          expect(response.body.answer).toBe(payload_without_subject.answer);
        });
      });
    });
  });

  describe('Error Cases', () => {
    describe('Error cases, response with status 400', () => {
      describe('Array validation', () => {
        it('should return 400 if empty array', async () => {
          const empty_array = [];

          const response = await request(app)
            .post('/flashcards/')
            .set('authorization', `Bearer ${authentication_token}`)
            .send(empty_array);

          expect(response.status).toBe(400);
          expect(response.body.error).toEqual(expect.any(String));
          const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
          console.error(normalize(response.body.error));
        });

        it('should return 400 if array contains just one object', async () => {
          const invalid_array_playload = [
            {
              question: 'Is this real life?',
              answer: 'Yes, it is.',
              subject: 'Philosophy'
            }
          ];

          const response = await request(app)
            .post('/flashcards/')
            .set('authorization', `Bearer ${authentication_token}`)
            .send(invalid_array_playload);

          expect(response.status).toBe(400);
          expect(response.body.error).toEqual(expect.any(String));
          const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
          console.error(normalize(response.body.error));
        });
      });

      describe('Invalid values', () => {
        describe('for Array', () => {
          it('should return 400 if unexpected `question` value in form', async () => {
            // Invalid values ​​for fields question and answer
            const invalidQuestions = [[], {}, null];
            for (const invalidQuestion of invalidQuestions) {
              const invalid_payload = [
                {
                  question: invalidQuestion,
                  answer: 'Yes, it is.',
                  subject: 'Philosophy'
                },
                {
                  question: '1+1=2?',
                  answer: 'Yes, it is.',
                  subject: 'Math'
                }
              ];

              const response = await request(app)
                .post('/flashcards/')
                .set('authorization', `Bearer ${authentication_token}`)
                .send(invalid_payload);

              expect(response.status).toBe(400);
              expect(response.body.error).toEqual(expect.any(String));
              const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
              console.error(normalize(response.body.error));
            }
          });

          it('should return 400 if unexpected `answer` value in form', async () => {
            // Invalid values ​​for fields question and answer
            const invalidAnswers = [[], {}, null];
            for (const invalidAnswer of invalidAnswers) {
              const invalid_payload = [
                {
                  question: 'Is this real life?',
                  answer: invalidAnswer,
                  subject: 'Philosophy'
                },
                {
                  question: '1+1=2?',
                  answer: invalidAnswer,
                  subject: 'Math'
                }
              ];

              const response = await request(app)
                .post('/flashcards/')
                .set('authorization', `Bearer ${authentication_token}`)
                .send(invalid_payload);

              expect(response.status).toBe(400);
              expect(response.body.error).toEqual(expect.any(String));
              const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
              console.error(normalize(response.body.error));
            }
          });

          it('should return 400 if different Flashcards have an invalid playload', async () => {
            // Invalid values ​​for fields question and answer
            const invalidQuestions = [[], {}, null];
            const invalidAnswers = [[], {}, null];
            for (let i = 0; i < invalidQuestions.length; i++) {
              const invalid_payload = [
                {
                  question: invalidQuestions[i],
                  answer: 'Yes, it is.',
                  subject: 'Philosophy'
                },
                {
                  question: '1+1=2?',
                  answer: invalidAnswers[i],
                  subject: 'Math'
                }
              ];

              const response = await request(app)
                .post('/flashcards/')
                .set('authorization', `Bearer ${authentication_token}`)
                .send(invalid_payload);

              expect(response.status).toBe(400);
              expect(response.body.error).toEqual(expect.any(String));
              const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
              console.error(normalize(response.body.error));
            }
          });

          it('should return 400 if unexpected `subject` value in form', async () => {
            // Invalid values ​​for fields question and answer
            const invalidSubjects = [[], {}];
            for (const invalidSubject of invalidSubjects) {
              const invalid_payload = [
                {
                  question: 'Is this real life?',
                  answer: 'Yes, it is.',
                  subject: invalidSubject
                }
              ];

              const response = await request(app)
                .post('/flashcards/')
                .set('authorization', `Bearer ${authentication_token}`)
                .send(invalid_payload);

              expect(response.status).toBe(400);
              expect(response.body.error).toEqual(expect.any(String));
              const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
              console.error(normalize(response.body.error));
            }
          });
        });
        describe('for Object', () => {
          it('should return 400 if unexpected `question` value in form', async () => {
            // Invalid values ​​for fields question and answer
            const invalidQuestions = [[], {}, null, true, false, 123];
            for (const invalidQuestion of invalidQuestions) {
              const invalid_payload = {
                question: invalidQuestion,
                answer: 'Yes, it is.',
                subject: 'Philosophy'
              };

              const response = await request(app)
                .post('/flashcards/')
                .set('authorization', `Bearer ${authentication_token}`)
                .send(invalid_payload);

              expect(response.status).toBe(400);
              expect(response.body.error).toEqual(expect.any(String));
              const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
              console.error(normalize(response.body.error));
            }
          });

          it('should return 400 if unexpected `answer` value in form', async () => {
            // Invalid values ​​for fields question and answer
            const invalidAnswers = [[], {}, null, true, false, 123];
            for (const invalidAnswer of invalidAnswers) {
              const invalid_payload = {
                question: 'Is this real life?',
                answer: invalidAnswer,
                subject: 'Philosophy'
              };

              const response = await request(app)
                .post('/flashcards/')
                .set('authorization', `Bearer ${authentication_token}`)
                .send(invalid_payload);

              expect(response.status).toBe(400);
              expect(response.body.error).toEqual(expect.any(String));
              const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
              console.error(normalize(response.body.error));
            }
          });

          it('should return 400 if unexpected `subject` value type in form', async () => {
            // Invalid values ​​for fields question and answer
            const invalidSubjects = [[], {}, null, true, false, 123];
            for (const invalidSubject of invalidSubjects) {
              const invalid_payload = {
                question: 'Is this real life?',
                answer: 'Yes, it is.',
                subject: invalidSubject
              };

              const response = await request(app)
                .post('/flashcards/')
                .set('authorization', `Bearer ${authentication_token}`)
                .send(invalid_payload);

              expect(response.status).toBe(400);
              expect(response.body.error).toEqual(expect.any(String));
              const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
              console.error(normalize(response.body.error));
            }
          });

          it('should return 400 if a Flashcard have an invalid playload', async () => {
            // Invalid values ​​for fields question and answer
            const invalidQuestions = [[], {}, null, true, false, 123];
            const invalidAnswers = [[], {}, null, true, false, 123];
            for (let i = 0; i < invalidQuestions.length; i++) {
              const invalid_payload = {
                question: invalidQuestions[i],
                answer: invalidAnswers[i],
                subject: 'Philosophy'
              };
              const response = await request(app)
                .post('/flashcards/')
                .set('authorization', `Bearer ${authentication_token}`)
                .send(invalid_payload);

              expect(response.status).toBe(400);
              expect(response.body.error).toEqual(expect.any(String));
              const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
              console.error(normalize(response.body.error));
            }
          });

          it('should return 400 if invalid playload', async () => {
            // Invalid values ​​for fields question and answer
            const invalidValues = [[], {}, null, true, false, 123];
            for (const invalidValue of invalidValues) {
              const invalid_payload = {
                question: invalidValue,
                answer: invalidValue,
                subject: invalidValue
              };

              const response = await request(app)
                .post('/flashcards/')
                .set('authorization', `Bearer ${authentication_token}`)
                .send(invalid_payload);

              expect(response.status).toBe(400);
              expect(response.body.error).toEqual(expect.any(String));
              const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
              console.error(normalize(response.body.error));
            }
          });
        });
      });

      describe('Missing Required Fields', () => {
        describe('for Array', () => {
          it('should return 400 if `question` field is missing', async () => {
            // Invalid values ​​for fields question and answer

            const payload_missing_question = [
              {
                answer: 'Yes, it is.',
                subject: 'Philosophy'
              }
            ];

            const response = await request(app)
              .post('/flashcards/')
              .set('authorization', `Bearer ${authentication_token}`)
              .send(payload_missing_question);

            expect(response.status).toBe(400);
            expect(response.body.error).toEqual(expect.any(String));
            const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
            console.error(normalize(response.body.error));
          });

          it('should return 400 if `answer` field is missing', async () => {
            // Invalid values ​​for fields question and answer

            const payload_missing_question = [
              {
                question: 'Is this real life?',
                subject: 'Philosophy'
              }
            ];

            const response = await request(app)
              .post('/flashcards/')
              .set('authorization', `Bearer ${authentication_token}`)
              .send(payload_missing_question);

            expect(response.status).toBe(400);
            expect(response.body.error).toEqual(expect.any(String));
            const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
            console.error(normalize(response.body.error));
          });

          it('should return 400 if if there is a missing required fields in more than one Flashcard', async () => {
            // Invalid values ​​for fields question and answer

            const payload_missing_question = [
              { question: 'Is this real life?', subject: 'Philosophy' },
              { answer: 'Yes, it is.', subject: 'Philosophy' },
              { subject: 'Philosophy' }
            ];

            const response = await request(app)
              .post('/flashcards/')
              .set('authorization', `Bearer ${authentication_token}`)
              .send(payload_missing_question);

            expect(response.status).toBe(400);

            expect(response.body.error).toEqual(expect.any(String));
            const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
            console.error(normalize(response.body.error));
          });
        });
        describe('for Object', () => {
          it('should return 400 if `question` field is missing', async () => {
            // Invalid values ​​for fields question and answer

            const payload_missing_question = {
              answer: 'Yes, it is.',
              subject: 'Philosophy'
            };

            const response = await request(app)
              .post('/flashcards/')
              .set('authorization', `Bearer ${authentication_token}`)
              .send(payload_missing_question);

            expect(response.status).toBe(400);
            expect(response.body.error).toEqual(expect.any(String));
            const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
            console.error(normalize(response.body.error));
          });

          it('should return 400 if `answer` field is missing', async () => {
            // Invalid values ​​for fields question and answer

            const payload_missing_question = {
              question: 'Is this real life?',
              subject: 'Philosophy'
            };

            const response = await request(app)
              .post('/flashcards/')
              .set('authorization', `Bearer ${authentication_token}`)
              .send(payload_missing_question);

            expect(response.status).toBe(400);
            expect(response.body.error).toEqual(expect.any(String));
            const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
            console.error(normalize(response.body.error));
          });

          it('should return 400 if question and answer fields are missing ', async () => {
            // Invalid values ​​for fields question and answer

            const payload_missing_question = { subject: 'Philosophy' };

            const response = await request(app)
              .post('/flashcards/')
              .set('authorization', `Bearer ${authentication_token}`)
              .send(payload_missing_question);

            expect(response.status).toBe(400);

            expect(response.body.error).toEqual(expect.any(String));
            const normalize = str => str.replace(/\.\. ?/g, '.\n'); //!Regex to organize error string message
            console.error(normalize(response.body.error));
          });
        });
      });
    });

    describe('Error cases, response with status 401', () => {
      it('should return 401 if the user is not authenticated', async () => {
        const response = await request(app)
          .post('/flashcards/')
          .send([
            {
              question: 'Is this real life?',
              answer: 'Yes, it is.',
              subject: 'Philosophy'
            }
          ]);
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Token não foi enviado.');
      });

      it('should return 401 if the authentication token is invalid', async () => {
        const invalid_token = 'invalid_token';
        const response = await request(app)
          .post('/flashcards/')
          .set('authorization', `Bearer ${invalid_token}`)
          .send(flashcard_payload);
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Token inválido.');
      });
    });

    describe('Error cases, response with status 500', () => {
      it('should return 500 if an internal server error occurs', async () => {
        jest.spyOn(Flashcard, 'insertMany').mockImplementation(() => {
          throw new Error('Unexpected Error');
        });
        // Mock of the model return (see example in the file'src/models/Flashcards/index.js')

        const response = await request(app)
          .post('/flashcards/')
          .set('authorization', `Bearer ${authentication_token}`)
          .send(flashcard_payload);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe(
          'Ocorreu um erro inesperado. Tente novamente mais tarde.'
        );
      });
    });
  });
});
