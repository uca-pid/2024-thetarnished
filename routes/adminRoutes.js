const express = require('express');
const {
    activateTeacher,
    disableTeacher,
    getInactiveTeachers
} = require('../controllers/adminController');

const router = express.Router();

router.post('/activate-teacher/:id', activateTeacher)
router.post('/disable-teacher/:id', disableTeacher)
router.get('/inactive-teachers', getInactiveTeachers)

module.exports = router;