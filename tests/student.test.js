const sequelize = require('../config/databaseTest');
const request = require('supertest')
const app = require('../app');
//const Student = require('../models/studentModel');

describe('Student model (SQLlite memory)', () => {
  beforeAll(async () => {
    await sequelize.sync();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('Should create a student', async () => {
    const res = await request(app)
      .post('/students/register')
      .send({
        name: 'Juan',
        lastname: 'Perez',
        email: 'juan@asd.com',
        password: '123',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe('juan@asd.com');
  });

  it('Should find a student by id', async () => {
    const res = await request(app).get(`/students/${1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('juan@asd.com');
  });

  it('Should not find a student by invalid id', async () => {
    const res = await request(app).get(`/students/${999}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Student not found');
  });

  it('Should not create a student with invalid email', async () => {
    const res = await request(app)
      .post('/students/register')
      .send({
        name: 'Juan',
        lastname: 'Perez',
        email: 'juan@asd',
        password: '123',
      });

      expect(res.statusCode).toBe(400);
  });  
}); 
