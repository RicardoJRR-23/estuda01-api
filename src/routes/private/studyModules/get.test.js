const request = require('supertest');
const app = require('../../../app.js');
const { dbConnect, dbDisconnect } = require('../../../__helpers__/mongodbServer/index.js');

describe('Fetch StudyModules', () => {
  let user_access_token_with_study_modules;
  let user_access_token_without_study_modules;
  let study_modules = [];

  beforeAll(async () => {
    await dbConnect();
    const user1_payload = {
      name: 'Paulo Guilherme',
      email: 'paulo.guilherme@gmail.com',
      password: '@1234abc'
    };

    const user2_payload = {
      name: 'Ricardo Lopes',
      email: 'ricardo.lopes@gmail.com',
      password: '@1234abc'
    }

    const [user1_created, user2_created] = await Promise.all([
      request(app)
        .post('/users')
        .send(user1_payload),
      request(app)
        .post('/users')
        .send(user2_payload)
    ]);

    const [session1, session2] = await Promise.all([
      request(app)
        .post('/sessions')
        .send({
          email: user1_payload.email,
          password: user1_payload.password
        }),
      request(app)
        .post('/sessions')
        .send({
          email: user2_payload.email,
          password: user2_payload.password
        })
    ]);

    user_access_token_with_study_modules = session1.body.access_token;
    user_access_token_without_study_modules = session2.body.access_token;

    
    const study_module1 = {
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

    const study_module2 = {
      title: 'Algoritimos e estrutura de dados',
      description: 'Disciplina abordada em ciência de computação que ensina a teoria e a pratica de algoritimos e estrutura de dados',
      topics: [
        {
          name: 'Algoritimos',
          content: 'Selection-Search, Binary-Search e Quicksort'
        }
      ]
    };

    const [study_module1_created, study_module2_created] = await Promise.all([
      request(app)
        .post('/studyModules')
        .set('authorization', `Bearer ${user_access_token_with_study_modules}`)
        .send(study_module1),
      request(app)
        .post('/studyModules')
        .set('authorization', `Bearer ${user_access_token_with_study_modules}`)
        .send(study_module2)
    ]);

    study_modules.push(study_module1_created.body, study_module2_created.body);
  });

  afterAll(async () => {
    await dbDisconnect();
  });

  describe('GET /studyModules', () => {
    describe('Success cases', () => {
      it('Should return status code 200 and a list of study modules when the user has already created some', async () => {
        const response = await request(app)
          .get('/studyModules')
          .set('authorization', `Bearer ${user_access_token_with_study_modules}`)
          .expect(200);

        const expected_number_of_study_modules_stored = 2;

        expect(response.body).toHaveLength(expected_number_of_study_modules_stored);
        expect(response.body).toEqual(expect.arrayContaining(study_modules));
      });
  
      it('Should return status code 200 and an empty list of study modules if the user never created any', async () => {
        const response = await request(app)
          .get('/studyModules')
          .set('authorization', `Bearer ${user_access_token_without_study_modules}`)
          .expect(200);
        
        const expected_number_of_study_modules_stored = 0;
        expect(response.body).toHaveLength(expected_number_of_study_modules_stored);
      });
    });
  });

  describe('GET /studyModules/:studyModuleId', () => {
    describe('Success cases', () => {
      it('Should return status code 200 and the respective study module that matches the provided id and also belongs to the authenticated user', async () => {
        const expected_study_module_stored = study_modules[0];

        const response = await request(app)
          .get(`/studyModules/${expected_study_module_stored._id}`)
          .set('authorization', `Bearer ${user_access_token_with_study_modules}`)
          .expect(200);

        expect(response.body).toMatchObject(expected_study_module_stored);
      });
    });

    describe('Error cases', () => {
      it('Should return status code 404 when provided id does not belong to any existing study module', async () => {
        const study_module_id_that_does_not_exist = '6769973ec32d498d4402e3b0';

        const response = await request(app)
          .get(`/studyModules/${study_module_id_that_does_not_exist}`)
          .set('authorization', `Bearer ${user_access_token_with_study_modules}`)
          .expect(404);

        expect(response.body).toMatchObject({
          error: 'Módulo de Estudo não encontrado.'
        });
      });

      it('Should return status code 404 when the provided id although matches an existing study module but it does not belonged to the authenticated user', async () => {
        const study_module_id_that_does_not_belong_to_user = study_modules[0]._id;

        const response = await request(app)
          .get(`/studyModules/${study_module_id_that_does_not_belong_to_user}`)
          .set('authorization', `Bearer ${user_access_token_without_study_modules}`)
          .expect(404);

        expect(response.body).toMatchObject({
          error: 'Módulo de Estudo não encontrado.'
        });
      });
    });
  });
});