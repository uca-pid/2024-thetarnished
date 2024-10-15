const request = require('supertest');
const app = require('../app'); 
const sequelize = require('../config/database');
const Exam = require('../models/examModel'); 
const Teacher = require('../models/teacherModel');
const Subject = require('../models/subjectModel');
const ExamQuestion = require('../models/examQuestionModel');
const Choice = require('../models/examChoicesModel');
const Reservation = require('../models/reservationModel');



jest.setTimeout(20000);

let teacher, subject, exam, reservation;

describe('Exam API Tests', () => {
    
    beforeAll(async () => {

        teacher = await Teacher.create({ 
            firstname: 'John',
            lastname: 'Doe',
            email: 'john.doe@example.com',
            password: 'password'
        });

        subject = await Subject.create({ 
            subjectname: 'Math' 
        });
    });

    afterAll(async () => {

        await Choice.destroy({ where: {} });
        await ExamQuestion.destroy({ where: {} });
        await Exam.destroy({ where: {} });
        await Reservation.destroy({ where: {} });
        await Subject.destroy({ where: { subjectid: subject.subjectid } });
        await Teacher.destroy({ where: { teacherid: teacher.teacherid } });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('Should create an exam with questions and choices', async () => {

        reservation = await Reservation.create({
            id: 1,
            student_id: 1,
        });

        const examData = {
            exam_name: 'Math Exam',
            reservationid: reservation.id,
            teacherid: teacher.teacherid,
            subject_name: 'Math',
            questions: [
                {
                    question: 'What is 2+2?',
                    options: ['1', '2', '3', '4'],
                    correctOption: 3
                }
            ]
        };

        const res = await request(app)
            .post('/exams/create')
            .send(examData);

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Exam, questions, and choices created successfully');
        expect(res.body.exam_id).toBeDefined();
        

        exam = await Exam.findOne({ where: { exam_id: res.body.exam_id } });
    });

    it('Should return 404 if teacher is not found', async () => {
        const res = await request(app)
            .post('/exams/create')
            .send({
                exam_name: 'Science Exam',
                reservationid: 1,
                teacherid: 999, 
                subject_name: 'Science',
                questions: []
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Teacher not found');
    });

    it('Should delete an existing exam', async () => {
        const res = await request(app)
            .delete('/exams/delete')
            .send({ exam_id: exam.exam_id });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Exam deleted successfully');


        const deletedExam = await Exam.findByPk(exam.exam_id);
        expect(deletedExam).toBeNull();
    });

    it('Should return 404 if exam is not found for deletion', async () => {
        const res = await request(app)
            .delete('/exams/delete')
            .send({ exam_id: 999 }); 

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Exam not found');
    });

    it('Should retrieve exams by teacher ID', async () => {

        const newExam = await Exam.create({
            teacher_id: teacher.teacherid,
            subject_id: subject.subjectid,
            exam_name: 'Math Exam 2',
            reservation_id: 1
        });

        const res = await request(app).get(`/exams/teacher/${teacher.teacherid}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        

        await newExam.destroy();
    });

    it('Should retrieve exams by student ID', async () => {

        const newReservation = await Reservation.create({
            id: 2,
            student_id: 2,
        });

        const newExam = await Exam.create({
            teacher_id: teacher.teacherid,
            subject_id: subject.subjectid,
            exam_name: 'Math Exam 3',
            reservation_id: newReservation.id
        });

        const res = await request(app).get(`/exams/student/2`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        // Clean up
        await newExam.destroy();
        await newReservation.destroy();
    });

    it('Should return 404 if no exams are found for the student', async () => {
        const res = await request(app).get(`/exams/student/999`); 
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('No exams found for this student');
    });

    it('Should retrieve a specific exam by ID', async () => {
        const res = await request(app).get(`/exams/${exam.exam_id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.exam_id).toBe(exam.exam_id);
    });

    it('Should return 404 if exam is not found by ID', async () => {
        const res = await request(app).get(`/exams/999`); 
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Exam not found');
    });

    it('Should return 500 if there is a server error', async () => {
        jest.spyOn(Exam, 'findAll').mockRejectedValue(new Error('Database error'));
        
        const res = await request(app).get(`/exams/teacher/${teacher.teacherid}`);
        expect(res.statusCode).toBe(500);
        expect(res.text).toBe('Internal server error');
    });
});
