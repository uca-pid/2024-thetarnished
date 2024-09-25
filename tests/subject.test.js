const request = require('supertest');
const app = require('../app');
const Subject = require('../models/subjectModel');
const Teacher = require('../models/teacherModel');
const SubjectTeacher = require('../models/subjectTeacherModel');
const Schedule = require('../models/weeklyScheduleModel');

describe('Subject API', () => {

    let subject1;
    let subject2;
    let teacher;
    const teacherEmail = "johndoerito15@example.com";
    const subject1name = "Philosophy and Discourse VII";
    const subject2name = "Introduction to Computer Science VIII";
    beforeAll(async () => {
        subject1 = await Subject.create({ subjectname: subject1name });
        subject2 = await Subject.create({ subjectname: subject2name });
        teacher = await Teacher.create({
            firstname: "John",
            lastname: "Doe",
            email: teacherEmail,
            password: "password",
            role: "TEACHER",
        });
    });
    
    afterAll(async () => {
        await SubjectTeacher.destroy({ where: { teacherid: teacher.teacherid } });
        await Subject.destroy({ where: { subjectname: subject1name }});
        await Subject.destroy({ where: { subjectname: subject2name }});
        await Teacher.destroy({ where: { email: teacherEmail } });
    });

    it("Should get all subjects", async () => {
        const response = await request(app)
            .get('/subject/all-subjects');

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it("Should get subject by id", async () => {
        const response = await request(app)
        .get(`/subject/${subject1.subjectid}`);	
        expect(response.status).toBe(200);
    });

    it("Should create a subject", async () => {
        const response = await request(app)
        .post('/subject/create')
        .send({ subjectname: "Modern Quantum Mechanics" });
        
        expect(response.status).toBe(200);
        await Subject.destroy({ where: { subjectname: "Modern Quantum Mechanics" } });
    });

    it("Should not create a subject if it already exists", async () => {
        const response = await request(app)
            .post('/subject/create')
            .send({
                subjectname: subject1name
            });
        expect(response.status).toBe(400);
    });

    it("Should get all subjects being dictated by teachers", async () => {
        await request(app)
        .post(`/teachers/assign-subject/${teacher.teacherid}`).send(
            {
                subjectid: subject1.subjectid,
            }
        )

        await Schedule.create({
            teacherid: teacher.teacherid,
            start_time: "08:00",
            end_time: "09:00",
            dayofweek: 3,
        })

        const response = await request(app)
            .get('/subject/all-subjects-dictated');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Subjects retrieved successfully");
        expect(response.body.results.length).toBeGreaterThanOrEqual(1);
    });
});