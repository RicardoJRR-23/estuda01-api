const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../../../app.js');
const { dbConnect, dbDisconnect } = require('../../../__helpers__/mongodbServer');
const { User } = require('../../../models');
const { passwordEncryption } = require('../../../utils');

describe('POST /users', () => {
  beforeAll(async () => {
    await dbConnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await dbDisconnect();
  })

  describe('Success cases', () => {
    it('Should be able to create a user if all fields are provided.', async () => {
      const user_request_payload = {
        name: 'Ricardo Rosário',
        email: 'ricardo@gmail.com',
        role: 'admin',
        password: '@123password'
      };

      const response = await request(app)
        .post('/users')
        .send(user_request_payload)
        .expect(201);

      const user = await User.findOne();

      const expected_user_payload = {
        _id: mongoose.Types.ObjectId.createFromHexString(response.body.id),
        ...user_request_payload
      };
      delete expected_user_payload.password;

      expect(user).toMatchObject(expected_user_payload);
    });

    it('Should be able to create a user if the role field is not provided, and Should default to the role "student."', async () => {
      const user_request_payload = {
        name: 'Ricardo Rosário',
        email: 'ricardo@gmail.com',
        password: '@123password'
      };

      const response = await request(app)
        .post('/users')
        .send(user_request_payload)
        .expect(201);

      const user = await User.findOne();

      const expected_user_payload = {
        _id: mongoose.Types.ObjectId.createFromHexString(response.body.id),
        role: 'student',
        ...user_request_payload
      };
      delete expected_user_payload.password;

      expect(user).toMatchObject(expected_user_payload);
    });

    it('Should store the password in its encrypted form.', async () => {
      const user_request_payload = {
        name: 'Ricardo Rosário',
        email: 'ricardo@gmail.com',
        password: '@123password'
      };

      await request(app)
        .post('/users')
        .send(user_request_payload)
        .expect(201);

      const user = await User.findOne();

      const is_password_correctly_hashed = await passwordEncryption.compare(
        user_request_payload.password,
        user.password
      );

      expect(user.password).not.toEqual(user_request_payload.password);
      expect(is_password_correctly_hashed).toBeTruthy();
    });
  });

  describe('Error cases', () => {
    it('Should return status code 409 if a user with the same email already exists.', async () => {
      const email_duplicated = 'ricardo@gmail.com';
      const expected_body_response = {
        error: 'Este email já foi registrado.'
      }

      const user1_request_payload = {
        name: 'Ricardo Rosário',
        email: email_duplicated,
        password: '@123password'
      };

      await request(app)
        .post('/users')
        .send(user1_request_payload)
        .expect(201);

      const user2_request_payload = {
        name: 'Ricardo Jorge',
        email: email_duplicated,
        password: '@123password'
      };

      const response = await request(app)
        .post('/users')
        .send(user2_request_payload)
        .expect(409);

      expect(response.body).toMatchObject(expected_body_response);
    });

    describe('Payload validation', () => {
      it('Should return status code 400 if there are additional fields.', async () => {
        const user_request_payload = {
          name: 'Ricardo Rosário',
          email: 'ricardo@gmail.com',
          role: 'admin',
          password: '@123password',
          age: 25
        };
        const expected_body_response = {
          error: 'O campo desconhecido "age" não é permitido.'
        }
  
        const response = await request(app)
          .post('/users')
          .send(user_request_payload)
          .expect(400);
  
        expect(response.body).toMatchObject(expected_body_response);
      });

      it('Should return status code 400 if the user does not provide the "name" field.', async () => {
        const user_request_payload = {
          email: 'ricardo@gmail.com',
          role: 'admin',
          password: '@123password',
        };
        const expected_body_response = {
          error: 'Campo "name" está em falta.'
        }
  
        const response = await request(app)
          .post('/users')
          .send(user_request_payload)
          .expect(400);
  
        expect(response.body).toMatchObject(expected_body_response);
      });
      
      it('Should return status code 400 if the "name" field is not of type String.', async () => {
        const user_request_payload = {
          name: 12345,
          email: 'ricardo@gmail.com',
          role: 'admin',
          password: '@123password',
        };
        const expected_body_response = {
          error: 'Campo "name" deve ser do tipo String.'
        }
  
        const response = await request(app)
          .post('/users')
          .send(user_request_payload)
          .expect(400);
  
        expect(response.body).toMatchObject(expected_body_response);
      });

      it('Should return status code 400 if the user does not provide the "email" field.', async () => {
        const user_request_payload = {
          name: 'Ricardo Rosário',
          role: 'admin',
          password: '@123password',
        };
        const expected_body_response = {
          error: 'Campo "email" está em falta.'
        }
  
        const response = await request(app)
          .post('/users')
          .send(user_request_payload)
          .expect(400);
  
        expect(response.body).toMatchObject(expected_body_response);
      });

      it('Should return status code 400 if the "email" field is not a valid email.', async () => {
        const user_request_payload = {
          name: 'Ricardo Rosário',
          email: 'ricardo.com',
          role: 'admin',
          password: '@123password'
        };
        const expected_body_response = {
          error: 'O email providenciado não é valido'
        }
  
        const response = await request(app)
          .post('/users')
          .send(user_request_payload)
          .expect(400);
  
        expect(response.body).toMatchObject(expected_body_response);
      });

      it('Should return status code 400 if the user does not provide the "password" field.', async () => {
        const user_request_payload = {
          name: 'Ricardo Rosário',
          email: 'ricardo@gmail.com',
          role: 'admin'
        };
        const expected_body_response = {
          error: 'Campo "password" está em falta.'
        }
  
        const response = await request(app)
          .post('/users')
          .send(user_request_payload)
          .expect(400);
  
        expect(response.body).toMatchObject(expected_body_response);
      });

      it('Should return status code 400 if the "password" field has fewer than 6 characters.', async () => {
        const user_request_payload = {
          name: 'Ricardo Rosário',
          email: 'ricardo@gmail.com',
          role: 'admin',
          password: '@123p'
        };
        const expected_body_response = {
          error: 'O password deve conter no mínimo 6 caractéres.'
        }
  
        const response = await request(app)
          .post('/users')
          .send(user_request_payload)
          .expect(400);
  
        expect(response.body).toMatchObject(expected_body_response);
      });

      it('Should return status code 400 if the "role" field, when provided, does not have one of the accepted values ("student" or "admin").', async () => {
        const user_request_payload = {
          name: 'Ricardo Rosário',
          email: 'ricardo@gmail.com',
          role: 'aluno',
          password: '@123psds'
        };
        const expected_body_response = {
          error: 'O valor do campo "role" deve ser uma das strings "student" ou "admin".'
        }
  
        const response = await request(app)
          .post('/users')
          .send(user_request_payload)
          .expect(400);
  
        expect(response.body).toMatchObject(expected_body_response);
      });
    });
  });
});