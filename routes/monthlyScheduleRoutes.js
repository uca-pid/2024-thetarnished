const express = require('express');
const {
    getIndividualClasses,
    getGroupClasses,
} = require('../controllers/monthlyScheduleController');
const app = express();
app.use(express.json());

const router = express.Router();

router.get('/group-classes', getGroupClasses);
router.get('/individual-classes', getIndividualClasses);

module.exports = router;