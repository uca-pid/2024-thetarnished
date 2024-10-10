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

const authorizeRoles = require('../middleware/authMiddleware');

router.get('/all-dictating/:subjectid', authorizeRoles('ADMIN', 'TEACHER', 'STUDENT'), getAllTeachersDictatingASubjectById);
router.get('/all-teachers', authorizeRoles('ADMIN', 'TEACHER', 'STUDENT'), getAllTeachers);
router.get('/:id', authorizeRoles('ADMIN', 'TEACHER', 'STUDENT'), getTeacherById);
router.put('/update/:id', authorizeRoles('TEACHER'), updateTeacher);
router.delete('/delete/:id', authorizeRoles('TEACHER'), deleteTeacher);
router.post('/assign-subject/:teacherid', authorizeRoles('ADMIN', 'TEACHER'), assignSubjectToTeacher);
router.delete('/remove-subject/:teacherid/', authorizeRoles('ADMIN', 'TEACHER'), removeSubjectFromTeacher);
router.put('/update-subjects/:id', updateTeacherSubjects);

module.exports = router;