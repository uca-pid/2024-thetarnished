const express = require('express');
const app = express();
app.use(express.json()); 

const {
  createSchedule,
  getAllSchedules,
  getScheduleByTeacher,
} = require('../controllers/weeklyScheduleController');

const authorizeRoles = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create/:teacherid', authorizeRoles('TEACHER'), createSchedule);
router.get('/all', authorizeRoles('TEACHER', 'STUDENT'), getAllSchedules);
router.get('/teacher/:teacherid', authorizeRoles('TEACHER', 'STUDENT'), getScheduleByTeacher);

module.exports = router;
