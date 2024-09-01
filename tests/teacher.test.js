const sequelize = require('../config/databaseTest');
const request = require('supertest')
const app = require('../app');


describe('Teacher model (SQL memory)', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('Should create a new teacher', async () => {
    const response = await request(app)
      .post('/teachers/register')
      .send({
        name: 'Juan',
        lastname: 'Perez',
        email: 'juan@asd.com',
        password: '123',
        subjects: ['Math', 'Science']
      });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('juan@asd.com');
  });

  it('Should get a teacher by id', async () => {
    const response = await request(app)
      .get('/teachers/1');
    
    expect(response.status).toBe(200);
    expect(response.body.email).toBe('juan@asd.com');
  });

  it('Should not get a teacher by id', async () => {
    const response = await request(app)
      .get('/teachers/999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Teacher not found');
  });

  it('Should not create a teacher with invalid email', async () => {
    const response = await request(app)
      .post('/teachers/register')
      .send({
        name: 'Juan',
        lastname: 'Perez',
        email: 'juan@asd',
        password: '123',
        subjects: ['Math', 'Science']
      });
  });
});