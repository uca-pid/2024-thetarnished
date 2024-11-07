const request = require('supertest');
const app = require('../app');
const Student = require('../models/studentModel');
const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherModel');
const MonthlySchedule = require('../models/monthlyScheduleModel');
const Reservation = require('../models/reservationModel');
const Subject = require('../models/subjectModel');
const jwt = require('jsonwebtoken');

describe('Student API', () => {

  let student;
  let studentToken;
  let newstudent;
  let newstudentId;
  let teacherId;
  let studentId;
  let subjectId;
  let monthlyscheduleid;
  let firstMonthlySchedule;
  const studentFirstName = 'Jane';
  const studentLastName = 'Doe';
  const studentEmail = 'testStudent2@example.com';
  const password = 'password';
  jest.setTimeout(20000);

  beforeAll(async () => {
      const hashedOldPassword = await bcrypt.hash(password, 10);
      student = await Student.create({ firstname: studentFirstName, lastname: studentLastName, email: studentEmail, password: hashedOldPassword});
      studentId = student.studentid;
      newstudent = await Student.create({ firstname: studentFirstName, lastname: studentLastName, email: 'testStudent3@example.com', password: hashedOldPassword});
      newstudentId = newstudent.studentid;
      studentToken = jwt.sign({ studentId: student.studentId, role: 'STUDENT' }, process.env.JWT_AUTH_SECRET, { expiresIn: '1h' });
      
      const teacher = await Teacher.create(
        { firstname: 'John', lastname: 'Doe', email: 'john.doe123@example.com', password: 'password' });
      teacherId = teacher.teacherid;

      firstMonthlySchedule = await MonthlySchedule.create({
        datetime: "2023-05-29 10:00:00", //quizas esta fecha cause problemas
        teacherid: teacherId,
      });
      monthlyscheduleid = firstMonthlySchedule.monthlyscheduleid;

      const subject = await Subject.create(
        { subjectname: 'Mathematics' });
      subjectId = subject.subjectid;
      
      await Reservation.create({
        student_id: studentId,
        teacher_id: teacherId,
        subject_id: subjectId,
        schedule_id: monthlyscheduleid,
        datetime: "2023-05-29 10:00:00",

    });
    });
  
  afterAll(async () => {
      await Student.destroy({ where: { email: studentEmail } });
      await Student.destroy({ where: { email: 'testStudent3@example.com' } });
      await Teacher.destroy({ where: { teacherid: teacherId } });
  });

  it('Should get a student by id', async () => {
    const response = await request(app)
      .get(`/students/${student.studentid}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(studentEmail);
  });

  it('Should not get a student by invalid id', async () => {
    const response = await request(app)
      .get('/students/112358')
      .set('Authorization', `Bearer ${studentToken}`);

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
      .send(updatedStudentData)
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.firstname).toBe('Susan');
    expect(response.body.lastname).toBe('Wojcicki');
  });

  it("Should get a previous teacher", async () => {
    const response = await request(app)
      .get(`/students/get-previous/${studentId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(200);  
    expect(response.body[0].firstname).toBe('John');
    expect(response.body[0].lastname).toBe('Doe');
  });

  it("Should delete a student", async () => {
    const response = await request(app).delete(`/students/delete/${studentId}`)
    .set('Authorization', `Bearer ${studentToken}`);
    expect(response.status).toBe(200);
    const studentFound = await Student.findByPk(studentId);
    expect(studentFound).toBeNull();
  });

  it("Should not be possible to update a student with invalid id", async () => {
    const response = await request(app)
      .put('/students/update/112358')
      .send({
        firstname: 'invalidId',
        lastname: 'invalidId',
      })
      .set('Authorization', `Bearer ${studentToken}`);
      expect(response.status).toBe(404);
  });

  it("Should not be possible to delete a student with invalid id", async () => {
    const response = await request(app)
      .delete('/students/delete/112358')
      .set('Authorization', `Bearer ${studentToken}`);
      
      expect(response.status).toBe(404);
  });

});
