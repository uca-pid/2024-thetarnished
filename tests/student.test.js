const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');
const Student = require('../models/studentModel');

describe('Student API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  }, 10000);
  
  afterAll(async () => {
    await sequelize.close();
  });

  it('Should create a new student', async () => {
    const response = await request(app)
      .post('/students/register')
      .send({
        name: 'Balti',
        lastname: 'Turanza',
        email: 'balti@asd.com',
        password: 'password',
      });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('balti@asd.com');
});

  it('Should get a student by id', async () => {
    const createdStudent = await Student.create({
      name: 'Fran',
      lastname: 'Peñoñori',
      email: 'peñoñori@asd.com',
      password: 'password',
    });
  
    const response = await request(app)
      .get(`/students/${createdStudent.id}`);
  
    expect(response.status).toBe(200);
    expect(response.body.email).toBe('peñoñori@asd.com');
  });

  it('Should not get a student by invalid id', async () => {
    const response = await request(app)
      .get('/students/999');
  
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Student not found');
  });

  it('Should not create a student with invalid email', async () => {
    const response = await request(app)
      .post('/students/register')
      .send({
        name: 'Invalid',
        lastname: 'Email',
        email: 'invalidemail',
        password: 'password',
      });
  
    expect(response.status).toBe(400);

  });
});
