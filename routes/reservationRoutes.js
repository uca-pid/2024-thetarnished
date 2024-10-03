const express = require('express');
const {
    createReservation,
    deleteReservation,
    getReservationsByTeacher,
    getReservationsByStudentId,
    cancelReservation,
    terminateClass,
    confirmPayment,
    cancelGroupClass,
    getInDebtClassesById,
    getPastReservationsByTeacherId
} = require('../controllers/reservationController');

const router = express.Router();

router.post('/create', createReservation);
router.delete('/delete/:id', deleteReservation);
router.get('/student/:student_id', getReservationsByStudentId);
router.get('/teacher/:teacher_id', getReservationsByTeacher);
router.get('/teacher-past-reservations-by/:teacher_id', getPastReservationsByTeacherId);
router.delete('/cancel/:id', cancelReservation);
router.delete('/terminate/:id', terminateClass);
router.put('/confirm', confirmPayment);
router.delete('/cancel-group/:id', cancelGroupClass);
router.get('/in-debt-classes/:id', getInDebtClassesById);


module.exports = router;

