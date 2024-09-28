const express = require('express');
const {
    createReservation,
    deleteReservation,
    getReservationsByTeacher,
    getReservationsByStudentId,
    cancelReservation
} = require('../controllers/reservationController');

const router = express.Router();

router.post('/create', createReservation);
router.delete('/delete/:id', deleteReservation);
router.get('/student/:student_id', getReservationsByStudentId);
router.get('/teacher/:teacher_id', getReservationsByTeacher);
router.patch('/cancel/:id', cancelReservation);

module.exports = router;

