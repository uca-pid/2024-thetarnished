const express = require('express');
const {getAllSubjects, getSubjectById, createSubject, getAllSubjectsDictatedByTeachers} = require('../controllers/subjectController');
const app = express();
app.use(express.json()); 

const router = express.Router();

router.get('/all-subjects-dictated', getAllSubjectsDictatedByTeachers);
router.get('/all-subjects', getAllSubjects);
router.get('/:id', getSubjectById);
router.post('/create', createSubject);

module.exports = router;