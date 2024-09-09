const request = require('supertest');
const app = require('../app');
const Subject = require('../models/subjectModel');
const sequelize = require('../config/database');
const Student = require('../models/studentModel');
const Teacher = require('../models/teacherModel');
const bcrypt = require('bcrypt');


describe('Authentication API', () => {
    beforeAll(async () => {
        subjectTest = await Subject.create({
            subjectname: 'authSubjectTest'
        });
        subjectTestID = subjectTest.subjectid;
    });
    
    afterAll(async () => {

        await sequelize.query('TRUNCATE TABLE subjectteacher CASCADE');
        try {
            const subject = await Subject.findOne({ where: { subjectname: 'authSubjectTest' } });
            if (subject) {
                const deletedCount = await Subject.destroy({
                    where: { subjectname: 'authSubjectTest' }
                });
                console.log(`${deletedCount} subject(s) deleted`);
            } else {
                console.log('No subject found with the given name');
            }
        } catch (error) {
            console.error('Error in afterAll cleanup:', error);
        }
        await sequelize.query('TRUNCATE TABLE students CASCADE');
    });

    it("Should register a teacher", async () => {

        const registerResponse = await request(app)
            .post('/authentication/register')
            .send({
                firstname: 'Balti',
                lastname: 'Turanza',
                email: 'linkandlearn@gmail.com',
                password: 'password',
                subjects: [subjectTestID],
                role:"TEACHER",
            });
            

        expect(registerResponse.status).toBe(201);
    });

    it("Should register a student", async () => {
        const registerResponse = await request(app)
            .post('/authentication/register')
            .send({
                firstname: 'Balti',
                lastname: 'Turanza',
                email: 'UniqueUser@asd.com',
                password: 'password',
                role:"STUDENT",
            });


        expect(registerResponse.status).toBe(201);
    });

    it("Should not register a user if it already exists", async () => {
        await request(app)
            .post('/authentication/register')
            .send({
                firstname: 'Balti',
                lastname: 'Turanza',
                email: 'linkandlearnonline@gmail.com',
                password: 'password',
                role:"STUDENT",
            });

            const registerResponse = await request(app)
            .post('/authentication/register')
            .send({
                firstname: 'Balti',
                lastname: 'Turanza',
                email: 'linkandlearnonline@gmail.com',
                password: 'password',
                role:"STUDENT",
            });
            

        expect(registerResponse.status).toBe(400);
        expect(registerResponse.body.message).toBe('User already exists');
    }),

    it('Should not register a student with wrong email', async () => {
        const registerResponse = await request(app)
            .post('/authentication/register')
            .send({
                firstname: 'Balti',
                lastname: 'Turanza',
                email: 'asddas',
                password: 'password',
                role:"STUDENT",
            });
        expect(registerResponse.status).toBe(400);
        expect(registerResponse.body.message).toBe('Invalid email');
    });

    it("Should login a Teacher", async () => {
        const loginResponse = await request(app)
            .post('/authentication/login')
            .send({
                email: "linkandlearn@gmail.com",
                password: "password",
        });
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.user.role).toBe('TEACHER');
    });

    it("Should not login a student with wrong email", async () => {
        const loginResponse = await request(app)
            .post('/authentication/login')
            .send({
                email: "balti22@asd.com",
                password: "password2",
        });

    expect(loginResponse.status).toBe(404);
    expect(loginResponse.body.message).toBe('User not found')    
    });

    it("Should not login a student with wrong password", async () => {     
        await request(app)
            .post('/authentication/register')
            .send({
                firstname: 'joaquin',
                lastname: 'colapinto',
                email: 'JCOL@gmail.com',
                password: 'password',
                role:"STUDENT",
            });

        const loginResponse = await request(app)
            .post('/authentication/login')
            .send({
                email: "JCOL@gmail.com",
                password: "Wrongpassword",
        });

        expect(loginResponse.status).toBe(401);
        expect(loginResponse.body.message).toBe('Invalid password') 
    });

    it("Should send an email to a user", async () => {
        const response = await request(app)
            .post('/authentication/send-email')
            .send({
                email: "JCOL@gmail.com",
            });

        expect(response.status).toBe(200);
    });

    it("Should not send an email to a non existent user", async () => {
        const response = await request(app)
            .post('/authentication/send-email')
            .send({
                email: "jorge@gmail.com",
            });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found')
    });

    it('Should not change the password if the user is not found', async () => {
        const hashedPassword = await bcrypt.hash('oldpassword', 10);
        await Student.create({
            firstname: 'Fran',
            lastname: 'Peñoñori',
            email: '12312@asd.com',
            password: hashedPassword,
        });
        const response = await request(app)
          .put('/authentication/change-password')
          .send({ oldPassword: "oldpassword", newPassword: 'newPassword', email: 'nonexistent@asd.com' });
    
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
      });

      it('Should return 401 if the old password is incorrect', async () => {
        const hashedPassword = await bcrypt.hash('oldpassword', 10);
        await Student.create({
            firstname: 'Fran',
            lastname: 'Peñoñori',
            email: 'adsgffgdfdsasdaffd@asd.com',
            password: hashedPassword,
        });
        const response = await request(app)
          .put('/authentication/change-password')
          .send({ oldPassword: "wrongpassword", newPassword: 'newPassword', email: 'adsgffgdfdsasdaffd@asd.com' });
    
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid password');
      });

      it('Should successfully change password for a student', async () => {
        const hashedPassword = await bcrypt.hash('oldpassword', 10);
        await Student.create({
            firstname: 'Fran',
            lastname: 'Peñoñori',
            email: 'adsgffgdfdsaffd@asd.com',
            password: hashedPassword,
        });

        const response = await request(app)
          .put('/authentication/change-password')
          .send({ oldPassword: "oldpassword", newPassword: 'newPassword', email: 'adsgffgdfdsaffd@asd.com' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Password changed successfully');
      });
});