const express = require('express');
const {
    getIndividualClasses,
    getGroupClasses,
    assignVacation,
    getMonthlyScheduleByTeacherId,
    stopVacation,
    getMonthlySubjectScheduleByTeacherId
} = require('../controllers/monthlyScheduleController');
const app = express();
app.use(express.json());

const router = express.Router();

router.get('/get-monthly-schedule-by/:teacherid', getMonthlyScheduleByTeacherId);
router.get('/group-classes', getGroupClasses);
router.get('/individual-classes', getIndividualClasses);
router.post('/assign-vacation', assignVacation);
router.post('/stop-vacation', stopVacation);
router.get('/monthly-subject-schedule-by/:teacherid', getMonthlySubjectScheduleByTeacherId);

module.exports = router;