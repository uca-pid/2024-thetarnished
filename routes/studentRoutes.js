const express = require('express');
const {getStudentById,createStudentComment, updateStudent, deleteStudent, getPreviousTeachers, getStudentRating, updateStudentRating, getStudentComments, getUnratedClasses} = require('../controllers/studentController');
const app = express();
const authorizeRoles = require('../middleware/authMiddleware');

app.use(express.json()); 



const router = express.Router();

router.get('/:id', authorizeRoles('STUDENT', 'TEACHER', 'ADMIN'), getStudentById);
router.put('/update/:id', authorizeRoles('STUDENT', 'ADMIN'), updateStudent);
router.delete('/delete/:id', authorizeRoles('STUDENT', 'ADMIN'), deleteStudent);
router.get('/get-previous/:id/:subjectid', authorizeRoles('STUDENT'), getPreviousTeachers);
router.get('/get-rating/:student_id', authorizeRoles('TEACHER', 'STUDENT'), getStudentRating);
router.put('/update-rating/:student_id', authorizeRoles('TEACHER', 'STUDENT'), updateStudentRating);
router.get('/get-comments/:student_id', authorizeRoles('TEACHER', 'STUDENT'), getStudentComments);
router.post('/add-comment/:student_id', authorizeRoles('TEACHER', 'STUDENT'), createStudentComment);
router.get('/get-unrated-classes/:student_id', authorizeRoles('STUDENT'), getUnratedClasses);

module.exports = router;