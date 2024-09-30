const express = require('express');
const {
    getTeacherById, 
    updateTeacher, 
    deleteTeacher, 
    assignSubjectToTeacher, 
    removeSubjectFromTeacher, 
    getAllTeachersDictatingASubjectById, 
    getAllTeachers, 
    updateTeacherSubjects} = require('../controllers/teacherController');

const router = express.Router();

router.get('/all-dictating/:subjectid', getAllTeachersDictatingASubjectById);
router.get('/all-teachers', getAllTeachers);
router.get('/:id', getTeacherById);
router.put('/update/:id', updateTeacher);
router.delete('/delete/:id', deleteTeacher);
router.post('/assign-subject/:teacherid', assignSubjectToTeacher);
router.delete('/remove-subject/:teacherid/', removeSubjectFromTeacher);
router.put('/update-subjects/:id', updateTeacherSubjects);

module.exports = router;