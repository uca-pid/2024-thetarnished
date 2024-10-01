const request = require('supertest');
const app = require('../app');
const Admin = require('../models/adminModel');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherModel');

describe('Admin API', () => {

    let admin;
    let adminID;
    let adminHashedPassword;
    let teacherHashedPassword;
    let teacher;
    let teacherID;
    const adminName = 'Charles';
    const adminLastname = 'Leclerc';
    const adminEmail = 'linkandlearnadmin@gmail.com';
    const password = 'password';
    const teacherFirstName = 'Carlos';
    const teacherLastName = 'Sainz';
    const teacherEmail = 'carlossainz@gmail.com';
    const teacherPassword = 'password';

    beforeAll(async () => {
        adminHashedPassword = await bcrypt.hash(password, 10);
        teacherHashedPassword = await bcrypt.hash(teacherPassword, 10);
        admin = await Admin.create({ firstname: adminName, lastname: adminLastname, email: adminEmail, password: adminHashedPassword });
        adminID = admin.adminid;
        teacher = await Teacher.create({ firstname: teacherFirstName, lastname: teacherLastName, email: teacherEmail, password: teacherHashedPassword });
        teacherID = teacher.teacherid;
    });

    beforeEach(() => {
        teacher.is_active = false;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await Admin.destroy({ where: { adminid: adminID } });
        await Teacher.destroy({ where: { teacherid: teacherID } });
    });
    
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    it('Should allow an admin to login if proper credentials are provided', async () => {
        const response = await request(app)
            .post('/authentication/login')
            .send({ email: adminEmail, password: password });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.user.role).toBe('ADMIN');
    });

    it('Should not allow an admin to login if improper password is provided', async () => {
        const wrongPassword = 'wrongpassword';
        const response = await request(app)
            .post('/authentication/login')
            .send({ email: adminEmail, password: wrongPassword });
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid password');
    });

    it('Should not allow an admin to login if improper email is provided', async () => {
        const wrongEmail = 'wrongemail@gmail.com';
        const response = await request(app)
            .post('/authentication/login')
            .send({ email: wrongEmail, password: password });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    it('Should allow an admin to activate a teacher if a valid teacher id is provided', async () => {
        expect(teacher.is_active).toBe(false);

        const response = await request(app)
            .post(`/admins/activate-teacher/${teacherID}`);
        
        const allowedTeacher = await Teacher.findByPk(teacherID);

        expect(allowedTeacher.is_active).toBe(true);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Teacher activated successfully');
    });

    it('Should not allow an admin to activate a teacher if an invalid teacher id is provided', async () => {
        expect(teacher.is_active).toBe(false);
        const response = await request(app)
            .post(`/admins/activate-teacher/112358`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Teacher not found');
    });

    it('Should return 500 when an error occurs activating a teacher account', async () => {
        
        jest.spyOn(Teacher, 'findByPk').mockRejectedValue(new Error('Server error'));

        const response = await request(app).post(`/admins/activate-teacher/112358`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Server error');
    });

    it('Should allow an admin to disable a teacher if a valid teacher id is provided', async () => {
        const newTeacher = await Teacher.create({ firstname: 'Esteban', lastname: 'Ocon', email: 'estebanocon@gmail.com', password: teacherHashedPassword, is_active: true });
        const newTeacherID = newTeacher.teacherid;

        const response = await request(app).post(`/admins/disable-teacher/${newTeacherID}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Teacher disabled successfully');

        const disabledTeacher = await Teacher.findByPk(newTeacherID);
        expect(disabledTeacher.is_active).toBe(false);

        await Teacher.destroy({ where: { teacherid: newTeacherID } });
    });

    it('Should not allow an admin to disable a teacher if an invalid teacher id is provided', async () => {
        const response = await request(app)
            .post(`/admins/disable-teacher/112358`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Teacher not found');
    });

    it('Should return 500 when an error occurs activating a teacher account', async () => {
        
        jest.spyOn(Teacher, 'findByPk').mockRejectedValue(new Error('Server error'));

        const response = await request(app).post(`/admins/disable-teacher/112358`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Server error');
    });

    it('Should allow an admin to retrieve all inactive teachers', async () => {
        
        const firstInactiveTeacher = await Teacher.create({ firstname: 'Pierre', lastname: 'Gasly', email: 'pierregasly@gmail.com', password: teacherHashedPassword, is_active: false });
        delay(1000);
        const firstInactiveTeacherID = firstInactiveTeacher.teacherid;
        const secondInactiveTeacher = await Teacher.create({ firstname: 'Valtieri', lastname: 'Bottas', email: 'valtieribottas@gmail.com', password: teacherHashedPassword, is_active: false });
        const secondInactiveTeacherID = secondInactiveTeacher.teacherid;
        const response = await request(app).get('/admins/inactive-teachers');
        
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].is_active).toBe(false);
        await Teacher.destroy({ where: { teacherid: firstInactiveTeacherID } });
        await Teacher.destroy({ where: { teacherid: secondInactiveTeacherID } });
    });

    it('Should return 404 when no inactive teachers are found', async () => {
        
        jest.spyOn(Teacher, 'findAll').mockResolvedValue([]);
        
        const response = await request(app).get('/admins/inactive-teachers');

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('No inactive teachers found');
    });

    it('Should return 500 when an error occurs retrieving inactive teachers', async () => {
        
        jest.spyOn(Teacher, 'findAll').mockRejectedValue(new Error('Server error'));
        
        const response = await request(app).get('/admins/inactive-teachers');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Server error');
    });
});