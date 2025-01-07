const request = require('supertest');
const mongoose = require('mongoose');

const Notice = require('../../../models/Notice');

const app = require('../../../app.js');
const { dbConnect, dbDisconnect } = require('../../../__helpers__/mongodbServer/index.js');

describe('PUT /notices/:noticeId', () => {
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

  describe('Admin Users', () => {
    describe('Success cases', () => {
      it('Should be able to update the entire notice instance', async () => {
        const payload = {
          datePublished: '2024-01-01T00:00:00.000Z',
          link: 'https://www.concursoeducacao2025.gov.br/edital',
          title: 'Edital do Concurso Público para Professor de Ensino Médio - 2025',
          description: 'Edital oficial para o concurso público de professores do ensino médio.',
        };
        
        await request(app)
          .put(`/notices/${notice_id}`)
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
          ...notice_payload_created,
          title: 'Edital do Concurso Público para Professor de Ensino Médio - 2025',
          description: 'Edital oficial para o concurso público de professores do ensino médio.',
        };
        
        await request(app)
          .put(`/notices/${notice_id}`)
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
    });

    describe('Error cases', () => {
      it('Should return status code 400 when the user does not provide the title', async () => {
        const notice_payload = {
          datePublished: '2024-01-01T00:00:00.000Z',
          link: 'https://www.concursoeducacao2024.gov.br/edital',
          description: 'Edital oficial para o concurso público de professores do ensino médio. Inclui requisitos de inscrição, cronograma de provas, conteúdo programático e normas gerais.',
        };

        const response = await request(app)
          .put(`/notices/${notice_id}`)
          .set('authorization', `Bearer ${access_token}`)
          .send(notice_payload)
          .expect(400);

        expect(response.body).toMatchObject({
          error: 'Campo "title" está em falta.'
        });
      });

      it('Should return status code 400 when the user does not provide the description', async () => {
        const notice_payload = {
          datePublished: '2024-01-01T00:00:00.000Z',
          link: 'https://www.concursoeducacao2024.gov.br/edital',
          title: 'Edital do Concurso Público para Professor de Ensino Médio - 2024'
        };

        const response = await request(app)
          .put(`/notices/${notice_id}`)
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
          .put(`/notices/${notice_id}`)
          .set('authorization', `Bearer ${access_token}`)
          .send(notice_payload)
          .expect(400);

        expect(response.body).toMatchObject({
          error: 'Campo "link" está em falta.'
        });
      });

      it('Should return status code 400 when the user does not provide a datePublished', async () => {
        const notice_payload = {
          title: 'Edital do Concurso Público para Professor de Ensino Médio - 2024',
          description: 'Edital oficial para o concurso público de professores do ensino médio. Inclui requisitos de inscrição, cronograma de provas, conteúdo programático e normas gerais.',
          link: 'https://www.concursoeducacao2024.gov.br/edital'
        };

        const response = await request(app)
          .put(`/notices/${notice_id}`)
          .set('authorization', `Bearer ${access_token}`)
          .send(notice_payload)
          .expect(400);

        expect(response.body).toMatchObject({
          error: 'Campo "datePublished" está em falta.'
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
          .put(`/notices/${notice_id}`)
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
          .put(`/notices/${notice_id}`)
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
          .put(`/notices/${notice_id}`)
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
          .put(`/notices/${notice_id}`)
          .set('authorization', `Bearer ${access_token}`)
          .send(notice_payload)
          .expect(400);

        expect(response.body).toMatchObject({
          error: 'Campo "link" deve ser um link válido.'
        });
      });

      it('Should return 404 if the id provided does not belong to an existing notice', async () => {
        const notice_payload = {
          title: 'Edital do Concurso Público para Professor de Ensino Médio - 2024',
          description: 'Edital oficial para o concurso público de professores do ensino médio. Inclui requisitos de inscrição, cronograma de provas, conteúdo programático e normas gerais.',
          datePublished: '2024-01-01',
          link: 'https://www.concursoeducacao2024.gov.br/edital'
        };

        const response = await request(app)
          .put(`/notices/${new mongoose.Types.ObjectId()}`)
          .set('authorization', `Bearer ${access_token}`)
          .send(notice_payload)
          .expect(404);

        expect(response.body).toMatchObject({
          error: 'Edital não encontrado.'
        });
      });
    });
  });

  describe('Student Users', () => {
    describe('Error cases', () => {
      it('Should not be allowed to update a notice', async () => {
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

        const notice_payload = {
          datePublished: '2024-01-01T00:00:00.000Z',
          link: 'https://www.concursoeducacao2024.gov.br/edital',
          title: 'Edital do Concurso Público para Professor de Ensino Médio - 2024',
          description: 'Edital oficial para o concurso público de professores do ensino médio. Inclui requisitos de inscrição, cronograma de provas, conteúdo programático e normas gerais.',
        };
  
        const response = await request(app)
          .put(`/notices/${notice_id}`)
          .set('authorization', `Bearer ${access_token}`)
          .send(notice_payload)
          .expect(403);
  
        const expected_notice_payload = {
          error: 'Não tem permissão para aceder a essa rota.'
        }; 
  
        expect(response.body).toMatchObject(expected_notice_payload);
      });
    })
  });
});