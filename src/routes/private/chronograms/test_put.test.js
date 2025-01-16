const request = require('supertest');
const app = require('../../../app.js');
const mongoose = require('mongoose');
const { Chronogram } = require('../../../models/index.js');

const {
  dbConnect,
  dbDisconnect
} = require('../../../__helpers__/mongodbServer/index.js');

describe('PUT /chronograms/:chronogram_id', () => {
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

  const update_payload = {
    title: 'Cronograma Alterado',
    description: 'Detalhes do cronograma alterado',
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    tasks: [
      { name: 'Task 1', completed: true },
      { name: 'Task 2', completed: true }
    ]
  };

  let access_token;
  let user_id;
  let chronogram_id;
  let jhon_doe_id;
  let jhon_doe_access_token;
  //beforeAll: Connect to the database, create a user and simulate a session
  beforeAll(async () => {
    await dbConnect();

    const user_created = await request(app).post('/users').send(user_payload);
    const jhon_doe_created = await request(app)
      .post('/users')
      .send(jonh_doe_payload);
    user_id = user_created.body.id;
    jhon_doe_id = jhon_doe_created.body.id;

    const response = await request(app).post('/sessions').send({
      email: user_payload.email,
      password: user_payload.password
    });

    const jonh_doe_response = await request(app).post('/sessions').send({
      email: jonh_doe_payload.email,
      password: jonh_doe_payload.password
    });

    jhon_doe_access_token = jonh_doe_response.body.access_token;

    access_token = response.body.access_token;
    const chronogram_data = {
      ...chronogram_payload,
      userId: user_id
    };
    await Chronogram.create(chronogram_data);
  });

  beforeEach(async () => {
    const chronogram_data = {
      ...chronogram_payload,
      userId: user_id
    };
    const chronogram = await Chronogram.create(chronogram_data);

    chronogram_id = chronogram._id.toString();
  });

  afterAll(async () => {
    await dbDisconnect();
  });

  afterEach(async () => {
    await Chronogram.deleteMany({});
  });

  /**
   * Success cases
   * *200
   */

  describe('Success cases, response with status 200', () => {
    //*200

    it('Should return 200 if updated a chronogram successfully, with all fields filled', async () => {
      //update the chronogram

      const response = await request(app)
        .put(`/chronograms/${chronogram_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .send(update_payload);

      //Confirm if the chronogram was updated
      expect(response.status).toBe(200);

      //Confirm if the chronogram was updated
      const updated_chronogram = await Chronogram.findById(chronogram_id);
      expect(updated_chronogram.title).toBe(update_payload.title);
      expect(updated_chronogram.description).toBe(update_payload.description);
      expect(
        new Date(updated_chronogram.startDate).toISOString().split('T')[0]
      ).toBe(update_payload.startDate);
      expect(
        new Date(updated_chronogram.endDate).toISOString().split('T')[0]
      ).toBe(update_payload.endDate);
      expect(updated_chronogram.tasks).toMatchObject(update_payload.tasks);
    });

    it('Should return 200 if updated a chronogram successfully, with the sepecific fields, description and tasks, not filled', async () => {
      const payloads_without_description_and_tasks = {
        title: 'Cronograma Alterado',
        description: '',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        tasks: []
      };
      //update the chronogram
      const response = await request(app)
        .put(`/chronograms/${chronogram_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .send(payloads_without_description_and_tasks);

      //Confirm if the chronogram was updated
      expect(response.status).toBe(200);
      //Confirm if the chronogram was updated
      const updated_chronogram = await Chronogram.findById(chronogram_id);

      //Comparing the fields results to the expected ones
      expect(updated_chronogram.title).toBe(
        payloads_without_description_and_tasks.title
      );
      expect(updated_chronogram.description).toBe(
        payloads_without_description_and_tasks.description
      );
      expect(
        new Date(updated_chronogram.startDate).toISOString().split('T')[0]
      ).toBe(payloads_without_description_and_tasks.startDate);
      expect(
        new Date(updated_chronogram.endDate).toISOString().split('T')[0]
      ).toBe(payloads_without_description_and_tasks.endDate);
      expect(updated_chronogram.tasks).toMatchObject(
        payloads_without_description_and_tasks.tasks
      );
    });
  });

  describe('Error cases', () => {
    describe('400 - Bad Request', () => {
      describe(' Invalid values for fields', () => {
        it('Should return 400 if the the required "title" field  is send in a request with missing or wrongly filled, or type other then String', async () => {
          // Invalid values ​​for fields
          const invalid_titles = [null, 123, [], {}, 0, false, ''];

          for (const invalid_title of invalid_titles) {
            const invalid_payload = {
              title: invalid_title,
              description: 'Detalhes do cronograma alterado',
              startDate: '2022-12-31',
              endDate: '2023-12-31',
              tasks: [
                { name: 'Task 1', completed: true },
                { name: 'Task 2', completed: true }
              ]
            };
            const response = await request(app)
              .put(`/chronograms/${chronogram_id}`)
              .set('authorization', `Bearer ${access_token}`)
              .send(invalid_payload);
            expect(response.status).toBe(400);
          }
        });

        describe('Date validation', () => {
          it('Should return 400 if the "endDate" is before "startDate"', async () => {
            const invalid_payload = {
              title: 'Cronograma Alterado',
              description: 'Detalhes do cronograma alterado',
              startDate: '2023-01-01',
              endDate: '2022-12-31',
              tasks: [
                { name: 'Task 1', completed: true },
                { name: 'Task 2', completed: true }
              ]
            };
            const response = await request(app)
              .put(`/chronograms/${chronogram_id}`)
              .set('authorization', `Bearer ${access_token}`)
              .send(invalid_payload);
            expect(response.status).toBe(400);
            expect(response.body).toMatchObject({
              error: 'A data final deve ser maior que a data inicial.'
            });
          });

          it('Should return 400 if the the required "startDate" field  is send in a request with missing or wrongly filled, or invalid Date form (ISO 8601 - YYYY-MM-DD)', async () => {
            // Invalid values ​​for fields startDate
            const invalid_dates = [
              null,
              123,
              [],
              {},
              '15-12-2022', // Invalid format
              '2023-01-32', // Invalid day
              '2023-13-31' // Invalid month
            ];

            for (const invalid_date of invalid_dates) {
              const invalid_payload = {
                title: 'Cronograma Alterado',
                description: 'Detalhes do cronograma alterado',
                startDate: invalid_date,
                endDate: '2022-12-31',
                tasks: [
                  { name: 'Task 1', completed: true },
                  { name: 'Task 2', completed: true }
                ]
              };
              const response = await request(app)
                .put(`/chronograms/${chronogram_id}`)
                .set('authorization', `Bearer ${access_token}`)
                .send(invalid_payload);
              expect(response.status).toBe(400);
            }
          });
          it('Should return 400 if the the required "endDate" field  is send in a request with missing or wrongly filled, or invalid Date form (ISO 8601 - YYYY-MM-DD)', async () => {
            // Invalid values ​​for fields startDate
            const invalid_dates = [
              null,
              123,
              [],
              {},
              '15-12-2022', // Invalid format
              '2023-01-32', // Invalid day
              '2023-13-31' // Invalid month
            ];

            for (const invalid_date of invalid_dates) {
              const invalid_payload = {
                title: 'Cronograma Alterado',
                description: 'Detalhes do cronograma alterado',
                startDate: '2022-12-31',
                endDate: invalid_date,
                tasks: [
                  { name: 'Task 1', completed: true },
                  { name: 'Task 2', completed: true }
                ]
              };
              const response = await request(app)
                .put(`/chronograms/${chronogram_id}`)
                .set('authorization', `Bearer ${access_token}`)
                .send(invalid_payload);
              expect(response.status).toBe(400);
            }
          });
          it('Should return 400 if the "endDate" is not a valid date format (ISO 8601 - YYYY-MM-DD)', async () => {
            const invalid_payload = {
              title: 'Cronograma Alterado',
              description: 'Detalhes do cronograma alterado',
              startDate: '01-2022-01',
              endDate: '2023-12-31', //! Invalid format
              tasks: [
                { name: 'Task 1', completed: true },
                { name: 'Task 2', completed: true }
              ]
            };

            const date_regex = /^\d{4}-\d{2}-\d{2}$/;

            expect(date_regex.test(invalid_payload.startDate)).toBe(false);
            expect(date_regex.test(invalid_payload.endDate)).toBe(true);

            const response = await request(app)
              .put(`/chronograms/${chronogram_id}`)
              .set('authorization', `Bearer ${access_token}`)
              .send(invalid_payload);
            expect(response.status).toBe(400);
          });
          it('Should return 400 if the "endDate" is not a valid date format (ISO 8601 - YYYY-MM-DD)', async () => {
            const invalid_payload = {
              title: 'Cronograma Alterado',
              description: 'Detalhes do cronograma alterado',
              startDate: '2023-01-01',
              endDate: '20-2022-31', //! Invalid format
              tasks: [
                { name: 'Task 1', completed: true },
                { name: 'Task 2', completed: true }
              ]
            };

            const date_regex = /^\d{4}-\d{2}-\d{2}$/;

            expect(date_regex.test(invalid_payload.startDate)).toBe(true);
            expect(date_regex.test(invalid_payload.endDate)).toBe(false);

            const response = await request(app)
              .put(`/chronograms/${chronogram_id}`)
              .set('authorization', `Bearer ${access_token}`)
              .send(invalid_payload);
            expect(response.status).toBe(400);
          });
        });

        it('Should return 400 if tasks "name" field is wrongly filled', async () => {
          const invalid_names = [null, 123, [], {}, 0, false, ''];

          for (const invalid_name of invalid_names) {
            const invalid_payload = {
              title: 'Cronograma Alterado',
              description: 'Detalhes do cronograma alterado',
              startDate: '2023-01-01',
              startDate: '2023-12-31',
              tasks: [
                { name: invalid_name, completed: true },
                { name: 'Task 2', completed: true }
              ]
            };
            const response = await request(app)
              .put(`/chronograms/${chronogram_id}`)
              .set('authorization', `Bearer ${access_token}`)
              .send(invalid_payload);
            expect(response.status).toBe(400);
          }
        });

        it('Should return 400 if tasks "completed" field is wrongly filled', async () => {
          const invalid_complete_values = [null, 123, [], {}, ''];

          for (const invalid_complete_value of invalid_complete_values) {
            const invalid_payload = {
              title: 'Cronograma Alterado',
              description: 'Detalhes do cronograma alterado',
              startDate: '2023-01-01',
              startDate: '2023-12-31',
              tasks: [
                { name: 'Task 1', completed: invalid_complete_value },
                { name: 'Task 2', completed: true }
              ]
            };
            const response = await request(app)
              .put(`/chronograms/${chronogram_id}`)
              .set('authorization', `Bearer ${access_token}`)
              .send(invalid_payload);
            expect(response.status).toBe(400);
          }
        });
      });

      describe('Missing fields validation', () => {
        it('Should return 400 if title is missing', async () => {
          const invalid_payloads = [
            {
              description: 'Detalhes do cronograma alterado',
              startDate: '2023-01-01',
              endDate: '2023-12-31',
              tasks: [
                { name: 'Task 1', completed: true },
                { name: 'Task 2', completed: true }
              ]
            }
          ];
          for (const invalid_payload of invalid_payloads) {
            const response = await request(app)
              .put(`/chronograms/${chronogram_id}`)
              .set('authorization', `Bearer ${access_token}`)
              .send(invalid_payload);
            expect(response.status).toBe(400);
          }
        });

        it('Should return 400 if startDate is missing', async () => {
          const invalid_payloads = [
            {
              title: 'Cronograma Alterado',
              description: 'Detalhes do cronograma alterado',
              endDate: '2023-12-31',
              tasks: [
                { name: 'Task 1', completed: true },
                { name: 'Task 2', completed: true }
              ]
            }
          ];
          for (const invalid_payload of invalid_payloads) {
            const response = await request(app)
              .put(`/chronograms/${chronogram_id}`)
              .set('authorization', `Bearer ${access_token}`)
              .send(invalid_payload);
            expect(response.status).toBe(400);
          }
        });

        it('Should return 400 if endDate is missing', async () => {
          const invalid_payload = {
            title: 'Cronograma Alterado',
            description: 'Detalhes do cronograma alterado',
            startDate: '2023-01-01',
            tasks: [
              { name: 'Task 1', completed: true },
              { name: 'Task 2', completed: true }
            ]
          };
          const response = await request(app)
            .put(`/chronograms/${chronogram_id}`)
            .set('authorization', `Bearer ${access_token}`)
            .send(invalid_payload);
          expect(response.status).toBe(400);
        });
      });
    });
    
    describe('404 - Not Found', () => {
      it('Should return 404 if the chronogram id is not found', async () => {
        const response = await request(app)
          .put('/chronograms/63f9e18e68d8d830f8e4f1a3') // Invalid chronogram id
          .set('authorization', `Bearer ${access_token}`)
          .send(update_payload);
        expect(response.status).toBe(404);
      });

      it('Should return 404 if the chronogram id is found but does not belong to the authenticated user', async () => {
        const response = await request(app)
          .put(`/chronograms/${chronogram_id}`)
          .set('authorization', `Bearer ${jhon_doe_access_token}`) //
          .send(update_payload);
        expect(response.status).toBe(404);
      });
    });

    describe('500 - Internal Server Error', () => {
      it('Should return 500 if an unexpected error occurs', async () => {
        jest.spyOn(Chronogram, 'findByIdAndUpdate').mockImplementation(() => {
          throw new Error('Unexpected Error');
        });

        const response = await request(app)
          .put(`/chronograms/${chronogram_id}`)
          .set('authorization', `Bearer ${access_token}`)
          .send(update_payload);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe(
          'Ocorreu um erro inesperado. Tente novamente mais tarde.'
        );
      });
    });
  });
});
