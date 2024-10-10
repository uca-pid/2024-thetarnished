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

const authorizeRoles = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', authorizeRoles('STUDENT', 'TEACHER', 'ADMIN'), createReservation);
router.delete('/delete/:id', authorizeRoles('STUDENT', 'TEACHER', 'ADMIN'), deleteReservation);
router.get('/student/:student_id', authorizeRoles('STUDENT', 'TEACHER', 'ADMIN'), getReservationsByStudentId);
router.get('/teacher/:teacher_id', authorizeRoles('STUDENT', 'TEACHER', 'ADMIN') ,getReservationsByTeacher);
router.get('/teacher-past-reservations-by/:teacher_id', authorizeRoles('STUDENT', 'TEACHER', 'ADMIN'), getPastReservationsByTeacherId);
router.delete('/cancel/:id', authorizeRoles('STUDENT', 'TEACHER', 'ADMIN'), cancelReservation);
router.delete('/terminate/:id', authorizeRoles('STUDENT', 'TEACHER', 'ADMIN'), terminateClass);
router.put('/confirm', authorizeRoles('STUDENT', 'TEACHER', 'ADMIN'), confirmPayment);
router.delete('/cancel-group/:id', authorizeRoles('STUDENT', 'TEACHER', 'ADMIN'), cancelGroupClass);
router.get('/in-debt-classes/:id', authorizeRoles('STUDENT', 'TEACHER', 'ADMIN'), getInDebtClassesById);


module.exports = router;

