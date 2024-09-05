const request = require('supertest');
const app = require('../app');
const Student = require('../models/studentModel');
const Teacher = require('../models/teacherModel');
const sequelize = require('../config/database');

describe('Authentication API', () => {

    it("Should create and login a student", async () => {
        const registerResponse = await request(app)
            .post('/students/register')
            .send({
                firstname: 'Balti',
                lastname: 'Turanza',
                email: 'balti111@asd.com',
                password: 'password',
            });

        expect(registerResponse.status).toBe(201);

        const loginResponse = await request(app)
            .post('/authentication/login')
            .send({
                email: "balti111@asd.com",
                password: "password",
        });

        console.log(loginResponse.body.user);

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.user.role).toBe('STUDENT');
    }, 10000);

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
});