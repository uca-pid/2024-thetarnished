const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');
const Teacher = require('../models/teacherModel');

describe('Teacher API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  }, 10000);

  afterAll(async () => {
    await sequelize.close();
  });

  it('Should create a new teacher', async () => {
    const response = await request(app)
      .post('/teachers/register')
      .send({
        name: 'Dr. Turanza',
        lastname: 'Turanza',
        subjects: ['Mathematics'],
        email: 'turanza@asd.com',
        password: 'password',
      });
  
    expect(response.status).toBe(201);
    expect(response.body.email).toBe('turanza@asd.com');
  });

  it('Should get a teacher by id', async () => {
    const createdTeacher = await Teacher.create({
      name: 'Prof. Peñoñori',
      lastname: 'Peñoñori',
      subjects: JSON.stringify(['Physics']),
      email: 'peñoñori@asd.com',
      password: 'password',
    });
  
    const response = await request(app)
      .get(`/teachers/${createdTeacher.id}`);
  
    expect(response.status).toBe(200);
    expect(response.body.email).toBe('peñoñori@asd.com');
  });

  it('Should not get a teacher by invalid id', async () => {
    const response = await request(app)
      .get('/teachers/999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Teacher not found');
  });

  it('Should not create a teacher with invalid email', async () => {
    const response = await request(app)
      .post('/teachers/register')
      .send({
        name: 'Invalid',
        lastname: 'Invalid',
        subjects: [],
        email: 'invalidemail',
        password: 'password',
      });
  
    expect(response.status).toBe(400);
  });
});
