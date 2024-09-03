const express = require('express');
const {createTeacher, getTeacherById, updateTeacher, deleteTeacher, assignSubjectToTeacher} = require('../controllers/teacherController');

const router = express.Router();

router.post('/register', createTeacher);
router.get('/:id', getTeacherById);
router.put('/update/:id', updateTeacher);
router.delete('/delete/:id', deleteTeacher);
router.post('/assign-subject/:teacherid', assignSubjectToTeacher);


module.exports = router;