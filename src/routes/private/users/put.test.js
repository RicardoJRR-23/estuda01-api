const request = require('supertest');

const app = require('../../../app.js');
const { dbConnect, dbDisconnect } = require('../../../__helpers__/mongodbServer/index.js');
const { User } = require('../../../models/index.js');

describe('UPDATE users information', () => {
  const user_payload = {
    name: 'Ricardo Rosário',
    email: 'ricardo@gmail.com',
    role: 'admin',
    password: '@123password'
  };

  let authentication_token;
  let user_id;
  beforeAll(async () => {
    await dbConnect();
  });

  beforeEach(async () => {
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
  });

  afterEach(async () => {
    await User.deleteMany();
  });

  afterAll(async () => {
    await dbDisconnect();
  });

  describe('PUT /users/:userId', () => {
    describe('Success cases', () => {
      it('Should be able to update user\'s name', async () => {
        const user_payload_updated = {
          email: user_payload.email,
          name: 'Ricardo Jorge Rocha do Rosário'
        };

        await request(app)
          .put(`/users/me`)
          .set('authorization', `Bearer ${authentication_token}`)
          .send(user_payload_updated)
          .expect(204);

        const response = await request(app)
          .get(`/users/me`)
          .set('authorization', `Bearer ${authentication_token}`)
          .expect(200);
  
        expect(response.body.name).toBe(user_payload_updated.name);
      });
  
      it('Should be able to update user\'s email', async () => {
        const user_payload_updated = {
          name: user_payload.name,
          email: 'ricardo.rosario@gmail.com'
        };

        await request(app)
          .put(`/users/me`)
          .set('authorization', `Bearer ${authentication_token}`)
          .send(user_payload_updated)
          .expect(204);

        const response = await request(app)
          .get(`/users/me`)
          .set('authorization', `Bearer ${authentication_token}`)
  
        expect(response.body.email).toBe(user_payload_updated.email);
      });
    });
  
    describe('Error cases', () => {
      it('Should return 403 if the user id is invalid', async () => {
        const response = await request(app)
          .put(`/users/dsadas13129sadas321`)
          .set('authorization', `Bearer ${authentication_token}`)
          .send(user_payload)
          .expect(403);
  
        const expected_body_response = {
          error: 'O id do usuário ou é inválido ou não corresponde ao usuário autenticado.'
        };
        expect(response.body).toMatchObject(expected_body_response);
      });

      it('Should return status code 400 if there are additional fields.', async () => {
        const user_request_payload = {
          name: 'Ricardo Rosário',
          email: 'ricardo@gmail.com',
          age: 25
        };
        const expected_body_response = {
          error: 'O campo desconhecido "age" não é permitido.'
        }
  
        const response = await request(app)
          .put('/users/me')
          .set('authorization', `Bearer ${authentication_token}`)
          .send(user_request_payload)
          .expect(400);
  
        expect(response.body).toMatchObject(expected_body_response);
      });

      it('Should return status code 400 if the user does not provide the "name" field.', async () => {
        const user_request_payload = {
          email: 'ricardo@gmail.com'
        };
        const expected_body_response = {
          error: 'Campo "name" está em falta.'
        }
  
        const response = await request(app)
          .put('/users/me')
          .set('authorization', `Bearer ${authentication_token}`)
          .send(user_request_payload)
          .expect(400);
  
        expect(response.body).toMatchObject(expected_body_response);
      });
      
      it('Should return status code 400 if the "name" field is not of type String.', async () => {
        const user_request_payload = {
          name: 12345,
          email: 'ricardo@gmail.com'
        };
        const expected_body_response = {
          error: 'Campo "name" deve ser do tipo String.'
        }
  
        const response = await request(app)
          .put('/users/me')
          .set('authorization', `Bearer ${authentication_token}`)
          .send(user_request_payload)
          .expect(400);
  
        expect(response.body).toMatchObject(expected_body_response);
      });

      it('Should return status code 400 if the user does not provide the "email" field.', async () => {
        const user_request_payload = {
          name: 'Ricardo Rosário',
        };
        const expected_body_response = {
          error: 'Campo "email" está em falta.'
        }
  
        const response = await request(app)
          .put('/users/me')
          .set('authorization', `Bearer ${authentication_token}`)
          .send(user_request_payload)
          .expect(400);
  
        expect(response.body).toMatchObject(expected_body_response);
      });

      it('Should return status code 400 if the "email" field is not a valid email.', async () => {
        const user_request_payload = {
          name: 'Ricardo Rosário',
          email: 'ricardo.com',
        };
        const expected_body_response = {
          error: 'O email providenciado não é valido'
        }
  
        const response = await request(app)
          .put('/users/me')
          .set('authorization', `Bearer ${authentication_token}`)
          .send(user_request_payload)
          .expect(400);
  
        expect(response.body).toMatchObject(expected_body_response);
      });

      it('Should return status code 400 if the user tries to update the field role', async () => {
        const user_request_payload = {
          name: 'Ricardo Rosário',
          email: 'ricardo@gmail.com',
          role: 'admin'
        };
        const expected_body_response = {
          error: 'O campo desconhecido "role" não é permitido.'
        }
  
        const response = await request(app)
          .put('/users/me')
          .set('authorization', `Bearer ${authentication_token}`)
          .send(user_request_payload)
          .expect(400);
  
        expect(response.body).toMatchObject(expected_body_response);
      });

      it('Should return status code 400 if the user tries to update the field password', async () => {
        const user_request_payload = {
          name: 'Ricardo Rosário',
          email: 'ricardo@gmail.com',
          password: 'dsadasdd'
        };
        const expected_body_response = {
          error: 'O campo desconhecido "password" não é permitido.'
        }
  
        const response = await request(app)
          .put('/users/me')
          .set('authorization', `Bearer ${authentication_token}`)
          .send(user_request_payload)
          .expect(400);
  
        expect(response.body).toMatchObject(expected_body_response);
      });
    });
  });

  describe('PUT /users/:userId/password', () => {
    describe('Success cases', () => {
      it('Should be able to update the password if the currentPassword is correct and the new password is valid', async () => {
        const user_password_payload = {
          currentPassword: user_payload.password,
          password: '@newPassword123'
        };

        await request(app)
          .put(`/users/me/password`)
          .set('authorization', `Bearer ${authentication_token}`)
          .send(user_password_payload)
          .expect(204);
        
        await request(app)
          .post('/sessions')
          .send({
            email: user_payload.email,
            password: user_payload.password
          })
          .expect(401);

        await request(app)
          .post('/sessions')
          .send({
            email: user_payload.email,
            password: user_password_payload.password
          })
          .expect(201);
      });
    });

    describe('Error cases', () => {
      it('Should return status code 400 if the currentPassword is not provided', async () => {
        const user_password_payload = {
          password: '@newPassword123'
        };

        const response = await request(app)
          .put(`/users/me/password`)
          .set('authorization', `Bearer ${authentication_token}`)
          .send(user_password_payload)
          .expect(400);

        expect(response.body.error).toBe('Campo "currentPassword" está em falta.');
      });

      it('Should return status code 400 if the password is not provided', async () => {
        const user_password_payload = {
          currentPassword: '@newPassword123'
        };

        const response = await request(app)
          .put(`/users/me/password`)
          .set('authorization', `Bearer ${authentication_token}`)
          .send(user_password_payload)
          .expect(400);

        expect(response.body.error).toBe('Campo "password" está em falta.');
      });

      it('Should return status code 400 if the currentPassword is provided, but it is not a String', async () => {
        const user_password_payload = {
          currentPassword: 454,
          password: '@newPassword123'
        };

        const response = await request(app)
          .put(`/users/me/password`)
          .set('authorization', `Bearer ${authentication_token}`)
          .send(user_password_payload)
          .expect(400);

        expect(response.body.error).toBe('Campo "currentPassword" deve ser do tipo String.');
      });

      it('Should return status code 400 if the password is provided, but it is not a String', async () => {
        const user_password_payload = {
          password: 454,
          currentPassword: '@newPassword123'
        };

        const response = await request(app)
          .put(`/users/me/password`)
          .set('authorization', `Bearer ${authentication_token}`)
          .send(user_password_payload)
          .expect(400);

        expect(response.body.error).toBe('Campo "password" deve ser do tipo String.');
      });

      it('Should return status code 400 if the password is provided, but it has less than 6 characters.', async () => {
        const user_password_payload = {
          password: 'sdsa',
          currentPassword: '@newPassword123'
        };

        const response = await request(app)
          .put(`/users/me/password`)
          .set('authorization', `Bearer ${authentication_token}`)
          .send(user_password_payload)
          .expect(400);

        expect(response.body.error).toBe('O password providenciado deve ter no minimo 6 caracteres.');
      });

      it('Should return status code 400 if the currentPassword does not match with the stored user password', async () => {
        const user_password_payload = {
          password: '@newPassword123',
          currentPassword: '@newPassword123'
        };

        const response = await request(app)
          .put(`/users/me/password`)
          .set('authorization', `Bearer ${authentication_token}`)
          .send(user_password_payload)
          .expect(400);

        expect(response.body.error).toBe('Campo "currentPassword" não corresponde ao password armazenado.');
      });

      it('Should return 403 if the user id is invalid', async () => {
        const response = await request(app)
          .put(`/users/dsadas13129sadas321/password`)
          .set('authorization', `Bearer ${authentication_token}`)
          .send({
            password: '@newPassword123',
            currentPassword: '@newPassword123'
          })
          .expect(403);
  
        const expected_body_response = {
          error: 'O id do usuário ou é inválido ou não corresponde ao usuário autenticado.'
        };
        expect(response.body).toMatchObject(expected_body_response);
      });
    });
  });
})