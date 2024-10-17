const Teacher = require('../models/teacherModel');
const Subject = require('../models/subjectModel');
const ExamQuestion = require('../models/examQuestionModel');
const Exam = require('../models/examModel');
const Choice = require('../models/examChoicesModel');
const sequelize = require('../config/database');



const createExamWithQuestions = async (req, res) => {
    try {
        const { exam_name, reservationid, teacherid, subject_name, questions } = req.body;

        const teacher = await Teacher.findByPk(teacherid);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const subject = await Subject.findOne({ where: { subjectname: subject_name } });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        const exam = await Exam.create({
            teacher_id: teacherid,
            exam_name,
            subject_id: subject.subjectid, 
            reservation_id: reservationid,
        });


        for (const questionData of questions) {
            const { question, options, correctOption } = questionData;


            const newQuestion = await ExamQuestion.create({
                exam_id: exam.exam_id,
                question_text: question,
            });


            for (let i = 0; i < options.length; i++) {
                await Choice.create({
                    question_id: newQuestion.question_id,
                    choice_text: options[i],
                    is_correct: i === correctOption,  
                });
            }
        }


        return res.status(201).json({
            message: 'Exam, questions, and choices created successfully',
            exam_id: exam.exam_id,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Internal server error',
            error: err.message,
        });
    }
};

const deleteExam = async (req, res) => {
    try {
        const { exam_id } = req.body;
        const exam = await Exam.findByPk(exam_id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        await Exam.destroy({
            where: { exam_id },
        });
        return res.status(200).json({ message: 'Exam deleted successfully' });
    }catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Internal server error',
            error: err.message,
        });
    }};
const getExamsByTeacherId = async (req, res) => {
    try {
        const { teacher_id } = req.params;
        const exams = await Exam.findAll({
            where: { teacher_id },
        });
        return res.status(200).json(exams);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Internal server error',
            error: err.message,
        });
    }
};

const getExamsByStudentId = async (req, res) => {
    try {
        const { student_id } = req.params;

        const query = `
            SELECT e.exam_id, e.exam_name, t.firstname AS teacher_firstname, t.lastname AS teacher_lastname, 
                   s.subjectname, q.question_id, q.question_text, c.choice_id, c.choice_text, c.is_correct
            FROM reservations r
            JOIN exams e ON r.id = e.reservation_id
            JOIN teachers t ON e.teacher_id = t.teacherid
            JOIN subjects s ON e.subject_id = s.subjectid
            JOIN questions q ON e.exam_id = q.exam_id
            JOIN choices c ON q.question_id = c.question_id
            WHERE r.student_id = :student_id
            ORDER BY e.exam_id, q.question_id, c.choice_id;
        `;

        const exams = await sequelize.query(query, {
            replacements: { student_id }, 
            type: sequelize.QueryTypes.SELECT
        });

        if (!exams.length) {
            return res.status(404).json({ message: 'No exams found for this student' });
        }

  
        const formattedExams = {};
        exams.forEach(exam => {
            if (!formattedExams[exam.exam_id]) {
                formattedExams[exam.exam_id] = {
                    exam_id: exam.exam_id,
                    exam_name: exam.exam_name,
                    teacher: {
                        firstname: exam.teacher_firstname,
                        lastname: exam.teacher_lastname,
                    },
                    subject: exam.subjectname,
                    questions: {},
                };
            }

            if (!formattedExams[exam.exam_id].questions[exam.question_id]) {
                formattedExams[exam.exam_id].questions[exam.question_id] = {
                    question_id: exam.question_id,
                    question_text: exam.question_text,
                    choices: [],
                };
            }

            formattedExams[exam.exam_id].questions[exam.question_id].choices.push({
                choice_id: exam.choice_id,
                choice_text: exam.choice_text,
                is_correct: exam.is_correct,
            });
        });

 
        const result = Object.values(formattedExams).map(exam => {
            return {
                ...exam,
                questions: Object.values(exam.questions)
            };
        });

        return res.status(200).json(result);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Internal server error',
            error: err.message,
        });
    }
};

const getExamsById = async (req, res) => {
    try {
        const { exam_id } = req.params;

        const query = `
            SELECT e.exam_id, e.exam_name, t.firstname AS teacher_firstname, t.lastname AS teacher_lastname, 
                   s.subjectname, q.question_id, q.question_text, c.choice_id, c.choice_text, c.is_correct
            FROM exams e
            JOIN teachers t ON e.teacher_id = t.teacherid
            JOIN subjects s ON e.subject_id = s.subjectid
            JOIN questions q ON e.exam_id = q.exam_id
            JOIN choices c ON q.question_id = c.question_id
            WHERE e.exam_id = :exam_id
            ORDER BY q.question_id, c.choice_id;
        `;

        const exams = await sequelize.query(query, {
            replacements: { exam_id }, 
            type: sequelize.QueryTypes.SELECT
        });

        if (!exams.length) {
            return res.status(404).json({ message: 'No exam found with this ID' });
        }

        const formattedExams = {};
        exams.forEach(exam => {
            if (!formattedExams[exam.exam_id]) {
                formattedExams[exam.exam_id] = {
                    exam_id: exam.exam_id,
                    exam_name: exam.exam_name,
                    teacher: {
                        firstname: exam.teacher_firstname,
                        lastname: exam.teacher_lastname,
                    },
                    subject: exam.subjectname,
                    questions: {},
                };
            }

            if (!formattedExams[exam.exam_id].questions[exam.question_id]) {
                formattedExams[exam.exam_id].questions[exam.question_id] = {
                    question_id: exam.question_id,
                    question_text: exam.question_text,
                    choices: [],
                };
            }

            formattedExams[exam.exam_id].questions[exam.question_id].choices.push({
                choice_id: exam.choice_id,
                choice_text: exam.choice_text,
                is_correct: exam.is_correct,
            });
        });


        const result = Object.values(formattedExams).map(exam => {
            return {
                ...exam,
                questions: Object.values(exam.questions)
            };
        });

        return res.status(200).json(result);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Internal server error',
            error: err.message,
        });
    }
};


module.exports = {
    createExamWithQuestions,
    deleteExam,
    getExamsByTeacherId,
    getExamsByStudentId,
    getExamsById,
  };

