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

    it('Should return 404 if the provided id does belong to an existing notice, but the notice does not belong to the authenticated user', async () => {
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
  
      const { body: { _id: notice_id } } = await request(app)
        .post('/notices')
        .set('authorization', `Bearer ${new_user_access_token}`)
        .send(notice_payload_created)
        .expect(201);

      await request(app)
        .get(`/notices/${notice_id}`)
        .set('authorization', `Bearer ${new_user_access_token}`)
        .expect(200);

      const old_user_access_token = access_token;

      const response = await request(app)
        .delete(`/notices/${notice_id}`)
        .set('authorization', `Bearer ${old_user_access_token}`)
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Edital não encontrado.'
      });
    });
  });
});