const request = require('supertest');
const Notice = require('../../../models/Notice');
const mongoose = require('mongoose');

const app = require('../../../app.js');
const { dbConnect, dbDisconnect } = require('../../../__helpers__/mongodbServer/index.js');

describe('POST /notices', () => {
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
    await Notice.deleteMany();
  });

  afterAll(async () => {
    await dbDisconnect();
  });

  describe('Success cases', () => {
    it('Should be able to store a notice when the payload sent match the schema structure requirements', async () => {
      const notice_payload = {
        datePublished: '2024-01-01',
        link: 'https://www.concursoeducacao2024.gov.br/edital',
        title: 'Edital do Concurso Público para Professor de Ensino Médio - 2024',
        description: 'Edital oficial para o concurso público de professores do ensino médio. Inclui requisitos de inscrição, cronograma de provas, conteúdo programático e normas gerais.',
      };

      const response = await request(app)
        .post('/notices')
        .set('authorization', `Bearer ${access_token}`)
        .send(notice_payload)
        .expect(201);

      const notice = await Notice.findOne();

      const expected_notice_payload = {
        _id: mongoose.Types.ObjectId.createFromHexString(response.body.id),
        userId: mongoose.Types.ObjectId.createFromHexString(user_id),
        ...notice_payload
      };
      expected_notice_payload.datePublished =
        new Date(expected_notice_payload.datePublished);   

      expect(response.body).toMatchObject({
        id: expect.any(String)
      });
      expect(notice).toMatchObject(expected_notice_payload);
    });

    it('Should be able to store a notice when the payload sent match does not contain the "datePublished" attribute.', async () => {
      const notice_payload = {
        link: 'https://www.concursoeducacao2024.gov.br/edital',
        title: 'Edital do Concurso Público para Professor de Ensino Médio - 2024',
        description: 'Edital oficial para o concurso público de professores do ensino médio. Inclui requisitos de inscrição, cronograma de provas, conteúdo programático e normas gerais.',
      };

      const response = await request(app)
        .post('/notices')
        .set('authorization', `Bearer ${access_token}`)
        .send(notice_payload)
        .expect(201);

      const notice = await Notice.findOne();

      const expected_notice_payload = {
        _id: mongoose.Types.ObjectId.createFromHexString(response.body.id),
        userId: mongoose.Types.ObjectId.createFromHexString(user_id),
        ...notice_payload,
        datePublished: expect.any(Date)
      };

      expect(response.body).toMatchObject({
        id: expect.any(String)
      });
      expect(notice).toMatchObject(expected_notice_payload);
    });
  });

  describe('Error cases', () => {
    it('Should return status code 400 when the user does not provide the title', async () => {
      const notice_payload = {
        datePublished: '2024-01-01',
        link: 'https://www.concursoeducacao2024.gov.br/edital',
        description: 'Edital oficial para o concurso público de professores do ensino médio. Inclui requisitos de inscrição, cronograma de provas, conteúdo programático e normas gerais.',
      };

      const response = await request(app)
        .post('/notices')
        .set('authorization', `Bearer ${access_token}`)
        .send(notice_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Campo "title" está em falta.'
      });
    });

    it('Should return status code 400 when the user does not provide the description', async () => {
      const notice_payload = {
        datePublished: '2024-01-01',
        link: 'https://www.concursoeducacao2024.gov.br/edital',
        title: 'Edital do Concurso Público para Professor de Ensino Médio - 2024'
      };

      const response = await request(app)
        .post('/notices')
        .set('authorization', `Bearer ${access_token}`)
        .send(notice_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Campo "description" está em falta.'
      });
    });   

    it('Should return status code 400 when the user does not provide a link', async () => {
      const notice_payload = {
        title: 'Edital do Concurso Público para Professor de Ensino Médio - 2024',
        description: 'Edital oficial para o concurso público de professores do ensino médio. Inclui requisitos de inscrição, cronograma de provas, conteúdo programático e normas gerais.',
        datePublished: '2024-01-01'
      };

      const response = await request(app)
        .post('/notices')
        .set('authorization', `Bearer ${access_token}`)
        .send(notice_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Campo "link" está em falta.'
      });
    });

    it('Should return status code 400 when the title is not a string', async () => {
      const notice_payload = {
        title: 455,
        description: 'Edital oficial para o concurso público de professores do ensino médio. Inclui requisitos de inscrição, cronograma de provas, conteúdo programático e normas gerais.',
        datePublished: '2024-01-01',
        link: 'https://www.concursoeducacao2024.gov.br/edital'
      };

      const response = await request(app)
        .post('/notices')
        .set('authorization', `Bearer ${access_token}`)
        .send(notice_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Campo "title" deve ser do tipo String.'
      });
    });

    it('Should return status code 400 when the description is not a string', async () => {
      const notice_payload = {
        title: 'Edital do Concurso Público para Professor de Ensino Médio - 2024',
        description: 445,
        datePublished: '2024-01-01',
        link: 'https://www.concursoeducacao2024.gov.br/edital'
      };

      const response = await request(app)
        .post('/notices')
        .set('authorization', `Bearer ${access_token}`)
        .send(notice_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Campo "description" deve ser do tipo String.'
      });
    });

    it('Should return status code 400 when the datePublished is not a valid format', async () => {
      const notice_payload = {
        title: 'Edital do Concurso Público para Professor de Ensino Médio - 2024',
        description: 'Edital oficial para o concurso público de professores do ensino médio. Inclui requisitos de inscrição, cronograma de provas, conteúdo programático e normas gerais.',
        datePublished: 'sadsds',
        link: 'https://www.concursoeducacao2024.gov.br/edital'
      };

      const response = await request(app)
        .post('/notices')
        .set('authorization', `Bearer ${access_token}`)
        .send(notice_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'O valor do campo "datePublished" deve estar no formato AAA-MM-DD'
      });
    });

    it('Should return status code 400 when the link is not a valid format', async () => {
      const notice_payload = {
        title: 'Edital do Concurso Público para Professor de Ensino Médio - 2024',
        description: 'Edital oficial para o concurso público de professores do ensino médio. Inclui requisitos de inscrição, cronograma de provas, conteúdo programático e normas gerais.',
        datePublished: '2024-01-01',
        link: 'concursoeducacao2024l',
      };

      const response = await request(app)
        .post('/notices')
        .set('authorization', `Bearer ${access_token}`)
        .send(notice_payload)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Campo "link" deve ser um link válido.'
      });
    });
  });
});