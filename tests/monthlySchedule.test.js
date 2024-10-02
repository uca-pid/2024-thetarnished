const request = require('supertest');
const app = require('../app');
const Monthlyschedule = require('../models/monthlyScheduleModel');
const Teacher = require('../models/teacherModel');
const Schedule = require('../models/weeklyScheduleModel');



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
    jest.setTimeout(20000);
    beforeAll(async () => {
        teacher = await Teacher.create({ 
            firstname: 'Ayrton',
            lastname: 'Senna',
            email: 'asenna@gmail.com', 
            password: 'password'
        });
        teacherID = teacher.teacherid;
        
        weeklyIndividualSchedule = await Schedule.create({
            start_time: '09:00:00',
            end_time: '10:00:00',
            teacherid: teacherID,
            dayofweek: 1,
            maxstudents: 1
        });
        weeklyIndividualScheduleID = weeklyIndividualSchedule.weeklyscheduleid;
        
        monthlyIndividualSchedule = await Monthlyschedule.create({
            datetime: '2023-04-01 09:00:00',
            teacherid: teacherID,
            maxstudents: 1,
            currentstudents: 0,
            
        });
        monthlyIndividualScheduleID = monthlyIndividualSchedule.monthlyscheduleid;
        
        weeklyGroupSchedule = await Schedule.create({
            start_time: '09:00:00',
            end_time: '10:00:00',
            teacherid: teacherID,
            dayofweek: 1,
            maxstudents: 5
        });
        weeklyGroupScheduleID = weeklyGroupSchedule.weeklyscheduleid;
        
        monthlyGroupSchedule = await Monthlyschedule.create({
            datetime: '2023-04-02 09:00:00',
            teacherid: teacherID,
            maxstudents: 5,
            currentstudents: 0,
            
        });
        monthlyGroupScheduleID = monthlyGroupSchedule.monthlyscheduleid;
        
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

   
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
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

    it('Should successfully assign vacation and mark schedules as taken', async () => {
        const vacationData = {
            teacherid: teacherID.toString(),
            startdate: '2024-10-01',
            enddate: '2024-10-10'
        };

        await Monthlyschedule.create({
            datetime: '2024-10-08 09:00:00',
            teacherid: teacherID,
            maxstudents: 5,
            currentstudents: 0,

        });
        
        await Monthlyschedule.create({
            datetime: '2024-10-07 09:00:00',
            teacherid: teacherID,
            maxstudents: 5,
            currentstudents: 0,

        });

        const res = await request(app).post('/classes/assign-vacation').send(vacationData);
    
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2); // Two schedules should be updated
        expect(res.body[0]).toHaveProperty('istaken', true);
        expect(res.body[1]).toHaveProperty('istaken', true);
    });

    it('Should return 404 if no schedules found in the date range', async () => {
        const vacationData = {
            teacherid: teacherID.toString(),
            startdate: '2024-11-01',
            enddate: '2024-11-10'
        };

        const res = await request(app).post('/classes/assign-vacation').send(vacationData);

        expect(res.statusCode).toBe(404);
        expect(res.text).toBe('Schedules not found');
    });


    it('Should handle a valid request but with no schedules to update', async () => {
        jest.spyOn(Monthlyschedule, 'findAll').mockResolvedValue([]);

        const vacationData = {
            teacherid: teacherID.toString(),
            startdate: '2024-10-01',
            enddate: '2024-10-10'
        };

        const res = await request(app).post('/classes/assign-vacation').send(vacationData);

        expect(res.statusCode).toBe(404);
        expect(res.text).toBe('Schedules not found');
    });


    it('Should return 500 if there is a server error', async () => {
        jest.spyOn(Monthlyschedule, 'findAll').mockRejectedValue(new Error('Database error'));

        const vacationData = {
            teacherid: teacherID.toString(),
            startdate: '2024-10-01',
            enddate: '2024-10-10'
        };

        const res = await request(app).post('/classes/assign-vacation').send(vacationData);

        expect(res.statusCode).toBe(500);
        expect(res.text).toBe('Server error');
    });

    it('Should return the formatted schedule when found', async () => {

        const mockSchedule = [
          {
            monthlyscheduleid: 1,
            teacherid: 1,
            datetime: new Date('2024-10-01T10:00:00Z'),
            istaken: false,
          },
        ];
        
        jest.spyOn(Monthlyschedule, 'findAll').mockResolvedValue(mockSchedule);
    
        const res = await request(app).get('/classes/get-monthly-schedule-by/1');
    
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
          {
            scheduleid: '1',
            start_time: '07:00:00',
            end_time: '08:00:00',
            teacherid: '1',
            dayofmonth: 1,
            dayofweek: 2,
          },
        ]);
      });

      it('Should return 404 if no schedule is found', async () => {

        jest.spyOn(Monthlyschedule, 'findAll').mockResolvedValue([]);
    
        const res = await request(app).get('/classes/get-monthly-schedule-by/1');
    
        expect(res.statusCode).toBe(404);
        expect(res.text).toBe('Monthly schedule not found');
      });

      it('Should return 500 on server error', async () => {

        jest.spyOn(Monthlyschedule, 'findAll').mockRejectedValue(new Error('Database error'));
    
        // Make a request to the endpoint using supertest
        const res = await request(app).get('/classes/get-monthly-schedule-by/1');
    
        expect(res.statusCode).toBe(500);
        expect(res.text).toBe('Server error');
      });

      it('should return the formatted schedule with Sunday as day 7', async () => {
        const mockSchedule = [
          {
            monthlyscheduleid: 1,
            teacherid: 1,
            datetime: new Date('2024-10-06T10:00:00Z'),
            istaken: false,
          },
        ];
    
        jest.spyOn(Monthlyschedule, 'findAll').mockResolvedValue(mockSchedule);
    
        const res = await request(app).get('/classes/get-monthly-schedule-by/1');
    
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
          {
            scheduleid: '1',
            start_time: '07:00:00',
            end_time: '08:00:00',
            teacherid: '1',
            dayofmonth: 6,
            dayofweek: 7,
          },
        ]);
      });
});