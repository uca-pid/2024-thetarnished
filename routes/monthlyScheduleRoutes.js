const express = require('express');
const {
    getIndividualClasses,
    getGroupClasses,
    assignVacation,
} = require('../controllers/monthlyScheduleController');
const app = express();
app.use(express.json());

const router = express.Router();

router.get('/group-classes', getGroupClasses);
router.get('/individual-classes', getIndividualClasses);
router.post('/assign-vacation', assignVacation);

module.exports = router;