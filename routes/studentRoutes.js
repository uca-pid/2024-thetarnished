const express = require('express');
const {createStudent, getStudentById, updateStudent, deleteStudent} = require('../controllers/studentController');
const app = express();
app.use(express.json()); 



const router = express.Router();

router.post('/register', createStudent);
router.get('/:id', getStudentById);
router.put('/update/:id', updateStudent);
router.delete('/delete/:id', deleteStudent);

module.exports = router;