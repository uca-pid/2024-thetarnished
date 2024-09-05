const express = require('express');
const {getTeacherById, updateTeacher, deleteTeacher, assignSubjectToTeacher, removeSubjectFromTeacher, getAllTeachersDictatingASubjectById, getAllTeachers} = require('../controllers/teacherController');

const router = express.Router();

router.get('/all-dictating/:subjectid', getAllTeachersDictatingASubjectById);
router.get('/all-teachers', getAllTeachers);
router.get('/:id', getTeacherById);
router.put('/update/:id', updateTeacher);
router.delete('/delete/:id', deleteTeacher);
router.post('/assign-subject/:teacherid', assignSubjectToTeacher);
router.delete('/remove-subject/:teacherid/', removeSubjectFromTeacher);


module.exports = router;