const request = require('supertest');
const app = require('../app');
const Teacher = require('../models/teacherModel');
const sequelize = require('../config/database');
const Subject = require('../models/subjectModel');
const SubjectTeacher = require('../models/subjectTeacherModel');
const bcrypt = require('bcrypt');
const { BIGINT } = require('sequelize');

describe('Teacher API', () => { 

    let teacher;
    const teacherFirstName = 'John';
    const teacherLastName = 'Doe';
    const teacherEmail = 'testTeacher@example.com';
    const oldPassword = 'oldpassword';
    let teacherID;

    beforeAll(async () => {
        const hashedOldPassword = await bcrypt.hash(oldPassword, 10);
        subjectTest = await Subject.create({
            subjectname: 'authSubjectTest'
        });
        subjectTestID = subjectTest.subjectid;
        console.log(subjectTest.subjectid);
        teacher = await Teacher.create({ firstname: teacherFirstName, lastname: teacherLastName, email: teacherEmail, password: hashedOldPassword, subjects: [subjectTestID]});
        teacherID = teacher.teacherid;
    });
    
    afterAll(async () => {
      await SubjectTeacher.destroy({ where: { teacherid: teacherID } });
      await Teacher.destroy({ where: { email: teacherEmail } });
      await Subject.destroy({ where: { subjectname: 'authSubjectTest' } });
    });
    
  it('Should get a teacher by id', async () => {

    const response = await request(app)
      .get(`/teachers/${teacher.teacherid}`);
  
    expect(response.status).toBe(200);
    expect(response.body.email).toBe(teacherEmail);
  });

  it('Should not get a teacher by invalid id', async () => {
    const response = await request(app)
      .get('/teachers/112358');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Teacher not found');
  });

  it("Should update teacher's name", async () => {
    const updatedTeacherData = {
      firstname: 'Jack',
      lastname: 'Smith',
    };

    const response = await request(app)
      .put(`/teachers/update/${teacher.teacherid}`)
      .send(updatedTeacherData);

    expect(response.status).toBe(200);
    expect(response.body.firstname).toBe('Jack');
    expect(response.body.lastname).toBe('Smith');
  });

  it("Should delete a teacher", async () => {
    const response = await request(app)
    .delete(`/teachers/delete/${teacher.teacherid}`)

    expect(response.status).toBe(200);
    const teacherFound = await Teacher.findByPk(teacher.id);
    expect(teacherFound).toBeNull();
  });

  it("Should not be possible to update a teacher with invalid id", async () => {
    const response = await request(app)
      .put('/teachers/update/112358')
      .send({
        name: 'invalidId',
        lastname: 'invalidId',
        subjects: [],
      });
      expect(response.status).toBe(404);
  });

  it("Should not be possible to delete a teacher with invalid id", async () => {
    const response = await request(app)
    .delete('/teachers/delete/112358');
    expect(response.status).toBe(404);
  });

  it("Should assign a subject to a teacher", async () => {

    const response = await request(app)
      .post(`/teachers/assign-subject/${teacher.teacherid}`)
      .send({
        subjectid: `${subjectTestID}`, 
      });
  
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Subject assigned to teacher successfully');
  });


  it('Should return 404 if the teacher is not found', async () => {
    const existentSubjectId = '1001938504758198273'; 
    const response = await request(app)
      .post('/teachers/assign-subject/112358')
      .send({
        subjectid: existentSubjectId, 
      });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Teacher not found');
  });
  
  it('Should return 404 if the subject is not found', async () => {
  
    const nonExistentSubjectId = 112358; 
    const response = await request(app)
      .post(`/teachers/assign-subject/${teacher.teacherid}`)
      .send({
        subjectid: `${nonExistentSubjectId}`, 
      });
  
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Teacher not found');
  });

  it("Should remove a subject from a teacher", async () => {

    const Subject1 = await request(app)
      .post('/subject/create')
      .send({
          subjectname: "subject_6"
      });
    console.log(Subject1.subjectid);
    const Subject2 = await request(app)
      .post('/subject/create')
      .send({
          subjectname: "subject_5"
      });
    const newTeacher = await Teacher.create({
      firstname: 'John',
      lastname: 'Cage',
      email: 'johnnycage7@gmail.com',
      password: oldPassword,
      subjects: [`${Subject1.subjectid}`, `${Subject2.subjectid}`],
    });
    const response = await request(app)
      .delete(`/teachers/remove-subject/${newTeacher.teacherid}`)
      .send({
        subjectid: `${Subject1.subjectid}`,
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Subject removed from teacher successfully');
    await SubjectTeacher.destroy({ where: { teacherid: newTeacher.teacherid } });
    await Teacher.destroy({ where: { email: 'johnnycage1@gmail.com' } });
    await Subject.destroy({ where: { subjectname: 'Subject_9' } });
    await Subject.destroy({ where: { subjectname: 'Subject_10' } });
  });

  it('Should not remove subject if teacher does not exists', async () => {
    const nonExistentTeacherId = 9999;
    const response = await request(app)
      .delete(`/teachers/remove-subject/${nonExistentTeacherId}`)
      .send({
        subjectid: 1,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Teacher not found');
  });

  it('Should not remove subject if subject does not exists', async () => {

    const testSubject4 = await request(app)
            .post('/subject/create')
            .send({
                subjectname: "testSubject4"
            });

    const testSubject5 = await request(app)
            .post('/subject/create')
            .send({
                subjectname: "testSubject5"
            });        
    const teacher = await Teacher.create({
      firstname: 'Prof. Smith',
      lastname: 'Smith',
      email: 'smithee11@asd.com',
      password: 'password',
      subjects: [`${testSubject4.body.subjectid}`, `${testSubject5.body.subjectid}`],
    });
    const nonExistentSubjectId = 9999;
    const response = await request(app) 
    .delete(`/teachers/remove-subject/${teacher.teacherid}`)
    .send({
      subjectid: nonExistentSubjectId,
    });
    
    expect(response.status).toBe(404);
  });

  it("Should retrieve all teachers that dictate an specific subject", async () => {

    const testSubject6 = await request(app)
            .post('/subject/create')
            .send({
                subjectname: "testSubject6"
            });
      
    const registerResponse = await request(app)
            .post('/authentication/register')
            .send({
                firstname: 'Agustin',
                lastname: 'Turanza',
                email: 'agusT@gmail.com',
                password: 'password',
                subjects: [`${testSubject6.body.subjectid}`],
                role:"TEACHER",
            });
    const registerTeacher = await request(app)
            .post('/authentication/register')
            .send({
                firstname: 'Agustin',
                lastname: 'Turanza',
                email: 'agusTuranza@gmail.com',
                password: 'password',
                subjects: [`${testSubject6.body.subjectid}`],
                role:"TEACHER",
            });

            
    const response = await request(app)
    .get(`/teachers/all-dictating/${testSubject6.body.subjectid}`);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
});
