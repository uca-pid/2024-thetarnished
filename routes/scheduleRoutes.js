const express = require('express');
const app = express();
app.use(express.json()); 

const {
  createSchedule,
  getAllSchedules,
  getScheduleByTeacher,
} = require('../controllers/scheduleController');

const router = express.Router();

router.post('/create/:teacherid', createSchedule);
router.get('/all', getAllSchedules);
router.get('/teacher/:teacherid', getScheduleByTeacher);

module.exports = router;
