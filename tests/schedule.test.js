const request = require('supertest');
const app = require('../app');
const Teacher = require('../models/teacherModel');
const Schedule = require('../models/weeklyScheduleModel');
const jwt = require('jsonwebtoken');

describe('Schedule Controller Tests', () => {
    let teacherId;
    let teacherToken;
    jest.setTimeout(20000);
    beforeAll(async () => {
        const teacher = await Teacher.create(
            { firstname: 'John', lastname: 'Doe', email: 'john.doe173@example.com', password: 'password', is_active: true });
          teacherId = teacher.teacherid;
        teacherToken = jwt.sign({ teacherId: teacher.teacherId, role: 'TEACHER' }, process.env.JWT_AUTH_SECRET, { expiresIn: '1h' });
    });

    afterAll(async () => {
        await Schedule.destroy({ where: { teacherid: teacherId } });
        await Teacher.destroy({ where: { teacherid: teacherId } });
    });

    it('Should create a new schedule', async () => {
        const res = await request(app)
        .post(`/schedule/create/${teacherId}`)
        .send({
            schedule:[
                { start_time: '09:00:00', end_time: '10:00:00', dayofweek: 1 }
            ]
        })
        .set('Authorization', `Bearer ${teacherToken}`);

        expect(res.status).toBe(201);
    });

    it('Should update a teacher schedule when it already exists', async () => {
        await request(app)
          .post(`/schedule/create/${teacherId}`)
          .send({
            schedule: [
              { start_time: '10:00', end_time: '11:00', dayofweek: 1 }
            ]
          })
          .set('Authorization', `Bearer ${teacherToken}`);

          const res = await request(app)
          .post(`/schedule/create/${teacherId}`)
          .send({
            schedule: [
              { start_time: '12:00', end_time: '13:00', dayofweek: 1 }
            ]
          })
          .set('Authorization', `Bearer ${teacherToken}`);

        expect(res.status).toBe(201);
      });

    it('should return 500 when there is a database error', async () => {
        jest.spyOn(Schedule, 'create').mockImplementationOnce(() => {
          throw new Error('Database error');
        });
    
        const res = await request(app)
          .post(`/schedule/create/1`)
          .send({
            schedule: [
              { start_time: '10:00', end_time: '11:00', dayofweek: 1 }
            ]
          })
          .set('Authorization', `Bearer ${teacherToken}`);
    
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('message', 'Error creating schedules');
        expect(res.body).toHaveProperty('error');
      });

    it('Should fetch all schedules', async () => {
        const res = await request(app).get('/schedule/all')
        .set('Authorization', `Bearer ${teacherToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
    
    it('Should return 500 when there is a database error in getAllSchedules', async () => {
        jest.spyOn(Schedule, 'findAll').mockImplementationOnce(() => {
            throw new Error('Database error');
        });
    
        const res = await request(app).get('/schedule/all')
        .set('Authorization', `Bearer ${teacherToken}`);

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('message', 'Error fetching schedules');
    });

    it('Should return schedules for a teacher', async () => {
        const res = await request(app).get(`/schedule/teacher/${teacherId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });
    
    it('Should return 404 if no schedules found for a teacher', async () => {
        const res = await request(app).get('/schedule/teacher/999')
        .set('Authorization', `Bearer ${teacherToken}`);
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'No schedules found for this teacher.');
    });
    
    it('should return 500 when there is a database error in getScheduleByTeacher', async () => {
        jest.spyOn(Schedule, 'findAll').mockImplementationOnce(() => {
            throw new Error('Database error');
        });
    
        const res = await request(app).get(`/schedule/teacher/${teacherId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('message', 'Error retrieving schedules');
    });

    it("Shouldn't allow a teacher to create a schedule if its account isn't active", async () => {
        const inactiveTeacher = await Teacher.create(
            { firstname: 'Kevin', lastname: 'Magnussen', email: 'kevinmagnussen@gmail.com', password: 'password'});
        const inactiveTeacherId = inactiveTeacher.teacherid;

        const inactiveTeacherToken = jwt.sign({ teacherId: inactiveTeacherId, role: 'TEACHER' }, process.env.JWT_AUTH_SECRET, { expiresIn: '1h' });
        const response = await request(app).post(`/schedule/create/${inactiveTeacherId}`).send({
            schedule: [
                { start_time: '09:00:00', end_time: '10:00:00', dayofweek: 1 }
            ]
        })
        .set('Authorization', `Bearer ${inactiveTeacherToken}`);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Teacher is not active');

        await Teacher.destroy({ where: { teacherid: inactiveTeacherId } });
      
    });

});