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

  it("Should update teacher's name", async () => {
    const teacher = await Teacher.create({
      name: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      password: 'password',
      subjects: JSON.stringify(['Math', 'Physics']),
    });

    const updatedTeacherData = {
      name: 'Elmasca',
      lastname: teacher.lastname,
      subjects: JSON.parse(teacher.subjects),
    };

    const response = await request(app)
      .put(`/teachers/update/${teacher.id}`)
      .send(updatedTeacherData);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Elmasca');
  });

  it("Should delete a teacher", async () => {
    const teacher = await Teacher.create({
      name: 'John',
      lastname: 'Doe',
      email: 'juan@asd.com',
      password: '123',
      subjects: JSON.stringify(['Math', 'Physics']),
    });
    const response = await request(app)
    .delete(`/teachers/delete/${teacher.id}`)

    expect(response.status).toBe(200);

    const teacherFound = await Teacher.findByPk(teacher.id);
    expect(teacherFound).toBeNull();
  });

  it("Should not be possible to update a teacher with invalid id", async () => {
    const response = await request(app)
      .put('/teachers/update/999')
      .send({
        name: 'Invalid',
        lastname: 'Invalid',
        subjects: [],
      });
      expect(response.status).toBe(404);
  });

  it("Should not be possible to delete a teacher with invalid id", async () => {
    const response = await request(app)
    .delete('/teachers/delete/999');
    expect(response.status).toBe(404);
  });
});
