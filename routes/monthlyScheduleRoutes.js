const express = require('express');
const {
    getIndividualClasses,
    getGroupClasses,
    assignVacation,
    getMonthlyScheduleByTeacherId,
    stopVacation,
} = require('../controllers/monthlyScheduleController');
const app = express();
app.use(express.json());

const router = express.Router();

router.get('/get-monthly-schedule-by/:teacherid', getMonthlyScheduleByTeacherId);
router.get('/group-classes', getGroupClasses);
router.get('/individual-classes', getIndividualClasses);
router.post('/assign-vacation', assignVacation);
router.post('/stop-vacation', stopVacation)

module.exports = router;