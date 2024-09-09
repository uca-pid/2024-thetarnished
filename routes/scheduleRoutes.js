const express = require('express');
const app = express();
app.use(express.json()); 

const {
  createSchedule,
  getAllSchedules,
  getScheduleByTeacher,
  updateSchedule,
  deleteSchedule
} = require('../controllers/scheduleController');

const router = express.Router();

router.post('/create/:teacherid', createSchedule);
router.get('/all', getAllSchedules);
router.get('/teacher/:teacherid', getScheduleByTeacher);
router.put('/update/:id', updateSchedule);
router.delete('/delete/:id', deleteSchedule);

module.exports = router;
