const request = require('supertest');
const app = require('../../../app.js');
const { dbConnect, dbDisconnect } = require('../../../__helpers__/mongodbServer/index.js');

describe('Fetch Notices', () => {
  let admin_user1_access_token;
  let admin_user2_access_token;
  let student_user_access_token;
  let notices = [];

  beforeAll(async () => {
    await dbConnect();
    const admin_user1_payload = {
      name: 'Paulo Guilherme',
      email: 'paulo.guilherme@gmail.com',
      password: '@1234abc',
      role: 'admin'
    };

    const admin_user2_payload = {
      name: 'Ricardo Lopes',
      email: 'ricardo.lopes@gmail.com',
      password: '@1234abc',
      role: 'admin'
    };

    const student_user_payload = {
      name: 'Maria Lopes',
      email: 'Maria.lopes@gmail.com',
      password: '@1234abc',
      role: 'student'
    };

    const [
      admin_user1_created,
      admin_user2_created,
      student_user_created
    ] = await Promise.all([
      request(app)
        .post('/users')
        .send(admin_user1_payload),
      request(app)
        .post('/users')
        .send(admin_user2_payload),
      request(app)
        .post('/users')
        .send(student_user_payload)
    ]);

    const [
      admin_user1_session,
      admin_user2_session,
      student_user_session
    ] = await Promise.all([
      request(app)
        .post('/sessions')
        .send({
          email: admin_user1_payload.email,
          password: admin_user1_payload.password
        }),
      request(app)
        .post('/sessions')
        .send({
          email: admin_user2_payload.email,
          password: admin_user2_payload.password
        }),
      request(app)
        .post('/sessions')
        .send({
          email: student_user_payload.email,
          password: student_user_payload.password
        })
    ]);

    admin_user1_access_token = admin_user1_session.body.access_token;
    admin_user2_access_token = admin_user2_session.body.access_token;
    student_user_access_token = student_user_session.body.access_token;
    
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
        .set('authorization', `Bearer ${admin_user1_access_token}`)
        .send(notice1),
      request(app)
        .post('/notices')
        .set('authorization', `Bearer ${admin_user1_access_token}`)
        .send(notice2)
    ]);

    notices.push(notice1_created.body, notice2_created.body);
  });

  afterAll(async () => {
    await dbDisconnect();
  });
  
  describe('GET /notices', () => {
    describe('Admin Users', () => {
      describe('Success cases', () => {
        it('Should return status code 200 and a list of notices when the user has already created some', async () => {
          const response = await request(app)
            .get('/notices')
            .set('authorization', `Bearer ${admin_user1_access_token}`)
            .expect(200);

          const expected_number_of_notices_stored = 2;

          expect(response.body).toHaveLength(expected_number_of_notices_stored);
          expect(response.body).toEqual(expect.arrayContaining(notices));
        });

        it('Should allowed another admin user(that do not created the notices available) to fecth them', async () => {
          const response = await request(app)
            .get('/notices')
            .set('authorization', `Bearer ${admin_user2_access_token}`)
            .expect(200);

          const expected_number_of_notices_stored = 2;

          expect(response.body).toHaveLength(expected_number_of_notices_stored);
          expect(response.body).toEqual(expect.arrayContaining(notices));
        });
      });
    });

    describe('Student Users', () => {
      describe('Success cases', () => {
        it('Should return status code 200 and a list of notices when the admin users has already created some', async () => {
          const response = await request(app)
            .get('/notices')
            .set('authorization', `Bearer ${student_user_access_token}`)
            .expect(200);

          const expected_number_of_notices_stored = 2;

          expect(response.body).toHaveLength(expected_number_of_notices_stored);
          expect(response.body).toEqual(expect.arrayContaining(notices));
        });
      });
    });
  });

  describe('GET /notices/:noticeId', () => {
    describe('Admin Users', () => {
      describe('Success cases', () => {
        it('Should return status code 200 and the respective notice that matches the provided id', async () => {
          const expected_notice_stored = notices[0];

          const response = await request(app)
            .get(`/notices/${expected_notice_stored._id}`)
            .set('authorization', `Bearer ${admin_user1_access_token}`)
            .expect(200);

          expect(response.body).toMatchObject(expected_notice_stored);
        });
      });

      describe('Error cases', () => {
        it('Should return status code 404 when the provided id does not belong to any existing notice', async () => {
          const notice_id_that_does_not_exist = '6769973ec32d498d4402e3b0';

          const response = await request(app)
            .get(`/notices/${notice_id_that_does_not_exist}`)
            .set('authorization', `Bearer ${admin_user1_access_token}`)
            .expect(404);

          expect(response.body).toMatchObject({
            error: 'Edital não encontrado.'
          });
        });
      });
    });

    describe('Student Users', () => {
      describe('Success cases', () => {
        it('Should return status code 200 and the respective notice that matches the provided id', async () => {
          const expected_notice_stored = notices[0];

          const response = await request(app)
            .get(`/notices/${expected_notice_stored._id}`)
            .set('authorization', `Bearer ${student_user_access_token}`)
            .expect(200);

          expect(response.body).toMatchObject(expected_notice_stored);
        });
      });

      describe('Error cases', () => {
        it('Should return status code 404 when the provided id does not belong to any existing notice', async () => {
          const notice_id_that_does_not_exist = '6769973ec32d498d4402e3b0';

          const response = await request(app)
            .get(`/notices/${notice_id_that_does_not_exist}`)
            .set('authorization', `Bearer ${student_user_access_token}`)
            .expect(404);

          expect(response.body).toMatchObject({
            error: 'Edital não encontrado.'
          });
        });
      });
    });
  }); 
});