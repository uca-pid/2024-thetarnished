const Reservation = require('../models/reservationModel');
const moment = require('moment');
const sequelize = require('../config/database');
const Schedule = require('../models/scheduleModel');

const createReservation = async (req, res) => {
    try {
        const { student_id, subject_id, teacher_id, dayofweek, start_time, schedule_id } = req.body;

        const currentDayOfWeek = moment().isoWeekday();
        let reservationDate = moment().isoWeekday(dayofweek);

        if (dayofweek < currentDayOfWeek || (dayofweek === currentDayOfWeek && moment().isAfter(moment(start_time, 'HH:mm:ss')))) {
            reservationDate.add(1, 'week');
        }

        const student_idBigint = BigInt(student_id);
        const teacher_idBigint = BigInt(teacher_id);
        const subject_idBigint = BigInt(subject_id);
        const schedule_idBigint = BigInt(schedule_id);
        const reservationFormattedDate = moment(`${reservationDate.format('YYYY-MM-DD')} ${start_time}`, 'YYYY-MM-DD HH:mm:ss')
            .subtract(6, 'hours') //Esto se hace para que la fecha se guarde en la base de datos en formato UTC, si no la base de datos no la entiende
            .format('YYYY-MM-DD HH:mm:ss');
        
        const existingReservation = await Reservation.findOne({
            where: {
                teacher_id: teacher_idBigint,
                datetime: reservationFormattedDate,
                schedule_id: schedule_idBigint
            }
        });

        if (existingReservation) {
            
            return res.status(409).json({
                message: 'A reservation already exists for this teacher at the same time and date.'
            });
        }
        const reservation = await Reservation.create({
            student_id: student_idBigint,
            teacher_id: teacher_idBigint,
            subject_id: subject_idBigint,
            schedule_id: schedule_idBigint,
            datetime: reservationFormattedDate
        });
        console.log('Schedule ID being updated:', schedule_idBigint);
        await Schedule.update({
            istaken: true
        }, {
            where: {scheduleid: schedule_idBigint}
        });
        return res.status(201).json(reservation);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating reservation', error });
    }
};



const getReservationsByStudentId = async (req, res) => {
    try {
        const { student_id } = req.params;
        const reservations = await Reservation.findAll({
            where: { student_id }
        });

        if (reservations.length === 0) {
            return res.status(404).json({ message: 'No reservations found for this student.' });
        }

        return res.status(200).json(reservations);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching reservations for student', error });
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
    getReservationsByStudentId,
    deleteReservation
};
