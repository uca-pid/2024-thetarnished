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
      .post('/students')
      .send({
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
}); 
