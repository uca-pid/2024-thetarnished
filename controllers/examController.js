const Teacher = require('../models/teacherModel');
const Student = require('../models/studentModel');
const Subject = require('../models/subjectModel');
const ExamQuestion = require('../models/examQuestionModel');

const createExamQuestion = async (req, res) => {
    try {
        const { teacher_id, subject_id, question, answer } = req.body;
        const teacher = await Teacher.findByPk(teacher_id);
        if(!teacher) {
            return res.status(404).json({
                message: 'Teacher not found'
            });
        }
        const subject = await Subject.findByPk(subject_id);
        if(!subject) {
            return res.status(404).json({
                message: 'Subject not found'
            });
        }
        const Question = await ExamQuestion.create({
            teacher_id,
            subject_id,
            question,
            answer
        });
        return res.status(201).json({
            message: 'Exam question created successfully',
            exam
        });
    } catch(err) {
        console.log(err);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}