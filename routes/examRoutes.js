const express = require('express');
const {
    createExamWithQuestions,
    deleteExam,
    getExamsByTeacherId,
    getExamsByStudentId,
} = require('../controllers/examController');

const router = express.Router();

router.post('/create-exam', createExamWithQuestions);
router.delete('/delete-exam', deleteExam);
router.get('/get-teacher-exams-by/:teacher_id', getExamsByTeacherId);
router.get('/get-student-exams-by/:student_id', getExamsByStudentId);


module.exports = router;