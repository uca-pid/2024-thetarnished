const request = require('supertest');
const app = require('../app');
const Student = require('../models/studentModel');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

describe('Student API', () => {

  let student;
  const studentFirstName = 'Jane';
  const studentLastName = 'Doe';
  const studentEmail = 'testStudent@example.com';
  const password = 'password';

  beforeAll(async () => {
      const hashedOldPassword = await bcrypt.hash(password, 10);
      student = await Student.create({ firstname: studentFirstName, lastname: studentLastName, email: studentEmail, password: hashedOldPassword});
  });
  
  afterAll(async () => {
      await Student.destroy({ where: { email: studentEmail } });
  });

  it('Should get a student by id', async () => {
    const response = await request(app)
      .get(`/students/${student.studentid}`);
    expect(response.status).toBe(200);
    expect(response.body.email).toBe(studentEmail);
  });

  it('Should not get a student by invalid id', async () => {
    const response = await request(app)
      .get('/students/112358');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Student not found');
  });

  it("Should update student's name", async () => {
    const updatedStudentData = {
      firstname: 'Susan',
      lastname: 'Wojcicki',
    };

    const response = await request(app)
      .put(`/students/update/${student.studentid}`)
      .send(updatedStudentData);

    expect(response.status).toBe(200);
    expect(response.body.firstname).toBe('Susan');
    expect(response.body.lastname).toBe('Wojcicki');
  });

  it("Should delete a student", async () => {
    const response = await request(app).delete(`/students/delete/${student.studentid}`);
    expect(response.status).toBe(200);
    const studentFound = await Student.findByPk(student.studentid);
    expect(studentFound).toBeNull();
  });

  it("Should not be possible to update a student with invalid id", async () => {
    const response = await request(app)
      .put('/students/update/112358')
      .send({
        firstname: 'invalidId',
        lastname: 'invalidId',
      });
      expect(response.status).toBe(404);
  });

  it("Should not be possible to delete a student with invalid id", async () => {
    const response = await request(app)
      .delete('/students/delete/112358');
      expect(response.status).toBe(404);
  });
});
