const request = require('supertest');
const StudyModule = require('../../../models/StudyModule');

const app = require('../../../app.js');
const { dbConnect, dbDisconnect } = require('../../../__helpers__/mongodbServer/index.js');

describe('POST /studyModules', () => {
  let access_token;
  let user_id;
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
  });

  afterAll(async () => {
    await dbDisconnect();
  });

  describe('Success cases', () => {
    it('Should be able to store a studyModule instance when the user sent the full payload', async () => {
      const study_module_payload = {
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
        .send(study_module_payload)
        .expect(201);

      const expected_study_module_payload = {
        _id: expect.any(String),
        userId: user_id,
        ...study_module_payload
      }; 

      expect(response.body).toMatchObject(expected_study_module_payload);
    });

    it('Should be able to store a studyModule when the user does not send the description', async () => {
      const study_module_payload = {
        title: 'Matemática',
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
        .send(study_module_payload)
        .expect(201);

      const expected_study_module_payload = {
        _id: expect.any(String),
        userId: user_id,
        ...study_module_payload
      };

      expect(response.body).toMatchObject(expected_study_module_payload);
    });

    it('Should be able to store a studyModule when the user does not send the topics', async () => {
      const study_module_payload = {
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
        .send(study_module_payload)
        .expect(201);

      const expected_study_module_payload = {
        _id: expect.any(String),
        userId: user_id,
        ...study_module_payload
      };

      expect(response.body).toMatchObject(expected_study_module_payload);
    });
  });

  describe('Error cases', () => {
    it('Should return status code 400 when the user does not provide the title', async () => {
      const study_module_payload = {
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
        .send(study_module_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Campo "title" está em falta.'
      });
    });

    it('Should return status code 400 when the title is not a string', async () => {
      const study_module_payload = {
        title: 2121,
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
        .send(study_module_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Campo "title" deve ser do tipo String.'
      });
    });

    it('Should return status code 400 when the description is not a string', async () => {
      const study_module_payload = {
        title: 'Matemática',
        description: 5545,
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
        .send(study_module_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Campo "description" deve ser do tipo String.'
      });
    });

    it('Should return status code 400 when the user does provide the topics but its not an array', async () => {
      const study_module_payload = {
        title: 'Matemática',
        description: 'Ramo rigoroso do conhecimento fundamental e estrutural para maioria das ciências',
        topics: 'sads'
      };

      const response = await request(app)
        .post('/studyModules')
        .set('authorization', `Bearer ${access_token}`)
        .send(study_module_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Campo "topics" deve ser do tipo Array/List.'
      });
    });

    it('Should return status code 400 when the user does provide the topics and its an array but at least one of the items is not an object', async () => {
      const study_module_payload = {
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
          },
          'Last item'
        ]
      };

      const response = await request(app)
        .post('/studyModules')
        .set('authorization', `Bearer ${access_token}`)
        .send(study_module_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'O item topics[2] deve ser do tipo Object'
      });
    });

    it('Should return status code 400 when the user does provide the topics and its an array but one of the items has a name attribute that is not a String', async () => {
      const study_module_payload = {
        title: 'Matemática',
        description: 'Ramo rigoroso do conhecimento fundamental e estrutural para maioria das ciências',
        topics: [
          {
            name: 45454,
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
        .send(study_module_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'No item topics[0] o attributo "name" deve ser do tipo String.'
      });
    });

    it('Should return status code 400 when the user does provide the topics and its an array but one of the items has a content attribute that is not a String', async () => {
      const study_module_payload = {
        title: 'Matemática',
        description: 'Ramo rigoroso do conhecimento fundamental e estrutural para maioria das ciências',
        topics: [
          {
            name: 'Álgebra',
            content: 4845
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
        .send(study_module_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'No item topics[0] o attributo "content" deve ser do tipo String.'
      });
    });

    it('Should return status code 400 when the user does provide the topics and its an array but one of the items has an attribute that is invalid', async () => {
      const study_module_payload = {
        title: 'Matemática',
        description: 'Ramo rigoroso do conhecimento fundamental e estrutural para maioria das ciências',
        topics: [
          {
            name: 'Álgebra',
            content: 'Polinômios, equações, inequações e funções',
            description: 'O ramo da matematica que lida com as quantidades de forma mais genérica possivel'
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
        .send(study_module_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'No item topics[0], o attributo desconhecido "description" não é permetido.'
      });
    });
  });
});