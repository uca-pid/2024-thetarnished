const express = require('express');
const {getStudentById, updateStudent, deleteStudent, getPreviousTeachers} = require('../controllers/studentController');
const app = express();
app.use(express.json()); 



const router = express.Router();

router.get('/:id', getStudentById);
router.put('/update/:id', updateStudent);
router.delete('/delete/:id', deleteStudent);
router.get('/get-previous/:id/:subjectid', getPreviousTeachers);

module.exports = router;