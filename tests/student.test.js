const request = require('supertest');
const app = require('../app');
const Student = require('../models/studentModel');

describe('Student API', () => {
  
  it('Should create a new student', async () => {
  const student = await request(app)
    .post('/students/register')
    .send({
      firstname: 'Balti',
      lastname: 'Turanza',
      email: 'balti@asd.com',
      password: 'password',
    });


  expect(student.status).toBe(201);
  expect(student.body.email).toBe('balti@asd.com');

});

  it('Should get a student by id', async () => {
    const createdStudent = await Student.create({
      firstname: 'Fran',
      lastname: 'Peñoñori',
      email: 'peñoñori@asd.com',
      password: 'password',
    });
  
    const response = await request(app)
      .get(`/students/${createdStudent.studentid}`);
  
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
        firstname: 'Invalid',
        lastname: 'Email',
        email: 'invalidemail',
        password: 'password',
      });
  
    expect(response.status).toBe(400);
  });

  it("Should update student's name", async () => {
    const createdStudent = await Student.create({
      firstname: 'Fran',
      lastname: 'Peñoñori',
      email: 'pen@asd.com',
      password: 'password',
    });

    const updatedStudentData = {
      firstname: 'Jorge',
      lastname: 'Peñoñori',
    };

    const response = await request(app)
      .put(`/students/update/${createdStudent.studentid}`)
      .send(updatedStudentData);

    expect(response.status).toBe(200);
    expect(response.body.firstname).toBe('Jorge');
  });

  it("Should delete a student", async () => {
    const student = await Student.create({
      firstname: 'Fran',
      lastname: 'Peñoñori',
      email: 'dasdasdas@asdasd.com',
      password: 'password',
    });
    
    const response = await request(app)
    
    .delete(`/students/delete/${student.studentid}`);

    expect(response.status).toBe(200);
    
    const studentFound = await Student.findByPk(student.studentid);
    expect(studentFound).toBeNull();
  });

  it("Should not be possible to update a student with invalid id", async () => {
    const response = await request(app)
      .put('/students/update/999')
      .send({
        firstname: 'Invalid',
        lastname: 'Invalid',
      });
      expect(response.status).toBe(404);
  });

  it("Should not be possible to delete a student with invalid id", async () => {
    const response = await request(app)
      .delete('/students/delete/999');
      expect(response.status).toBe(404);
  });
});
