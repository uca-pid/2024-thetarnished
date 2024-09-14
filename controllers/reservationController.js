const Reservation = require('../models/reservationModel');
const moment = require('moment');
const sequelize = require('../config/database');
const Schedule = require('../models/scheduleModel');
const { Op } = require('sequelize');
const Student = require('../models/studentModel');
const Subject = require('../models/subjectModel');
const Teacher = require('../models/teacherModel');

const createReservation = async (req, res) => {
    try {
        const { student_id, subject_id, teacher_id, dayofweek, start_time, schedule_id } = req.body;

        const currentDayOfWeek = moment().isoWeekday();
        let reservationDate = moment().isoWeekday(dayofweek);

        if (dayofweek < currentDayOfWeek || (dayofweek === currentDayOfWeek && moment().isAfter(moment(start_time, 'HH:mm:ss')))) {
            reservationDate.add(1, 'week');
        }

        const reservationFormattedDate = moment(`${reservationDate.format('YYYY-MM-DD')} ${start_time}`, 'YYYY-MM-DD HH:mm:ss')
            .subtract(3, 'hours') 
            .format('YYYY-MM-DD HH:mm:ss');
        
        const existingReservation = await Reservation.findOne({
            where: {
                teacher_id: teacher_id,
                datetime: reservationFormattedDate,
                schedule_id: schedule_id
            }
        });

        if (existingReservation) {
            
            return res.status(409).json({
                message: 'A reservation already exists for this teacher at the same time and date.'
            });
        }
        const reservation = await Reservation.create({
            student_id: student_id,
            teacher_id: teacher_id,
            subject_id: subject_id,
            schedule_id: schedule_id,
            datetime: reservationFormattedDate
        });

        await Schedule.update({
            istaken: true
        }, {
            where: {scheduleid: schedule_id}
        });
        return res.status(201).json(reservation);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating reservation', error });
    }
};



const getReservationsByStudentId = async (req, res) => {
    try {
        const { student_id } = req.params;

        const studentFound = await Student.findByPk(student_id);

        if (!studentFound) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const reservations = await Reservation.findAll({
            where: { student_id },
            include: [
                {
                    model: Teacher,
                    attributes: ['firstname', 'lastname'],
                },
                {
                    model: Subject,
                    attributes: ['subjectname'],
                }
            ],
            attributes: ['id', 'datetime'],
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

        const foundTeacher = await Teacher.findByPk(teacher_id);
        if (!foundTeacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        
        const now = moment().toDate();
        const twoDaysFromNow = moment().add(5, 'days').toDate(); 
        const reservations = await Reservation.findAll({
            where: {
                teacher_id,
                datetime: {
                    [Op.between]: [now, twoDaysFromNow]  
                }
            },
            include: [
                {
                    model: Student,
                    attributes: ['firstname', 'lastname'], 
                },
                {
                    model: Subject,
                    attributes: ['subjectname'], 
                }
            ],
            attributes: ['id', 'datetime']
        });

        if (reservations.length === 0) {
            return res.status(404).json({ message: 'No reservations found for this teacher in the next five days.' });
        }

        const formattedReservations = reservations.map(reservation => ({
            id: reservation.id,
            student_name: `${reservation.Student.firstname} ${reservation.Student.lastname}`,
            subject_name: reservation.Subject.subjectname,
            datetime: reservation.datetime
        }));

        return res.status(200).json(formattedReservations);
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
