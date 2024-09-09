const express = require('express');
const {
    createReservation,
    deleteReservation,
    getReservationsByTeacher
} = require('../controllers/reservationController');

const router = express.Router();

router.get('/reservations/teacher/:teacher_id', getReservationsByTeacher);
router.get('/reservations/create', createReservation);
router.get('/reservations/delete/:id', deleteReservation);


module.exports = router;
