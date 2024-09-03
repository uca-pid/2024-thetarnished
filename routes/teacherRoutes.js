const express = require('express');
const {createTeacher, getTeacherById, updateTeacher, deleteTeacher} = require('../controllers/teacherController');

const router = express.Router();

router.post('/register', createTeacher);
router.get('/:id', getTeacherById);
router.put('/update/:id', updateTeacher);
router.delete('/delete/:id', deleteTeacher);

module.exports = router;