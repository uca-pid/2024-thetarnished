const express = require('express');
const { getAllSubjects, getSubjectById, createSubject, getAllSubjectsDictatedByTeachers } = require('../controllers/subjectController');
const authorizeRoles = require('../middleware/authMiddleware');
const app = express();

app.use(express.json()); 

const router = express.Router();

router.get('/all-subjects-dictated', getAllSubjectsDictatedByTeachers);
router.get('/all-subjects', authorizeRoles('ADMIN', 'TEACHER', 'STUDENT'), getAllSubjects);
router.get('/:id', authorizeRoles('ADMIN', 'TEACHER', 'STUDENT'), getSubjectById);
router.post('/create', authorizeRoles('ADMIN', 'TEACHER', 'STUDENT'), createSubject);

module.exports = router;