const Reservation = require('../models/reservationModel');


const createReservation = async (req, res) => {
    try {
        const { student_id, schedule_id, subject_id, date, teacher_id } = req.body;

        const reservation = await Reservation.create({
            student_id,
            schedule_id,
            subject_id,
            date,
            teacher_id
        });

        return res.status(201).json(reservation);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating reservation', error });
    }
};



const getReservationById = async (req, res) => {
    try {
        const { id } = req.params;
        const reservation = await Reservation.findByPk(id);

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        return res.status(200).json(reservation);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching reservation', error });
    }
};


const deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;

        const reservation = await Reservation.findByPk(id);

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        await reservation.destroy();

        return res.status(200).json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting reservation', error });
    }
};

const getReservationsByTeacher = async (req, res) => {
    try {
        const { teacher_id } = req.params; 

        const reservations = await Reservation.findAll({
            where: { teacher_id }
        });

        if (reservations.length === 0) {
            return res.status(404).json({ message: 'No reservations found for this teacher.' });
        }

        return res.status(200).json(reservations);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching reservations for teacher', error });
    }
};

module.exports = {
    createReservation,
    getReservationsByTeacher,
    getReservationById,
    deleteReservation
};
