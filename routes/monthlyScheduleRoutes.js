const express = require('express');
const {
    getIndividualClasses,
    getGroupClasses,
    assignVacation,
    getMonthlyScheduleByTeacherId,
    stopVacation,
} = require('../controllers/monthlyScheduleController');
const app = express();
const authorizeRoles = require('../middleware/authMiddleware');

app.use(express.json());

const router = express.Router();

router.get('/get-monthly-schedule-by/:teacherid', authorizeRoles('STUDENT', 'TEACHER', 'ADMIN'), getMonthlyScheduleByTeacherId);
router.get('/group-classes', authorizeRoles('STUDENT', 'TEACHER', 'ADMIN'), getGroupClasses);
router.get('/individual-classes', authorizeRoles('STUDENT', 'TEACHER', 'ADMIN'), getIndividualClasses);
router.post('/assign-vacation', authorizeRoles('STUDENT', 'TEACHER', 'ADMIN'), assignVacation);
router.post('/stop-vacation', authorizeRoles('STUDENT', 'TEACHER', 'ADMIN'), stopVacation)

module.exports = router;