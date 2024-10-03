const request = require('supertest');
const app = require('../app');
const Student = require('../models/studentModel');
const Teacher = require('../models/teacherModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');

jest.mock('nodemailer');
jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        setCredentials: jest.fn(),
        getAccessToken: jest.fn().mockResolvedValue('access-token')
      }))
    }
  }
}));

describe('Password Reset Controller Tests', () => {
  const studentEmail = 'student123@example.com';
  const teacherEmail = 'teacher123@example.com';
  let studentId;
  let teacherId;
  jest.setTimeout(20000);
  beforeAll(async () => {
    const student = await Student.create({ firstname: 'Juan Yuri Baltasar', lastname: 'Turanza', email: studentEmail, password: 'password' });
    const teacher = await Teacher.create({ firstname: 'Juancito Yurito Baltasarcito', lastname: 'Turanzita', email: teacherEmail, password: 'password' });
    studentId = student.studentid
    teacherId = teacher.teacherid
  });

  afterAll(async () => {
    await Student.destroy({ where: { email: studentEmail } });
    await Teacher.destroy({ where: { email: teacherEmail } });
  });

  describe('POST /forgot-password', () => {
    it('should send a password reset email if student exists', async () => {
      jest.spyOn(fs, 'readFileSync').mockReturnValue('<a href="${resetLink}">Reset Password</a>');
      jest.spyOn(jwt, 'sign').mockReturnValue('mock-token');

      const res = await request(app)
        .post('/reset/forgot-password')
        .send({ email: studentEmail });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Password reset link has been sent to your email');
    });

    it('should send a password reset email if teacher exists', async () => {
      jest.spyOn(fs, 'readFileSync').mockReturnValue('<a href="${resetLink}">Reset Password</a>');
      jest.spyOn(jwt, 'sign').mockReturnValue('mock-token');

      const res = await request(app)
        .post('/reset/forgot-password')
        .send({ email: teacherEmail });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Password reset link has been sent to your email');
    });

    it('should return 404 if user does not exist', async () => {
      const res = await request(app)
        .post('/reset/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });

    it('should return 500 if there is an error sending the email', async () => {
      jest.spyOn(jwt, 'sign').mockImplementation(() => { throw new Error('JWT error'); });

      const res = await request(app)
        .post('/reset/forgot-password')
        .send({ email: studentEmail });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message', 'Internal server error');
    });
  });

  describe('GET /reset-password/:id/:token', () => {
    const token = 'mock-token';

    beforeEach(() => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => ({ email: studentEmail, id: studentId }));
    });

    it('should return student details if token is valid', async () => {
      const res = await request(app)
        .get(`/reset/reset-password/${studentId}/${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Valid Credentials');
      expect(res.body).toHaveProperty('email', studentEmail);
      expect(res.body).toHaveProperty('id', studentId);
    });

    it('should return teacher details if token is valid', async () => {
      const res = await request(app)
        .get(`/reset/reset-password/${teacherId}/${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Valid Credentials');
      expect(res.body).toHaveProperty('email', teacherEmail);
      expect(res.body).toHaveProperty('id', teacherId);
    });

    it('should return 404 if user is not found', async () => {
      const res = await request(app)
        .get(`/reset/reset-password/999/${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });

    it('should return 400 if token is invalid', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error('Invalid token'); });

      const res = await request(app)
        .get(`/reset/reset-password/${studentId}/invalid-token`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid token');
    });
  });

  describe('POST /reset-password/:id/:token', () => {
    const newPassword = 'newpassword';
    const token = 'mock-token';

    it('should reset the password for a student if token is valid', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => ({ email: studentEmail, id: studentId }));
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password');

      const res = await request(app)
        .post(`/reset/reset-password/${studentId}/${token}`)
        .send({ newPassword });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Password reset successful');
    });

    it('should reset the password for a teacher if token is valid', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => ({ email: studentEmail, id: teacherId }));
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password');

      const res = await request(app)
        .post(`/reset/reset-password/${teacherId}/${token}`)
        .send({ newPassword });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Password reset successful');
    });

    it('should return 404 if user is not found', async () => {
      const res = await request(app)
        .post(`/reset/reset-password/999/${token}`)
        .send({ newPassword });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });

    it('should return 500 if there is an error resetting the password', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => ({ email: studentEmail, id: studentId }));
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => { throw new Error('Hashing error'); });

      const res = await request(app)
        .post(`/reset/reset-password/${studentId}/${token}`)
        .send({ newPassword });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message', 'Internal server error');
    });
  });
});
