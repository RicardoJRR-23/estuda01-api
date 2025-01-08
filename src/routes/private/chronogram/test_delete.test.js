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
    title: 'PRIMEIRO    Novo Cronograma',
    description: 'Detalhes do cronograma',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    tasks: [
      { name: 'Task 1', completed: false },
      { name: 'Task 2', completed: true }
    ]
  };
  const chronogram_payload_2 = {
    title: ' SEGUNDO Novo Cronograma',
    description: 'Detalhes do cronograma',
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
  let jhon_doe_access_token;
  let chronogram_1_id;
  let chronogram_2_id;

  //beforeAll: Connect to the database, create a user and simulate a session
  beforeAll(async () => {
    await dbConnect();

    const user_created = await request(app).post('/users').send(user_payload);

    const response = await request(app).post('/sessions').send({
      email: user_payload.email,
      password: user_payload.password
    });

    authentication_token = response.body.access_token;

    const jonh_doe_created = await request(app)
      .post('/users')
      .send(jonh_doe_payload);
    user_id = user_created.body.id;
    jhon_doe_id = jonh_doe_created.body.id;

    const jonh_doe_response = await request(app).post('/sessions').send({
      email: jonh_doe_payload.email,
      password: jonh_doe_payload.password
    });

    jhon_doe_access_token = jonh_doe_response.body.access_token;
  });
  beforeEach(async () => {
    const chronogram_data = {
      ...chronogram_payload,
      userId: user_id
    };
    const chronogram_1 = await Chronogram.create(chronogram_data);
    chronogram_1_id = chronogram_1.id;

    const chronogram_data_2 = {
      ...chronogram_payload_2,
      userId: user_id
    };
    const chronogram_2 = await Chronogram.create(chronogram_data_2);
    chronogram_2_id = chronogram_2.id;
  });

  afterAll(async () => {
    await dbDisconnect();
  });

  describe('Success cases', () => {
    it('should delete a chronogram', async () => {
      const response = await request(app)
        .delete(`/chronogram/${chronogram_1_id}`)
        .set('Authorization', `Bearer ${authentication_token}`);
      expect(response.status).toBe(200);

      const findAllChronograms = await Chronogram.find({ userId: user_id });
      expect(findAllChronograms.length).toEqual(1);
      expect(findAllChronograms[0]._id).toEqual(
        mongoose.Types.ObjectId.createFromHexString(chronogram_2_id)
      );

      expect(response.body).toMatchObject({
        message: 'Cronograma apagado com sucesso.'
      });
    });
  });

  describe('Error cases', () => {
    it('should return 404 if the id provided does not belong to an existing chronogram', async () => {
      const response = await request(app)
        .delete(`/chronogram/${new mongoose.Types.ObjectId()}`) //! invalid id
        .set('Authorization', `Bearer ${authentication_token}`);
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: 'Cronograma não encontrado.'
      });
    });

    it('should return 404 if a user does not own the chronogram', async () => {
      const response = await request(app)
        .delete(`/chronogram/${chronogram_1_id}`)
        .set('Authorization', `Bearer ${jhon_doe_access_token}`); //! different user access token
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: 'Cronograma não encontrado.'
      });
    });
    it('should return 500 if an unespected error happened', async () => {
      jest.spyOn(Chronogram, 'findByIdAndDelete').mockImplementation(() => {
        throw new Error('Unexpected Error');
      });

      const response = await request(app)
        .delete(`/chronogram/${chronogram_1_id}`)
        .set('Authorization', `Bearer ${authentication_token}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe(
        'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      );
    });
  });
});
