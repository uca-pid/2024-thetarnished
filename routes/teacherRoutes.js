const express = require('express');
const {
    getTeacherById, 
    updateTeacher, 
    deleteTeacher, 
    assignSubjectToTeacher, 
    removeSubjectFromTeacher, 
    getAllTeachersDictatingASubjectById, 
    getAllTeachers, 
    getTeacherRating,
    updateTeacherRating,
    updateTeacherSubjects,
    createTeacherComment,
    getTeacherComments} = require('../controllers/teacherController');

const router = express.Router();

const authorizeRoles = require('../middleware/authMiddleware');

router.get('/all-dictating/:subjectid', authorizeRoles('STUDENT'), getAllTeachersDictatingASubjectById);
router.get('/all-teachers', getAllTeachers);
router.get('/:id', authorizeRoles('TEACHER', 'STUDENT', 'ADMIN'), getTeacherById);
router.put('/update/:id', authorizeRoles('TEACHER'), updateTeacher);
router.delete('/delete/:id', authorizeRoles('TEACHER', 'ADMIN'), deleteTeacher);
router.post('/assign-subject/:teacherid', authorizeRoles('ADMIN', 'TEACHER'), assignSubjectToTeacher);
router.delete('/remove-subject/:teacherid/', authorizeRoles('ADMIN', 'TEACHER'), removeSubjectFromTeacher);
router.put('/update-subjects/:id', updateTeacherSubjects);
router.get('/get-rating/:teacher_id', authorizeRoles('TEACHER', 'STUDENT'), getTeacherRating);
router.put('/update-rating/:teacher_id', authorizeRoles('TEACHER', 'STUDENT'), updateTeacherRating);
router.get('/get-comments/:teacher_id', authorizeRoles('TEACHER', 'STUDENT'), getTeacherComments);
router.post('/add-comment/:teacher_id', authorizeRoles('TEACHER', 'STUDENT'), createTeacherComment);

module.exports = router;