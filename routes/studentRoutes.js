const express = require('express');
const {createStudent, getStudentById} = require('../controllers/studentController');

const router = express.Router();

router.post('/register', createStudent);
router.get('/:id', getStudentById);

module.exports = router;