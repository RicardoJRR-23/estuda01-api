const crypto = require('crypto');
const request = require('supertest');

const app = require('../../../app.js');
const { dbConnect, dbDisconnect } = require('../../../__helpers__/mongodbServer');
const authenticationTokenUtil = require('../../../utils/authenticationToken');
const { User } = require('../../../models/index.js');

describe('POST /sessions', () => {
  const user_payload = {
    name: 'Ricardo Rosário',
    email: 'ricardo@gmail.com',
    role: 'admin',
    password: '@123password'
  };

  beforeAll(async () => {
    await dbConnect();

    await request(app)
      .post('/users')
      .send(user_payload);
  });

  afterAll(async () => {
    await dbDisconnect();
  });

  describe('Success cases', () => {
    it('Should return status code 201 if the user corresponding to the email exists and the password matches.', async () => {
      const response = await request(app)
      .post('/sessions')
      .send({
        email: user_payload.email,
        password: user_payload.password
      })
      .expect(201);

      const expect_response_body = {
        access_token: expect.any(String)
      };

      expect(response.body).toMatchObject(expect_response_body);
    });

    it('Should return a valid JWT token containing the user\'s ID, name, and email.', async () => {
      const response = await request(app)
        .post('/sessions')
        .send({
          email: user_payload.email,
          password: user_payload.password
        })
        .expect(201);

      const expect_response_body = {
        access_token: expect.any(String)
      };

      const expected_token_serialized_payload = {
        ...user_payload
      };
      delete expected_token_serialized_payload.password;

      expect(response.body).toMatchObject(expect_response_body);
      expect(authenticationTokenUtil.verify(response.body.access_token))
        .toMatchObject(expected_token_serialized_payload);
    });
  });

  describe('Error cases', () => {
    describe('Parameter Validation', () => {
      it('Should return status code 400 if the email is not provided.', async () => {
        const response = await request(app)
          .post('/sessions')
          .send({
            password: user_payload.password
          })
          .expect(400);
  
        const expect_response_body = {
          error: 'Campo "email" está em falta.'
        };
  
        expect(response.body).toMatchObject(expect_response_body);
      });

      it('Should return status code 400 if the email is provided but has an invalid format.', async () => {
        const response = await request(app)
          .post('/sessions')
          .send({
            email: 'ricardo.com',
            password: user_payload.password
          })
          .expect(400);

        const expect_response_body = {
          error: 'O email providenciado não é valido'
        };

        expect(response.body).toMatchObject(expect_response_body);
      });

      it('Should return status code 400 if the password is not provided.', async () => {
        const response = await request(app)
          .post('/sessions')
          .send({
            email: user_payload.email
          })
          .expect(400);

        const expect_response_body = {
          error: 'Campo "password" está em falta.'
        };

        expect(response.body).toMatchObject(expect_response_body);
      });

      it('Should return status code 400 if the password provided is not a string.', async () => {
        const response = await request(app)
          .post('/sessions')
          .send({
            email: user_payload.email,
            password: 234
          })
          .expect(400);

        const expect_response_body = {
          error: 'Campo "password" deve ser do tipo String.'
        };

        expect(response.body).toMatchObject(expect_response_body);
      });

      it('Should return status code 400 if the password provided is a string but has fewer than 6 characters.', async () => {
        const response = await request(app)
          .post('/sessions')
          .send({
            email: user_payload.email,
            password: 'abc@1'
          })
          .expect(400);

        const expect_response_body = {
          error: 'O password deve conter no mínimo 6 caractéres.'
        };

        expect(response.body).toMatchObject(expect_response_body);
      });
    });

    describe('Credential Validation', () => {
      it('Should return status code 401 if the user with the provided email does not exist.', async () => {
        const response = await request(app)
          .post('/sessions')
          .send({
            email: 'ricardo45@gmail.com',
            password: 'abc@1234'
          })
          .expect(401);

        const expect_response_body = {
          error: 'Credenciais inválidas.'
        };

        expect(response.body).toMatchObject(expect_response_body);
      });

      it('Should return status code 401 if the user exists but the password does not match.', async () => {
        const response = await request(app)
          .post('/sessions')
          .send({
            email: user_payload.email,
            password: 'abc@1234'
          })
          .expect(401);

        const expect_response_body = {
          error: 'Credenciais inválidas.'
        };

        const user_found = await User.findOne({ email: user_payload.email });

        const expected_user_payload = { ...user_payload };
        delete expected_user_payload.password;

        expect(user_found).toMatchObject(expected_user_payload);
        expect(response.body).toMatchObject(expect_response_body);
      });
    });
  });
});