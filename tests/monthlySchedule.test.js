const request = require('supertest');
const app = require('../app');
const Monthlyschedule = require('../models/monthlyScheduleModel');
const Teacher = require('../models/teacherModel');
const Schedule = require('../models/weeklyScheduleModel');

jest.setTimeout(10000);

describe('Test the /group-classes endpoint with real database', () => {
    
    let teacher;
    let teacherID;
    let weeklyIndividualSchedule;
    let weeklyIndividualScheduleID;
    let monthlyIndividualSchedule;
    let monthlyIndividualScheduleID;
    let weeklyGroupSchedule;
    let weeklyGroupScheduleID;
    let monthlyGroupSchedule;
    let monthlyGroupScheduleID;

    beforeAll(async () => {
        teacher = await Teacher.create({ 
            firstname: 'Ayrton',
            lastname: 'Senna',
            email: 'asenna@gmail.com', 
            password: 'password'
        });
        teacherID = teacher.teacherid;
        console.log("TeacherID:", teacherID);
        weeklyIndividualSchedule = await Schedule.create({
            start_time: '09:00:00',
            end_time: '10:00:00',
            teacherid: teacherID,
            dayofweek: 1,
            maxstudents: 1
        });
        weeklyIndividualScheduleID = weeklyIndividualSchedule.weeklyscheduleid;
        console.log("weeklyIndividualScheduleId:", weeklyIndividualScheduleID);
        monthlyIndividualSchedule = await Monthlyschedule.create({
            datetime: '2023-04-01 09:00:00',
            teacherid: teacherID,
            maxstudents: 1,
            currentstudents: 0,
            weeklyscheduleid: weeklyIndividualScheduleID
        });
        monthlyIndividualScheduleID = monthlyIndividualSchedule.monthlyscheduleid;
        console.log("monthlyIndividualScheduleId:", monthlyIndividualScheduleID);
        weeklyGroupSchedule = await Schedule.create({
            start_time: '09:00:00',
            end_time: '10:00:00',
            teacherid: teacherID,
            dayofweek: 1,
            maxstudents: 5
        });
        weeklyGroupScheduleID = weeklyGroupSchedule.weeklyscheduleid;
        console.log("weeklyGroupScheduleId:", weeklyGroupScheduleID);
        monthlyGroupSchedule = await Monthlyschedule.create({
            datetime: '2023-04-02 09:00:00',
            teacherid: teacherID,
            maxstudents: 5,
            currentstudents: 0,
            weeklyscheduleid: weeklyGroupScheduleID
        });
        monthlyGroupScheduleID = monthlyGroupSchedule.monthlyscheduleid;
        console.log("monthlyIndividualScheduleId:", monthlyGroupScheduleID);
    });    

    afterAll(async () => {
        await Monthlyschedule.destroy({ where: {monthlyscheduleid: monthlyGroupScheduleID} });
        await Monthlyschedule.destroy({ where: {monthlyscheduleid: monthlyIndividualScheduleID} });
        await Schedule.destroy({ where: {weeklyscheduleid: weeklyGroupScheduleID} });
        await Schedule.destroy({ where: {weeklyscheduleid: weeklyIndividualScheduleID} });
        await Teacher.destroy({ where: {teacherid: teacherID} });
    });
    
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('Should return group classes when they are available for booking', async () => {
        const res = await request(app).get('/classes/group-classes');

        console.log(res.body);
        expect(res.statusCode).toBe(200);
        if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('maxstudents', "5");
        }
    });

    it('Should return individual classes when they are available for booking', async () => {
        const res = await request(app).get('/classes/individual-classes');

        expect(res.statusCode).toBe(200);
        if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('maxstudents', "1");
        }
    });

    it('Should return 404 when no group classes are found', async () => {
        jest.spyOn(Monthlyschedule, 'findAll').mockResolvedValue([]);

        const res = await request(app).get('/classes/group-classes');

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('No group classes found');
    });

    it('should return 404 when no individual classes are found', async () => {
        jest.spyOn(Monthlyschedule, 'findAll').mockResolvedValue([]);

        const res = await request(app).get('/classes/individual-classes');

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('No individual classes found');
    });

    it('should return 500 on server error for group classes', async () => {
        jest.spyOn(Monthlyschedule, 'findAll').mockRejectedValue(new Error('Database error'));

        const res = await request(app).get('/classes/group-classes');

        expect(res.statusCode).toBe(500);
        expect(res.text).toBe('Server error');
    });

    it('should return 500 on server error for individual classes', async () => {
        jest.spyOn(Monthlyschedule, 'findAll').mockRejectedValue(new Error('Database error'));

        const res = await request(app).get('/classes/individual-classes');

        expect(res.statusCode).toBe(500);
        expect(res.text).toBe('Server error');
    });
});