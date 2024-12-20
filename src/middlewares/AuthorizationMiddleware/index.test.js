const request = require('supertest');

const middleware = require('.');

const app = require('../../app.js');
const { dbConnect, dbDisconnect } = require('../../__helpers__/mongodbServer');

describe('AuthorizationMiddleware', () => {
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
    it('Should be able to validate the token and return the payload on the request body', async () => {
      const response = await request(app)
        .post('/sessions')
        .send({
          email: user_payload.email,
          password: user_payload.password
        });

      const req = {
        headers: {
          authorization: `Bearer ${response.body.access_token}`
        }
      };
      const res = {
        json: jest.fn(() => res),
        status: jest.fn(() => res)
      };
      const next = jest.fn();

      await middleware(req, res, next);

      const expected_user_payload = { ...user_payload };
      delete expected_user_payload.password;

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(req.user).toMatchObject(expected_user_payload);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Error cases', () => {
    it('Should return status code 401 if the token is not been provided', async () => {
      const req = {
        headers: {
          authorization: undefined
        }
      };
      const res = {
        json: jest.fn(() => res),
        status: jest.fn(() => res)
      };
      const next = jest.fn();

      const te = await middleware(req, res, next);

      const expected_error_response = {
        status: 401,
        body: {
          error: 'Token não foi enviado.'
        }
      };

      expect(res.status).toHaveBeenCalledWith(expected_error_response.status);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining(expected_error_response.body));
      expect(req.user).toBeUndefined();
      expect(next).not.toHaveBeenCalled();
    });

    it('Should return status code 401 if the authorization header has no bearer token', async () => {
      const req = {
        headers: {
          authorization: 'dsdsadasraswewewa2323wasdas'
        }
      };
      const res = {
        json: jest.fn(() => res),
        status: jest.fn(() => res)
      };
      const next = jest.fn();

      await middleware(req, res, next);

      const expected_error_response = {
        status: 401,
        body: {
          error: 'Não é uma Bearer token.'
        }
      };

      expect(res.status).toHaveBeenCalledWith(expected_error_response.status);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining(expected_error_response.body));
      expect(req.user).toBeUndefined();
      expect(next).not.toHaveBeenCalled();
    });

    it('Should return status code 401 if the token is not valid', async () => {
      const req = {
        headers: {
          authorization: 'Bearer dsdsadasraswewewa2323wasdas'
        }
      };
      const res = {
        json: jest.fn(() => res),
        status: jest.fn(() => res)
      };
      const next = jest.fn();

      await middleware(req, res, next);

      const expected_error_response = {
        status: 401,
        body: {
          error: 'Token não é válido.'
        }
      };

      expect(res.status).toHaveBeenCalledWith(expected_error_response.status);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining(expected_error_response.body));
      expect(req.user).toBeUndefined();
      expect(next).not.toHaveBeenCalled();
    });

    it('Should return status code 401 if the token has been expired', async () => {
      process.env.ACCESS_TOKEN_TIME_EXPIRATION = '2s';
      const response = await request(app)
        .post('/sessions')
        .send({
          email: user_payload.email,
          password: user_payload.password
        });

      await new Promise((res) => setTimeout(res, 2000));

      const req = {
        headers: {
          authorization: `Bearer ${response.body.access_token}`
        }
      };
      const res = {
        json: jest.fn(() => res),
        status: jest.fn(() => res)
      };
      const next = jest.fn();

      await middleware(req, res, next);

      const expected_error_response = {
        status: 401,
        body: {
          error: 'Token expirado.'
        }
      };

      expect(res.status).toHaveBeenCalledWith(expected_error_response.status);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining(expected_error_response.body));
      expect(req.user).toBeUndefined();
      expect(next).not.toHaveBeenCalled();
    });
  });
});