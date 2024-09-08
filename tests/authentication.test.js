const request = require('supertest');
const app = require('../app');
const Subject = require('../models/subjectModel');
const sequelize = require('../config/database');
const Student = require('../models/studentModel');
const Teacher = require('../models/teacherModel');
const bcrypt = require('bcrypt');
const { gmail } = require('googleapis/build/src/apis/gmail');
const { TEXT } = require('sequelize');


describe('Authentication API', () => {
    
    let student;
    let teacher;
    const teacherFirstName = 'John';
    const teacherLastName = 'Doe';
    const teacherEmail = 'testTeacher@example.com';
    const studentFirstName = 'Jane';
    const studentLastName = 'Doe';
    const studentEmail = 'testStudent@example.com';
    const oldPassword = 'oldpassword';
    const newPassword = 'newpassword';

    beforeAll(async () => {
        const hashedOldPassword = await bcrypt.hash(oldPassword, 10);
        subjectTest = await Subject.create({
            subjectname: 'authSubjectTest'
        });
        subjectTestID = subjectTest.subjectid;
        student = await Student.create({ firstname: studentFirstName, lastname: studentLastName, email: studentEmail, password: hashedOldPassword});
        teacher = await Teacher.create({ firstname: teacherFirstName, lastname: teacherLastName, email: teacherEmail, password: hashedOldPassword, subjects: [subjectTestID]});
    });
    
    afterAll(async () => {
        await Student.destroy({ where: { email: studentEmail } });
        await Teacher.destroy({ where: { email: teacherEmail } });
    });
    
    it("Should register a teacher", async () => {

        const registerResponse = await request(app)
            .post('/authentication/register')
            .send({
                firstname: 'Balti',
                lastname: 'Turanza',
                email: 'linkandlearn@gmail.com',
                password: oldPassword,
                subjects: [],
                role:"TEACHER",
            });
        expect(registerResponse.status).toBe(201);
        const email = 'linkandlearnonline@gmail.com';
        await Teacher.destroy({ where: { email } });
    });

    it("Should register a student", async () => {
        const registerResponse = await request(app)
            .post('/authentication/register')
            .send({
                firstname: 'Balti',
                lastname: 'Turanza',
                email: 'anotheremail@gmail.com',
                password: oldPassword,
                role:"STUDENT",
            });

        expect(registerResponse.status).toBe(201);
        await Student.destroy({ where: { email: 'anotheremail@asd.com' } });
    });

    it("Should not register a user if it already exists", async () => {

            const registerResponse = await request(app)
            .post('/authentication/register')
            .send({
                firstname: studentFirstName,
                lastname: studentLastName,
                email: studentEmail,
                password: oldPassword,
                role:"STUDENT",
            });
            
        expect(registerResponse.status).toBe(400);
        expect(registerResponse.body.message).toBe('User already exists');
    }),

    it('Should not register a student with wrong email', async () => {
        const registerResponse = await request(app)
            .post('/authentication/register')
            .send({
                firstname: studentFirstName,
                lastname: studentLastName,
                email: 'wrongemail',
                password: oldPassword,
                role:"STUDENT",
            });
        expect(registerResponse.status).toBe(400);
        expect(registerResponse.body.message).toBe('Invalid email');
    });

    it("Should login a Teacher", async () => {
        const loginResponse = await request(app)
            .post('/authentication/login')
            .send({
                email: teacherEmail,
                password: oldPassword,
        });
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.user.role).toBe('TEACHER');
    });

    it("Should not login a student with wrong email", async () => {
        const loginResponse = await request(app)
            .post('/authentication/login')
            .send({
                email: "wrongemail@gmail.com",
                password: oldPassword,
    });

    expect(loginResponse.status).toBe(404);
    expect(loginResponse.body.message).toBe('User not found')    
    });

    it("Should not login a student with wrong password", async () => {     
        const loginResponse = await request(app)
            .post('/authentication/login')
            .send({
                email: studentEmail,
                password: "wrongpassword",
        });

        expect(loginResponse.status).toBe(401);
        expect(loginResponse.body.message).toBe('Invalid password') 
    });

    it("Should send an email to a user", async () => {
        const response = await request(app)
            .post('/authentication/send-email')
            .send({
                email: studentEmail,
        });
        expect(response.status).toBe(200);;
    });

    it("Should not send an email to a non existent user", async () => {
        const response = await request(app)
            .post('/authentication/send-email')
            .send({
                email: "nonexistentuser@gmail.com",
            });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found')
    });

    it('Should not change the password if the user is not found', async () => {
        const hashedPassword = await bcrypt.hash('oldpassword', 10);
        const response = await request(app)
          .put('/authentication/change-password')
          .send({ oldPassword: oldPassword, newPassword: newPassword, email: "anothernonexistentuser@gmail.com" });
    
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
      });

      it('Should return 401 if the old password is incorrect', async () => {
        const response = await request(app)
          .put('/authentication/change-password')
          .send({ oldPassword: "wrongpassword", newPassword: newPassword, email: studentEmail });
    
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid password');
      });

      it('Should successfully change password for a student', async () => {
        const response = await request(app)
          .put('/authentication/change-password')
          .send({ oldPassword: oldPassword, newPassword: newPassword, email: studentEmail });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Password changed successfully');
      });
});