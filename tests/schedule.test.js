const request = require('supertest');
const app = require('../app');
const Schedule = require('../models/scheduleModel');
const Teacher = require('../models/teacherModel');

describe('Schedule API', () => {

    let teacherId;

    
    beforeAll(async () => {
        const teacher = await Teacher.create({
            firstname: 'John',
            lastname: 'Doe',
            email: 'johndoe@example.com',
            password: 'password'
        });
        teacherId = teacher.teacherid;
    });1


    afterAll(async () => {
        await Schedule.destroy({ where: { teacherid: teacherId } });
        await Teacher.destroy({ where: { teacherid: teacherId } });
    });

    it("Should create a new schedule", async () => {
        const response = await request(app)
            .post('/schedule/create')
            .send({
                start_time: "14:00",
                end_time: "15:00",
                teacherid: teacherId,
                dayofweek: 1 
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('scheduleid');
        expect(response.body).toHaveProperty('teacherid', teacherId);
        expect(response.body).toHaveProperty('start_time', '14:00:00');  
        expect(response.body).toHaveProperty('end_time', '15:00:00');
    });

    it("Should get all schedules", async () => {
        const response = await request(app)
            .get('/schedule/all');
        
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it("Should get a specific teacher's schedule", async () => {
        const response = await request(app)
            .get(`/schedule/teacher/${teacherId}`);
        
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('teacherid', teacherId);
    });

    it("Should prevent scheduling conflicts", async () => {
   
        const response = await request(app)
            .post('/schedule/create')
            .send({
                start_time: "14:00",
                end_time: "15:00",
                teacherid: teacherId,
                dayofweek: 1 
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Schedule conflict: this time slot is already taken.');
    });

    it("Should update a schedule", async () => {
        const schedule = await Schedule.findOne({ where: { teacherid: teacherId, start_time: '14:00:00', dayofweek: 1 } });

        const response = await request(app)
            .put(`/schedule/update/${schedule.scheduleid}`)
            .send({
                start_time: "15:00",
                end_time: "16:00",
                teacherid: teacherId,
                dayofweek: 1
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('start_time', '15:00');
        expect(response.body).toHaveProperty('end_time', '16:00');
    });

    it("Should delete a schedule", async () => {
        const schedule = await Schedule.findOne({ where: { teacherid: teacherId, start_time: '15:00', dayofweek: 1 } });

        const response = await request(app)
            .delete(`/schedule/delete/${schedule.scheduleid}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Schedule deleted successfully');
    });

});
