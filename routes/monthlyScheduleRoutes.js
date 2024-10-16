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
const authorizeRoles = require('../middleware/authMiddleware');

app.use(express.json());

const router = express.Router();

router.get('/get-monthly-schedule-by/:teacherid', authorizeRoles('STUDENT', 'TEACHER'), getMonthlyScheduleByTeacherId);
router.get('/group-classes', authorizeRoles('STUDENT'), getGroupClasses);
router.get('/individual-classes', authorizeRoles('STUDENT'), getIndividualClasses);
router.post('/assign-vacation', authorizeRoles('TEACHER'), assignVacation);
router.post('/stop-vacation', authorizeRoles('TEACHER'), stopVacation)


module.exports = router;