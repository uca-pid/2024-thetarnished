const express = require('express');
const authorizeRoles = require('../middleware/authMiddleware');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const mock_app = express();

mock_app.get('/teacher-dashboard', authorizeRoles('teacher'), (req, res) => {
  res.status(200).json({ message: 'Welcome to the teacher dashboard' });
});

mock_app.get('/student-dashboard', authorizeRoles('student'), (req, res) => {
  res.status(200).json({ message: 'Welcome to the student dashboard' });
});

mock_app.get('/admin-dashboard', authorizeRoles('admin'), (req, res) => {
  res.status(200).json({ message: 'Welcome to the admin dashboard' });
});

describe('Authorization Middleware tests', () =>{
    let teacherToken;
    let studentToken;
    let adminToken;

    beforeAll(() => {

        process.env.JWT_AUTH_SECRET = 'test_secret';
        teacherToken = jwt.sign({ teacherid: 1, role: 'teacher' }, process.env.JWT_AUTH_SECRET);
        studentToken = jwt.sign({ studentid: 1, role: 'student' }, process.env.JWT_AUTH_SECRET);
        adminToken = jwt.sign({ adminid: 1, role: 'admin' }, process.env.JWT_AUTH_SECRET);

    });

    it('Should allow a teacher to access a teacher route', async () => {
        const response = await request(mock_app)
            .get('/teacher-dashboard', authorizeRoles('teacher'))
            .set('Authorization', `Bearer ${teacherToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Welcome to the teacher dashboard');
    })

    it('Should allow a student to access a student route', async () => {
        const response = await request(mock_app)
            .get('/student-dashboard', authorizeRoles('student'))
            .set('Authorization', `Bearer ${studentToken}`);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Welcome to the student dashboard');
    });

    it('Should allow an admin to access an admin route', async () => {
        const response = await request(mock_app)
            .get('/admin-dashboard', authorizeRoles('admin'))
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Welcome to the admin dashboard');
    });

    it('Should not allow a student to access a teacher route', async () => {
        const response = await request(mock_app)
            .get('/teacher-dashboard', authorizeRoles('teacher'))
            .set('Authorization', `Bearer ${studentToken}`);
        
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Access Forbidden: Insufficient Permission');
    });

    it('Should not allow a teacher to access a student route', async () => {
        const response = await request(mock_app)
            .get('/student-dashboard', authorizeRoles('student'))
            .set('Authorization', `Bearer ${teacherToken}`);

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Access Forbidden: Insufficient Permission');
    });

    it('Should not allow a student to access an admin route', async () => {
        const response = await request(mock_app)
            .get('/admin-dashboard', authorizeRoles('admin'))
            .set('Authorization', `Bearer ${studentToken}`);

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Access Forbidden: Insufficient Permission');
    });

    it('Should not allow a teacher to access an admin route', async () => {
        const response = await request(mock_app)
            .get('/admin-dashboard', authorizeRoles('admin'))
            .set('Authorization', `Bearer ${teacherToken}`);

        expect(response.status).toBe(403);
            expect(response.body.message).toBe('Access Forbidden: Insufficient Permission');
    });

    it('Should not allow an admin to access a student route', async () => {
        const response = await request(mock_app)
            .get('/student-dashboard', authorizeRoles('student'))
            .set('Authorization', `Bearer ${adminToken}`);
        
            expect(response.status).toBe(403);
        expect(response.body.message).toBe('Access Forbidden: Insufficient Permission');
    });

    it('Should not allow an admin to access a teacher route', async () => {
        const response = await request(mock_app)
            .get('/teacher-dashboard', authorizeRoles('teacher'))
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Access Forbidden: Insufficient Permission');
    });

    it('Should not allow a user with an invalid role to access any route', async () => {
        const response = await request(mock_app)
            .get('/teacher-dashboard', authorizeRoles('teacher'))
            .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Invalid token provided');;
    });

    it('Should not allow a user with no token to access any route', async () => {
        const response = await request(mock_app)
            .get('/teacher-dashboard', authorizeRoles('teacher'));

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('No token provided');
    });
});
