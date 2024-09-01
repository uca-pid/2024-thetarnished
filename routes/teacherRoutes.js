const express = require('express');
const {createTeacher, getTeacherById} = require('../controllers/teacherController');

const router = express.Router();

router.post('/register', createTeacher);
router.get('/:id', getTeacherById);

module.exports = router;