const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../../../app.js');
const { dbConnect, dbDisconnect } = require('../../../__helpers__/mongodbServer/index.js');

describe('DELETE /studyModules/:studyModuleId', () => {
  let access_token;
  let user_id;
  let study_module_payload_created;
  let study_module_id;

  beforeAll(async () => {
    await dbConnect();

    const user_payload = {
      name: 'Paulo Guilherme',
      email: 'paulo.guilherme@gmail.com',
      password: '@1234abc'
    };

    const user_created = await request(app)
      .post('/users')
      .send(user_payload);
    user_id = user_created.body.id;

    const session = await request(app)
      .post('/sessions')
      .send({
        email: user_payload.email,
        password: user_payload.password
      });

    access_token = session.body.access_token;
  });

  beforeEach(async () => {
    study_module_payload_created = {
      title: 'Matemática',
      description: 'Ramo rigoroso do conhecimento fundamental e estrutural para maioria das ciências',
      topics: [
        {
          name: 'Álgebra',
          content: 'Polinômios, equações, inequações e funções'
        },
        {
          name: 'Geometria',
          content: 'Ângulos, Perpendicularidade e paralelismo, funções trigonometricas de ângulos suplementários.'
        }
      ]
    };

    const response = await request(app)
      .post('/studyModules')
      .set('authorization', `Bearer ${access_token}`)
      .send(study_module_payload_created);

    study_module_id = response.body._id;
  });

  afterAll(async () => {
    await dbDisconnect();
  });

  describe('Success cases', () => {
    it('Should return status code 204 if the study module is successfully deleted', async () => {
      await request(app)
        .get(`/studyModules/${study_module_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .expect(200);

      await request(app)
        .delete(`/studyModules/${study_module_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .expect(204);

      await request(app)
        .get(`/studyModules/${study_module_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .expect(404);
    });
  });

  describe('Error cases', () => {
    it('Should return status code 404 if the study module does not exist', async () => {
      const response = await request(app)
        .delete(`/studyModules/${new mongoose.Types.ObjectId()}`)
        .set('authorization', `Bearer ${access_token}`)
        .expect(404);
      
      expect(response.body).toMatchObject({
        error: 'Módulo de Estudo não encontrado.'
      });
    });

    it('Should return status code 404 if although the study module exist it does not belongs to the user authenticated', async () => {
      const user_payload = {
        name: 'Ricardo Lopes',
        email: 'ricardo.lopes@gmail.com',
        password: '@1234abc'
      };
  
      const user_created = await request(app)
        .post('/users')
        .send(user_payload)
        .expect(201);
      user_id = user_created.body.id;
  
      const session = await request(app)
        .post('/sessions')
        .send({
          email: user_payload.email,
          password: user_payload.password
        })
        .expect(201);
  
      const new_user_access_token = session.body.access_token;
  
      const { body: { _id: study_module_id } } = await request(app)
        .post('/studyModules')
        .set('authorization', `Bearer ${new_user_access_token}`)
        .send(study_module_payload_created)
        .expect(201);

      await request(app)
        .get(`/studyModules/${study_module_id}`)
        .set('authorization', `Bearer ${new_user_access_token}`)
        .expect(200);

      const old_user_access_token = access_token;

      const response = await request(app)
        .delete(`/studyModules/${study_module_id}`)
        .set('authorization', `Bearer ${old_user_access_token}`)
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Módulo de Estudo não encontrado.'
      });
    });
  });
});