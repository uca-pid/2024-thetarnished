const request = require('supertest');
const app = require('../app');
const Subject = require('../models/subjectModel');
describe('Authentication API', () => {

    afterAll(async () => {
        await Subject.destroy({
            where: {
                subjectname: 'dummytest'
            }
        });
        await Subject.destroy({
            where: {
                subjectname: 'dummytest2'
            }
        });
    });

    it("Should register a teacher", async () => {
            const dummytest = await request(app)
                .post('/subject/create')
                .send({
                    subjectname: "dummytest"
                });

            console.log(dummytest.body.subjectid);
            const dummytest2 = await request(app)
            .post('/subject/create')
            .send({
                subjectname: "dummytest2"
            });
        const registerResponse = await request(app)
            .post('/authentication/register')
            .send({
                firstname: 'Balti',
                lastname: 'Turanza',
                email: 'linkandlearnonline@gmail.com',
                password: 'password',
                subjects: [`${dummytest.body.subjectid}`, `${dummytest2.body.subjectid}`],
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
                email: 'balti111@asd.com',
                password: 'password',
                role:"STUDENT",
            });

        expect(registerResponse.status).toBe(201);
    });

    it("Should not register a user if it already exists", async () => {
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
                email: "balti111@asd.com",
                password: "password",
        });

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
        const loginResponse = await request(app)
            .post('/authentication/login')
            .send({
                email: "balti111@asd.com",
                password: "password231",
        });

        expect(loginResponse.status).toBe(401);
        expect(loginResponse.body.message).toBe('Invalid password') 
    });

    it("Should send an email to a user", async () => {
        const response = await request(app)
            .post('/authentication/send-email')
            .send({
                email: "linkandlearnonline@gmail.com",
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
});