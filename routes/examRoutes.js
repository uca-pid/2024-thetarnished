const express = require('express');
const {
    createExamWithQuestions,
    deleteExam,
    getExamsByTeacherId,
    getExamsByStudentId,
    getExamsById,
} = require('../controllers/examController');

const router = express.Router();

router.post('/create-exam', createExamWithQuestions);
router.delete('/delete-exam', deleteExam);
router.get('/get-teacher-exams-by/:teacher_id', getExamsByTeacherId);
router.get('/get-student-exams-by/:student_id', getExamsByStudentId);
router.get('/get-exams-by/:exam_id', getExamsById)


module.exports = router;