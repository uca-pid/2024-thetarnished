const Reservation = require('../models/reservationModel');
const moment = require('moment');
const sequelize = require('../config/database');
const Schedule = require('../models/monthlyScheduleModel');
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
        
        const schedule = await Schedule.findByPk(schedule_id);

        if(schedule.currentstudents >= schedule.maxstudents){
            return res.status(409).json({
                message: 'This schedule is full'
            });
        }

        const newcurrentstudents = parseInt(schedule.currentstudents) + 1;
        
        const reservation = await Reservation.create({
            student_id: student_id,
            teacher_id: teacher_id,
            subject_id: subject_id,
            schedule_id: schedule_id,
            datetime: reservationFormattedDate
        });
        const isClassFull = newcurrentstudents === parseInt(schedule.maxstudents) ? true : false; //siempre pasa en true
        await Schedule.update({
            istaken: isClassFull,
            currentstudents: newcurrentstudents
        }, {
            where: {monthlyscheduleid: schedule_id}
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
        scheduleid = reservation.schedule_id;
        const schedule = await Schedule.findByPk(scheduleid);
        const newcurrentstudents = parseInt(schedule.currentstudents) - 1;
        await Schedule.update({
            istaken: false, //siempre va false porque va a quedar siempre un lugar (ya sea grupal o individual)
            currentstudents: newcurrentstudents
        }, {
            where: {monthlyscheduleid: scheduleid}
        });
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
        const twoDaysFromNow = moment().add(7, 'days').toDate(); 

        const reservations = await Reservation.findAll({
            where: {
                teacher_id,
                datetime: {
                    [Op.between]: [now, twoDaysFromNow]
                },
                reservation_status: 'booked'
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
            attributes: ['id', 'datetime', 'schedule_id'], // Include schedule_id
        });

        if (reservations.length === 0) {
            return res.status(404).json({ message: 'No reservations found for this teacher in the next five days.' });
        }

        // Find all schedule_ids from reservations
        const scheduleIds = reservations.map(reservation => reservation.schedule_id);

        // Count reservations grouped by schedule_id
        const scheduleReservationCounts = await Reservation.findAll({
            where: {
                schedule_id: {
                    [Op.in]: scheduleIds
                },
                reservation_status: 'booked'
            },
            attributes: ['schedule_id', [sequelize.fn('COUNT', sequelize.col('id')), 'reservation_count']],
            group: ['schedule_id']
        });

        // Convert schedule counts into a map { schedule_id: reservation_count }
        const scheduleCountsMap = {};
        scheduleReservationCounts.forEach(schedule => {
            scheduleCountsMap[schedule.schedule_id] = schedule.get('reservation_count');
        });

        // Create a map to store unique reservations by schedule_id
        const uniqueReservationsMap = new Map();

        // Format reservations and only keep one reservation per schedule_id
        reservations.forEach(reservation => {
            const isGroupClass = scheduleCountsMap[reservation.schedule_id] > 1;

            // If the reservation is already in the map, we skip unless it's a group class
            if (!uniqueReservationsMap.has(reservation.schedule_id)) {
                uniqueReservationsMap.set(reservation.schedule_id, {
                    id: reservation.id,
                    student_name: isGroupClass ? 'group class' : `${reservation.Student.firstname} ${reservation.Student.lastname}`,
                    subject_name: reservation.Subject.subjectname,
                    datetime: reservation.datetime,
                    group: isGroupClass
                });
            }
        });

        // Convert the map of unique reservations to an array
        const formattedReservations = Array.from(uniqueReservationsMap.values());

        return res.status(200).json(formattedReservations);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching reservations for teacher', error });
    }
};


const cancelReservation = async (req, res) => {
    try {
        const { id } = req.params;

        const reservation = await Reservation.findByPk(id);

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        if (reservation.reservation_status === 'canceled' || reservation.reservation_status === 'finished') {
            return res.status(400).json({ message: `Cannot cancel a reservation with status '${reservation.reservation_status}'` });
        }

        reservation.reservation_status = 'canceled';
        await reservation.save();

        const scheduleid = reservation.schedule_id;
        const schedule = await Schedule.findByPk(scheduleid);

        const newcurrentstudents = parseInt(schedule.currentstudents) - 1;
        await Schedule.update({
            istaken: false,
            currentstudents: newcurrentstudents
        }, {
            where: { monthlyscheduleid: scheduleid }
        });

        return res.status(200).json({ message: 'Reservation canceled successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error canceling reservation', error });
    }
};

module.exports = {
    createReservation,
    getReservationsByTeacher,
    getReservationsByStudentId,
    deleteReservation,
    cancelReservation
};
