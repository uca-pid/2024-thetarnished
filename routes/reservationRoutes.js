const express = require('express');
const {
    createReservation,
    deleteReservation,
    getReservationsByTeacher,
    getReservationsByStudentId
} = require('../controllers/reservationController');

const router = express.Router();


router.post('/create', createReservation);
router.delete('/delete/:id', deleteReservation);
router.get('/student/:student_id', getReservationsByStudentId);
router.get('/teacher/:teacher_id', getReservationsByTeacher);
module.exports = router;

