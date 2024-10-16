const express = require('express');
const { getAllSubjects, getSubjectById, createSubject, getAllSubjectsDictatedByTeachers } = require('../controllers/subjectController');
const authorizeRoles = require('../middleware/authMiddleware');
const app = express();

app.use(express.json()); 

const router = express.Router();

router.get('/all-subjects-dictated', authorizeRoles('STUDENT'), getAllSubjectsDictatedByTeachers);
router.get('/all-subjects', getAllSubjects);
router.get('/:id', getSubjectById);
router.post('/create', authorizeRoles('ADMIN'), createSubject);

module.exports = router;

