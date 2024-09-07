const request = require('supertest');
const app = require('../app');
const Subject = require('../models/subjectModel');
const sequelize = require('../config/database');


describe('Authentication API', () => {
    beforeAll(async () => {
        subjectTest = await Subject.create({
            subjectname: 'authSubjectTest'
        });
        subjectTestID = subjectTest.subjectid;

        await request(app)
            .post('/authentication/register')
            .send({
                firstname: 'Martin',
                lastname: 'Tomason',
                email: 'MTOM@gmail.com',
                password: 'password',
                role:"STUDENT",
            });
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
        const registerDuplicate = await request(app)
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

    it("Should login a student", async () => {

        const loginResponse = await request(app)
            .post('/authentication/login')
            .send({
                email: "MTOM@gmail.com",
                password: "password",
        });
        console.log(loginResponse.body);
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.user.role).toBe('STUDENT');
    });

    it("Should not login a student with wrong email", async () => {
        const loginResponse = await request(app)
            .post('/authentication/login')
            .send({
                email: "balti2@asd.com",
                password: "password2",
        });

    expect(loginResponse.status).toBe(404);
    expect(loginResponse.body.message).toBe('User not found')    
    });

    it("Should not login a student with wrong password", async () => {

        
        const register = await request(app)
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

    // it("Should send an email to a user", async () => {
    //     const response = await request(app)
    //         .post('/authentication/send-email')
    //         .send({
    //             email: "linkandlearnonline@gmail.com",
    //         });

    //     expect(response.status).toBe(200);
    // });

    it("Should not send an email to a non existent user", async () => {
        const response = await request(app)
            .post('/authentication/send-email')
            .send({
                email: "jorge@gmail.com",
            });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found')
    });
});