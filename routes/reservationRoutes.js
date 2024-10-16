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
    getPastReservationsByTeacherId,
    getTerminatedReservationsByTeacherId
} = require('../controllers/reservationController');

const authorizeRoles = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', authorizeRoles('STUDENT'), createReservation);
router.delete('/delete/:id', authorizeRoles('TEACHER'), deleteReservation);
router.get('/student/:student_id', authorizeRoles('STUDENT'), getReservationsByStudentId);
router.get('/teacher/:teacher_id', authorizeRoles('TEACHER') ,getReservationsByTeacher);
router.get('/teacher-past-reservations-by/:teacher_id', authorizeRoles('TEACHER'), getPastReservationsByTeacherId);
router.delete('/cancel/:id', authorizeRoles('TEACHER'), cancelReservation);
router.delete('/terminate/:id', authorizeRoles('TEACHER'), terminateClass);
router.put('/confirm', authorizeRoles('TEACHER'), confirmPayment);
router.delete('/cancel-group/:id', authorizeRoles('TEACHER'), cancelGroupClass);
router.get('/in-debt-classes/:id', authorizeRoles('TEACHER'), getInDebtClassesById);
router.get('/terminated-reservations-by/:teacher_id', authorizeRoles('TEACHER'), getTerminatedReservationsByTeacherId);



module.exports = router;

