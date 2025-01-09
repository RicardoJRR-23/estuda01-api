const request = require('supertest');
const mongoose = require('mongoose');

const StudyModule = require('../../../models/StudyModule/index.js');

const app = require('../../../app.js');
const { dbConnect, dbDisconnect } = require('../../../__helpers__/mongodbServer/index.js');

describe('PATCH /studyModules/:studyModuleId', () => {
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
    await StudyModule.deleteMany();

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
    it('Should be able to update the entire study module instance', async () => {
      const payload = {
        title: 'Algoritmos e estrutura de dados',
        description: 'Disciplina abordada em ciência de computação que ensina a teoria e a pratica de Algoritmos e estrutura de dados',
        topics: [
          {
            name: 'Algoritmos',
            content: 'Selection-Search, Binary-Search e Quicksort'
          }
        ]
      };
      
      await request(app)
        .patch(`/studyModules/${study_module_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .send(payload)
        .expect(204);

      const study_module = await StudyModule.findById(study_module_id);

      const common_expected_attributes = {
        _id: mongoose.Types.ObjectId.createFromHexString(study_module_id)
      };

      const not_expected_payload = {
        ...study_module_payload_created,
        ...common_expected_attributes
      };

      const expected_payload = {
        ...payload,
        ...common_expected_attributes
      }

      expect(study_module).not.toMatchObject(not_expected_payload);
      expect(study_module).toMatchObject(expected_payload);
    });

    it('Should be able to update partially the study module instance', async () => {
      const payload = {
        title: 'Matemática',
        description: 'Ramo do conhecimento',
        topics: [
          {
            name: 'Álgebra',
            content: 'Polinômios, equações, inequações e funções'
          }
        ]
      };

      await request(app)
        .patch(`/studyModules/${study_module_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .send(payload)
        .expect(204);

      const study_module = await StudyModule.findById(study_module_id);

      const common_expected_attributes = {
        _id: mongoose.Types.ObjectId.createFromHexString(study_module_id)
      };

      const not_expected_payload = {
        ...study_module_payload_created,
        ...common_expected_attributes
      };

      const expected_payload = {
        ...payload,
        ...common_expected_attributes
      }

      expect(study_module).not.toMatchObject(not_expected_payload);
      expect(study_module).toMatchObject(expected_payload);
    });
  });

  describe('Error cases', () => {
    it('Should return status code 400 when the user does not provide at least one of the attributes', async () => {
      const payload = {};

      const response = await request(app)
        .patch(`/studyModules/${study_module_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .send(payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Pelo menos um dos campos "title", "description" ou "topics" deve ser providenciado.'
      });
    });

    it('Should return status code 400 when the title is not a string', async () => {
      const payload = {
        title: 21211
      };

      const response = await request(app)
        .patch(`/studyModules/${study_module_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .send(payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Campo "title" deve ser do tipo String.'
      });
    });

    it('Should return status code 400 when the description is not a string', async () => {
      const payload = {
        description: 2121
      };

      const response = await request(app)
        .patch(`/studyModules/${study_module_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .send(payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Campo "description" deve ser do tipo String.'
      });
    });

    it('Should return status code 400 when the topics is not an array', async () => {
      const payload = {
        topics: 'dsddsd'
      };

      const response = await request(app)
        .patch(`/studyModules/${study_module_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .send(payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Campo "topics" deve ser do tipo Array/List.'
      });
    });

    it('Should return status code 400 when at least one of the topics items is not an object', async () => {
      const payload = {
        topics: [
          {
            name: 'Álgebra',
            content: 'Polinômios, equações, inequações e funções'
          },
          'dasdasd'
        ]
      };

      const response = await request(app)
        .patch(`/studyModules/${study_module_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .send(payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'O item topics[1] deve ser do tipo Object'
      });
    });

    it('Should return 404 if the id provided does not belong to an existing study module', async () => {
      const payload = {
        "description": "Ramo do conhecimento",
        "topics": [
          {
            "name": "Álgebra",
            "content": "Polinômios, equações, inequações e funções"
          }
        ]
      };

      const response = await request(app)
        .patch(`/studyModules/${new mongoose.Types.ObjectId()}`)
        .set('authorization', `Bearer ${access_token}`)
        .send(payload)
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Módulo de Estudo não encontrado.'
      });
    });

    it('Should return 404 if the id provided does belong to an existing study module, but the study module does not belong to the authenticated user', async () => {
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
      
      const study_module_payload = {
        description: 'Ramo do conhecimento',
        topics: [
          {
            name: 'Álgebra',
            content: 'Polinômios, equações, inequações e funções'
          }
        ]
      };
  
      const { body: { _id: study_module_id } } = await request(app)
        .post('/studyModules')
        .set('authorization', `Bearer ${new_user_access_token}`)
        .send(study_module_payload_created)
        .expect(201);
      
      await request(app)
        .patch(`/studyModules/${study_module_id}`)
        .set('authorization', `Bearer ${new_user_access_token}`)
        .send(study_module_payload)
        .expect(204);

      const old_user_access_token = access_token;

      const response = await request(app)
        .patch(`/studyModules/${study_module_id}`)
        .set('authorization', `Bearer ${old_user_access_token}`)
        .send(study_module_payload)
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Módulo de Estudo não encontrado.'
      });
    });
  });
});