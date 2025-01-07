const request = require('supertest');
const mongoose = require('mongoose');

const Notice = require('../../../models/Notice');

const app = require('../../../app.js');
const { dbConnect, dbDisconnect } = require('../../../__helpers__/mongodbServer/index.js');

describe('PATCH /notices/:noticeId', () => {
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
    await Notice.deleteMany();

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
    it('Should be able to update the entire notice instance', async () => {
      const payload = {
        datePublished: '2024-01-01T00:00:00.000Z',
        link: 'https://www.concursoeducacao2025.gov.br/edital',
        title: 'Edital do Concurso Público para Professor de Ensino Médio - 2025',
        description: 'Edital oficial para o concurso público de professores do ensino médio.',
      };
      
      await request(app)
        .patch(`/notices/${notice_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .send(payload)
        .expect(204);

      const notice = await Notice.findById(notice_id);

      const common_expected_attributes = {
        _id: mongoose.Types.ObjectId.createFromHexString(notice_id),
        datePublished: new Date(payload.datePublished),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };

      const not_expected_payload = {
        ...notice_payload_created,
        ...common_expected_attributes
      };

      const expected_payload = {
        ...payload,
        ...common_expected_attributes
      }

      expect(notice).not.toMatchObject(not_expected_payload);
      expect(notice).toMatchObject(expected_payload);
    });

    it('Should be able to update partially the notice instance', async () => {
      const payload = {
        title: 'Edital do Concurso Público para Professor de Ensino Médio - 2025',
        description: 'Edital oficial para o concurso público de professores do ensino médio.'
      };
      
      await request(app)
        .patch(`/notices/${notice_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .send(payload)
        .expect(204);

      const notice = await Notice.findById(notice_id);

      const not_expected_payload = {
        ...notice_payload_created,
        _id: mongoose.Types.ObjectId.createFromHexString(notice_id),
        datePublished: new Date(notice_payload_created.datePublished),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };

      const expected_payload = {
        ...not_expected_payload,
        ...payload,
      }

      expect(notice).not.toMatchObject(not_expected_payload);
      expect(notice).toMatchObject(expected_payload);
    });
  });

  describe('Error cases', () => {
    it('Should return status code 400 when the user does not provide at least one of the attributes', async () => {
      const notice_payload = {};

      const response = await request(app)
        .patch(`/notices/${notice_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .send(notice_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Pelo menos um dos campos "title", "description", "datePublished" ou "link" deve ser providenciado.'
      });
    });

    it('Should return status code 400 when the title is not a string', async () => {
      const notice_payload = {
        title: 455
      };

      const response = await request(app)
        .patch(`/notices/${notice_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .send(notice_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Campo "title" deve ser do tipo String.'
      });
    });

    it('Should return status code 400 when the description is not a string', async () => {
      const notice_payload = {
        description: 445
      };

      const response = await request(app)
        .patch(`/notices/${notice_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .send(notice_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Campo "description" deve ser do tipo String.'
      });
    });

    it('Should return status code 400 when the datePublished is not a valid format', async () => {
      const notice_payload = {
        datePublished: 'sadsds'
      };

      const response = await request(app)
        .patch(`/notices/${notice_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .send(notice_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'O valor do campo "datePublished" deve estar no formato AAA-MM-DD'
      });
    });

    it('Should return status code 400 when the link is not a valid format', async () => {
      const notice_payload = {
        link: 'concursoeducacao2024l'
      };

      const response = await request(app)
        .patch(`/notices/${notice_id}`)
        .set('authorization', `Bearer ${access_token}`)
        .send(notice_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Campo "link" deve ser um link válido.'
      });
    });

    it('Should return 404 if the id provided does not belong to an existing notice', async () => {
      const notice_payload = {
        title: 'Edital do Concurso Público para Professor de Ensino Médio - 2024'
      };

      const response = await request(app)
        .patch(`/notices/${new mongoose.Types.ObjectId()}`)
        .set('authorization', `Bearer ${access_token}`)
        .send(notice_payload)
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
      
      const notice_payload = {
        datePublished: '2024-01-01T00:00:00.000Z',
        link: 'https://www.concursoeducacao2024.gov.br/edital',
        title: 'Edital do Concurso Público para Professor de Ensino Médio - 2024',
        description: 'Edital oficial para o concurso público de professores do ensino médio. Inclui requisitos de inscrição, cronograma de provas, conteúdo programático e normas gerais.',
      };
  
      const { body: { _id: notice_id } } = await request(app)
        .post('/notices')
        .set('authorization', `Bearer ${new_user_access_token}`)
        .send(notice_payload_created)
        .expect(201);

      await request(app)
        .patch(`/notices/${notice_id}`)
        .set('authorization', `Bearer ${new_user_access_token}`)
        .send(notice_payload)
        .expect(204);

      const old_user_access_token = access_token;

      const response = await request(app)
        .patch(`/notices/${notice_id}`)
        .set('authorization', `Bearer ${old_user_access_token}`)
        .send(notice_payload)
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Edital não encontrado.'
      });
    });
  });
});