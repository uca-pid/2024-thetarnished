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

router.post('/create/:teacherid', authorizeRoles('ADMIN', 'TEACHER', 'STUDENT'), createSchedule);
router.get('/all', authorizeRoles('ADMIN', 'TEACHER', 'STUDENT'), getAllSchedules);
router.get('/teacher/:teacherid', authorizeRoles('ADMIN', 'TEACHER', 'STUDENT'), getScheduleByTeacher);

module.exports = router;
