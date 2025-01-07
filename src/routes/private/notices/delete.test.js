const request = require('supertest');
const mongoose = require('mongoose');

const Notice = require('../../../models/Notice');

const app = require('../../../app.js');
const { dbConnect, dbDisconnect } = require('../../../__helpers__/mongodbServer/index.js');

describe('DELETE /notices/:noticeId', () => {
  let access_token;
  let user_id;
  let notice_payload_created;
  let notice_id;

  beforeAll(async () => {
    await dbConnect();

    const user_payload = {
      name: 'Paulo Guilherme',
      email: 'paulo.guilherme@gmail.com',
      password: '@1234abc',
      role: 'admin'
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
    notice_payload_created = {
      datePublished: '2024-01-01T00:00:00.000Z',
      link: 'https://www.concursoeducacao2024.gov.br/edital',
      title: 'Edital do Concurso Público para Professor de Ensino Médio - 2024',
      description: 'Edital oficial para o concurso público de professores do ensino médio. Inclui requisitos de inscrição, cronograma de provas, conteúdo programático e normas gerais.',
    };

    const response = await request(app)
      .post('/notices')
      .set('authorization', `Bearer ${access_token}`)
      .send(notice_payload_created);

    notice_id = response.body._id;
  });

  afterAll(async () => {
    await dbDisconnect();
  });

  describe('Admin Users', () => {
    describe('Success cases', () => {
      it('Should return status code 204 if the notice is successfully deleted', async () => {
        await request(app)
          .get(`/notices/${notice_id}`)
          .set('authorization', `Bearer ${access_token}`)
          .expect(200);

        await request(app)
          .delete(`/notices/${notice_id}`)
          .set('authorization', `Bearer ${access_token}`)
          .expect(204);

        await request(app)
          .get(`/notices/${notice_id}`)
          .set('authorization', `Bearer ${access_token}`)
          .expect(404);
      });
    });

    describe('Error cases', () => {
      it('Should return 404 if the id provided does not belong to an existing notice', async () => {
        const response = await request(app)
          .delete(`/notices/${new mongoose.Types.ObjectId()}`)
          .set('authorization', `Bearer ${access_token}`)
          .expect(404);
        
        expect(response.body).toMatchObject({
          error: 'Edital não encontrado.'
        });
      });
    });
  });

  describe('Student Users', () => {
    describe('Error cases', () => {
      it('Should not be allowed to delete a notice', async () => {
        const user_payload = {
          name: 'Ricardo Lopez',
          email: 'ricardo.lopez@gmail.com',
          password: '@1234abc',
          role: 'student'
        };
  
        const user_created = await request(app)
          .post('/users')
          .send(user_payload)
          .expect(201);
  
        const session = await request(app)
          .post('/sessions')
          .send({
            email: user_payload.email,
            password: user_payload.password
          })
          .expect(201);
  
        const access_token = session.body.access_token;

        const response = await request(app)
          .delete(`/notices/${notice_id}`)
          .set('authorization', `Bearer ${access_token}`)
          .expect(403);
  
        const expected_notice_payload = {
          error: 'Não tem permissão para aceder a essa rota.'
        }; 
  
        expect(response.body).toMatchObject(expected_notice_payload);
      });
    })
  });
});