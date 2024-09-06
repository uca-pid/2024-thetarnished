const request = require('supertest');
const app = require('../app');
const Teacher = require('../models/teacherModel');
const sequelize = require('../config/database');
const Subject = require('../models/subjectModel');

describe('Teacher API', () => { 

  afterAll(async () => {
    await sequelize.query('TRUNCATE TABLE teachers CASCADE');
  
    const subjectsToDelete = [
      'dummytestteacher', 
      'dummytestteacher2', 
      'dummytestteacher3', 
      'dummytestteacher4', 
      'dummytestteacher5', 
      'dummytestteacher6'
    ];
  
    await Subject.destroy({
      where: {
        subjectname: subjectsToDelete
      }
    });
  });


  


  it('Should get a teacher by id', async () => {
    const createdTeacher = await Teacher.create({
      firstname: 'Prof. Peñoñori',
      lastname: 'Peñoñori',
      email: 'peñoñori@asd.com',
      password: 'password',
    });
  
    const response = await request(app)
      .get(`/teachers/${createdTeacher.teacherid}`);
  
    expect(response.status).toBe(200);
    expect(response.body.email).toBe('peñoñori@asd.com');
  });

  it('Should not get a teacher by invalid id', async () => {
    const response = await request(app)
      .get('/teachers/999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Teacher not found');
  });

  it("Should update teacher's name", async () => {
    const teacher = await Teacher.create({
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      password: 'password',
    });

    const updatedTeacherData = {
      firstname: 'juancito',
      lastname: teacher.lastname,
    };

    const response = await request(app)
      .put(`/teachers/update/${teacher.teacherid}`)
      .send(updatedTeacherData);

    expect(response.status).toBe(200);
    expect(response.body.firstname).toBe('juancito');
  });

  it("Should delete a teacher", async () => {
    const teacher = await Teacher.create({
      firstname: 'John',
      lastname: 'Doe',
      email: 'juan@asd.com',
      password: '123',
    });
    const response = await request(app)
    .delete(`/teachers/delete/${teacher.teacherid}`)

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

  it("Should assign a subject to a teacher", async () => {
   
    const teacher = await Teacher.create({
      firstname: 'Prof. Smith',
      lastname: 'Smith',
      email: 'smith@asd.com',
      password: 'password',
    });

    const dummytestteacher = await request(app)
            .post('/subject/create')
            .send({
                subjectname: "dummytestteacher"
            });
    
    const response = await request(app)
      .post(`/teachers/assign-subject/${teacher.teacherid}`)
      .send({
        subjectid: `${dummytestteacher.body.subjectid}`, 
      });
  
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Subject assigned to teacher successfully');
  });


  it('Should return 404 if the teacher is not found', async () => {
    const nonExistentTeacherId = 9999; 
  
    const response = await request(app)
      .post(`/teachers/assign-subject/${nonExistentTeacherId}`)
      .send({
        subjectid: 1, 
      });
  
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Teacher not found');
  });
  
  it('Should return 404 if the subject is not found', async () => {
    
    const teacher = await Teacher.create({
      firstname: 'Prf. Smith',
      lastname: 'Smith',
      email: 'smithereens@asd.com',
      password: 'password',
    });
  
    const nonExistentSubjectId = 9999; 
  
    const response = await request(app)
      .post(`/teachers/assign-subject/${teacher.teacherid}`)
      .send({
        subjectid: nonExistentSubjectId, 
      });
  
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Subject not found');
  });

  it("Should remove a subject from a teacher", async () => {

    const dummytestteacher2 = await request(app)
            .post('/subject/create')
            .send({
                subjectname: "dummytestteacher2"
            });
    const dummytestteacher3 = await request(app)
            .post('/subject/create')
            .send({
                subjectname: "dummytestteacher3"
            });

    const teacher = await Teacher.create({
      firstname: 'Prof. Smith',
      lastname: 'Smith',
      email: 'smitheeee@asd.com',
      password: 'password',
      subjects: [`${dummytestteacher2.body.subjectid}`, `${dummytestteacher3.body.subjectid}`],
    });
    const response = await request(app)
    .delete(`/teachers/remove-subject/${teacher.teacherid}`)
    .send({
      subjectid: `${dummytestteacher3.body.subjectid}`,
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Subject removed from teacher successfully');
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

    const dummytestteacher4 = await request(app)
            .post('/subject/create')
            .send({
                subjectname: "dummytestteacher4"
            });

    const dummytestteacher5 = await request(app)
            .post('/subject/create')
            .send({
                subjectname: "dummytestteacher5"
            });        
    const teacher = await Teacher.create({
      firstname: 'Prof. Smith',
      lastname: 'Smith',
      email: 'smithee11@asd.com',
      password: 'password',
      subjects: [`${dummytestteacher4.body.subjectid}`, `${dummytestteacher5.body.subjectid}`],
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

    const dummytestteacher6 = await request(app)
            .post('/subject/create')
            .send({
                subjectname: "dummytestteacher6"
            });
      
    const registerResponse = await request(app)
            .post('/authentication/register')
            .send({
                firstname: 'Agustin',
                lastname: 'Turanza',
                email: 'agusT@gmail.com',
                password: 'password',
                subjects: [`${dummytestteacher6.body.subjectid}`],
                role:"TEACHER",
            });
    const registerTeacher = await request(app)
            .post('/authentication/register')
            .send({
                firstname: 'Agustin',
                lastname: 'Turanza',
                email: 'agusTuranza@gmail.com',
                password: 'password',
                subjects: [`${dummytestteacher6.body.subjectid}`],
                role:"TEACHER",
            });

            
    const response = await request(app)
    .get(`/teachers/all-dictating/${dummytestteacher6.body.subjectid}`);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
});
