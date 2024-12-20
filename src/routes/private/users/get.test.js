const request = require('supertest');

const app = require('../../../app.js');
const { dbConnect, dbDisconnect } = require('../../../__helpers__/mongodbServer/index.js');

describe('GET /users/:userId', () => {
  const user_payload = {
    name: 'Ricardo Rosário',
    email: 'ricardo@gmail.com',
    role: 'admin',
    password: '@123password'
  };
  let authentication_token;
  let user_id;
  let expected_user_payload;
  beforeAll(async () => {
    await dbConnect();

    const user_created = await request(app)
      .post('/users')
      .send(user_payload);
    user_id = user_created.body.id;

    const response = await request(app)
      .post('/sessions')
      .send({
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

  describe('Success cases', () => {
    it('Should be able to return the user details payload if the userId value is “me”', async () => {
      const response = await request(app)
        .get(`/users/me`)
        .set('authorization', `Bearer ${authentication_token}`)
        .expect(200);

      expect(response.body).toMatchObject(expected_user_payload);
    });

    it('Should be able to return the user details payload if the userId value is the correspondent id of the person authenticated', async () => {
      const response = await request(app)
        .get(`/users/${user_id}`)
        .set('authorization', `Bearer ${authentication_token}`)
        .expect(200);

      expect(response.body).toMatchObject(expected_user_payload);
    });
  });

  describe('Error cases', () => {
    it('Should return 403 if the user id is invalid', async () => {
      const response = await request(app)
        .get(`/users/dsadas13129sadas321`)
        .set('authorization', `Bearer ${authentication_token}`)
        .expect(403);

      const expected_body_response = {
        error: 'O id do usuário ou é inválido ou não corresponde ao usuário autenticado.'
      };
      expect(response.body).toMatchObject(expected_body_response);
    });   
  });
});