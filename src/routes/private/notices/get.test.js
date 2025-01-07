const request = require('supertest');
const app = require('../../../app.js');
const { dbConnect, dbDisconnect } = require('../../../__helpers__/mongodbServer/index.js');

describe('Fetch Notices', () => {
  let user_access_token_with_notices;
  let user_access_token_without_notices;
  let notices = [];

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

    user_access_token_with_notices = session1.body.access_token;
    user_access_token_without_notices = session2.body.access_token;

    
    const notice1 = {
      datePublished: '2024-01-01',
      link: 'https://www.concursoeducacao2024.gov.br/edital',
      title: 'Edital do Concurso Público para Professor de Ensino Médio - 2024',
      description: 'Edital oficial para o concurso público de professores do ensino médio. Inclui requisitos de inscrição, cronograma de provas, conteúdo programático e normas gerais.',
    };

    const notice2 = {
      datePublished: '2025-01-03',
      link: 'https://www.concursoeducacao2025.gov.br/edital',
      title: 'Edital do Concurso Público para Professor de Ensino Médio - 2025',
      description: 'Edital oficial para o concurso público de professores do ensino médio. Inclui requisitos de inscrição, cronograma de provas, conteúdo programático e normas gerais.',
    };

    const [notice1_created, notice2_created] = await Promise.all([
      request(app)
        .post('/notices')
        .set('authorization', `Bearer ${user_access_token_with_notices}`)
        .send(notice1),
      request(app)
        .post('/notices')
        .set('authorization', `Bearer ${user_access_token_with_notices}`)
        .send(notice2)
    ]);

    notices.push(notice1_created.body, notice2_created.body);
  });

  afterAll(async () => {
    await dbDisconnect();
  });

  describe('GET /notices', () => {
    describe('Success cases', () => {
      it('Should return status code 200 and a list of notices when the user has already created some', async () => {
        const response = await request(app)
          .get('/notices')
          .set('authorization', `Bearer ${user_access_token_with_notices}`)
          .expect(200);

        const expected_number_of_notices_stored = 2;

        expect(response.body).toHaveLength(expected_number_of_notices_stored);
        expect(response.body).toEqual(expect.arrayContaining(notices));
      });
  
      it('Should return status code 200 and an empty list of notices if the user never created any', async () => {
        const response = await request(app)
          .get('/notices')
          .set('authorization', `Bearer ${user_access_token_without_notices}`)
          .expect(200);
        
        const expected_number_of_notices_stored = 0;
        expect(response.body).toHaveLength(expected_number_of_notices_stored);
      });
    });
  });

  describe('GET /notices/:noticeId', () => {
    describe('Success cases', () => {
      it('Should return status code 200 and the respective notice that matches the provided id and also belongs to the authenticated user', async () => {
        const expected_notice_stored = notices[0];

        const response = await request(app)
          .get(`/notices/${expected_notice_stored._id}`)
          .set('authorization', `Bearer ${user_access_token_with_notices}`)
          .expect(200);

        expect(response.body).toMatchObject(expected_notice_stored);
      });
    });

    describe('Error cases', () => {
      it('Should return status code 404 when the provided id does not belong to any existing notice', async () => {
        const notice_id_that_does_not_exist = '6769973ec32d498d4402e3b0';

        const response = await request(app)
          .get(`/notices/${notice_id_that_does_not_exist}`)
          .set('authorization', `Bearer ${user_access_token_with_notices}`)
          .expect(404);

        expect(response.body).toMatchObject({
          error: 'Edital não encontrado.'
        });
      });

      it('Should return status code 404 when the provided id although matches an existing notice but it does not belonged to the authenticated user', async () => {
        const notice_id_that_does_not_belong_to_user = notices[0]._id;

        const response = await request(app)
          .get(`/notices/${notice_id_that_does_not_belong_to_user}`)
          .set('authorization', `Bearer ${user_access_token_without_notices}`)
          .expect(404);

        expect(response.body).toMatchObject({
          error: 'Edital não encontrado.'
        });
      });
    });
  });
});