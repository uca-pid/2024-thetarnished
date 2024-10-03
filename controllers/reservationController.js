const Reservation = require('../models/reservationModel');
const moment = require('moment');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const Student = require('../models/studentModel');
const Subject = require('../models/subjectModel');
const Teacher = require('../models/teacherModel');
const MonthlySchedule = require('../models/monthlyScheduleModel');  
const { sendEmailToUser } = require('./resetController');
const path = require('path');
const fs = require('fs');


const createReservation = async (req, res) => {
    try {
        const { student_id, subject_id, teacher_id, schedule_id, payment_method } = req. body;
        const schedule = await MonthlySchedule.findByPk(schedule_id);
        if(schedule.currentstudents >= schedule.maxstudents){
            return res.status(409).json({
                message: 'This schedule is full'
            });
        }
        if(schedule.currentstudents > 0) {
            const reservations = await Reservation.findOne({
                where: {
                    schedule_id: schedule_id,  
                    [Op.or]: [
                        
                        { student_id: student_id },
                        { subject_id: { [Op.not]: subject_id } }
                    ]
                }
            });
        
            if(reservations) {
                return res.status(403).json({
                    message: 'This schedule cannot be taken'
                }); 
            }
        }
        
        
        if(payment_method === 'CASHFLOW'){
            const student = await Student.findByPk(student_id);
            const studentEmail = student.email;
            const data = await fetch(`https://two024-qwerty-back-2.onrender.com/api/public/exists/${studentEmail}`);
            const isSignedUp = await data.json();
            if(!isSignedUp){
                return res.status(401).json({
                    message: 'Student is not signed up'
                    
                });
            }
        }
        const newcurrentstudents = parseInt(schedule.currentstudents) + 1;
        
        const reservation = await Reservation.create({
            student_id: student_id,
            teacher_id: teacher_id,
            subject_id: subject_id,
            schedule_id: schedule_id,
            datetime: schedule.datetime,
            payment_method: payment_method,

        });
        const isClassFull = newcurrentstudents === parseInt(schedule.maxstudents) ? true : false; 
        await MonthlySchedule.update({
            istaken: isClassFull,
            currentstudents: newcurrentstudents
        }, {
            where: {monthlyscheduleid: schedule_id}
        });

        const date = new Date(schedule.datetime);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;

        const subject = await Subject.findByPk(subject_id);
        const subjectname = subject.subjectname;

        const teacher = await Teacher.findByPk(teacher_id);
        const teacherName = `${teacher.firstname} ${teacher.lastname}`;
        const teacherEmail = teacher.email;

        const student = await Student.findByPk(student_id);
        const studentName = `${student.firstname} ${student.lastname}`;
        const studentEmail = student.email;

        const filePathStudent = path.join(__dirname, '../reservationNotificationForStudentTemplate.html');
        let htmlContentStudent = fs.readFileSync(filePathStudent, 'utf-8');
        htmlContentStudent = htmlContentStudent
            .replace(/{{teacherName}}/g, teacherName)
            .replace(/{{subjectname}}/g, subjectname)
            .replace(/{{formattedDate}}/g, formattedDate);

        const filePathTeacher = path.join(__dirname, '../reservationNotificationForTeacherTemplate.html');
        let htmlContentTeacher = fs.readFileSync(filePathTeacher, 'utf-8');
        htmlContentTeacher = htmlContentTeacher
            .replace(/{{studentName}}/g, studentName)
            .replace(/{{subjectname}}/g, subjectname)
            .replace(/{{formattedDate}}/g, formattedDate);

        setImmediate(async () => {
            try {
                await sendEmailToUser(teacherEmail, "Reservation Notification", htmlContentTeacher);
                await sendEmailToUser(studentEmail, "Reservation Notification", htmlContentStudent);
            } catch (error) {
            }
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
              },
            ],
            attributes: ['id', 'datetime'],
            order: [['datetime', 'ASC']], 
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
        const schedule = await MonthlySchedule.findByPk(scheduleid);
        const newcurrentstudents = parseInt(schedule.currentstudents) - 1;
        await MonthlySchedule.update({
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

        const reservations = await Reservation.findAll({
            where: {
              teacher_id,
              reservation_status: 'booked',
            },
            include: [
              {
                model: Student,
                attributes: ['firstname', 'lastname'],
              },
              {
                model: Subject,
                attributes: ['subjectname'],
              },
            ],
            attributes: ['id', 'datetime', 'schedule_id'],
            order: [['datetime', 'ASC']],
          });

        if (reservations.length === 0) {
            return res.status(404).json({ message: 'No reservations found for this teacher in the next five days.' });
        }


        const scheduleIds = reservations.map(reservation => reservation.schedule_id);


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


        const scheduleCountsMap = {};
        scheduleReservationCounts.forEach(schedule => {
            scheduleCountsMap[schedule.schedule_id] = schedule.get('reservation_count');
        });


        const uniqueReservationsMap = new Map();


        reservations.forEach(reservation => {
            const isGroupClass = scheduleCountsMap[reservation.schedule_id] > 1;

            if (!uniqueReservationsMap.has(reservation.schedule_id)) {
                uniqueReservationsMap.set(reservation.schedule_id, {
                    id: reservation.id,
                    student_name: isGroupClass ? 'group class' : `${reservation.Student.firstname} ${reservation.Student.lastname}`,
                    subject_name: reservation.Subject.subjectname,
                    datetime: reservation.datetime,
                    group: isGroupClass,
                    MonthlyID: reservation.schedule_id 
                });
            }
        });


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
        const schedule = await MonthlySchedule.findByPk(scheduleid);

        const newcurrentstudents = parseInt(schedule.currentstudents) - 1;
        await MonthlySchedule.update({
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

const cancelGroupClass = async (req, res) => {
    try {
        const { id } = req.params;
        const reserva = await Reservation.findByPk(id);
        if (!reserva) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        const monthlyscheduleid = reserva.schedule_id;
        const reservations = await Reservation.findAll({
            where: {
                schedule_id: monthlyscheduleid,
                reservation_status: 'booked'
            }
            
        });
        for (const reservation of reservations) {
            await reservation.update({ reservation_status: 'canceled' });
            await MonthlySchedule.update(
              {
                istaken: false,
                currentstudents: sequelize.literal('currentstudents - 1')
              },
              {
                where: { monthlyscheduleid: reservation.schedule_id }
              }
            );
          }
          return res.status(200).json({ message: 'Reservation canceled successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error canceling reservation', error });
    }
};

const terminateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { valor } = req.body;
        const reservation = await Reservation.findByPk(id);
        if (!reservation) {
            
            return res.status(404).json({ message: 'Reservation not found' });
        }
        const studentId = reservation.student_id;
        const student = await Student.findByPk(studentId);
        const studentEmail = student.email;
        const subjectId = reservation.subject_id;
        const subject = await Subject.findByPk(subjectId);
        const subjectName = subject.subjectname;
        const payment_method = reservation.payment_method;

        if(payment_method === 'CASHFLOW'){
            const data = await fetch(`https://two024-qwerty-back-2.onrender.com/api/public/sendTransaccion`, {
                method: 'POST', 
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    "valor": valor,
                    "email": studentEmail,
                    "motivo": `Clase de ${subjectName}`,
                    "id_reserva": id
                 })
              });
              const dataJson = await data.text();
              if(dataJson === 'Usuario no registrado.'){
                /*istanbul ignore next*/
                return res.status(401).json({ message: 'No se completo la transaccion' });
              } 
        }
        reservation.reservation_status = 'terminated';
        await reservation.save();
        return res.status(200).json({ message: 'Class ended successfully' });

    }
    catch (error) {
        /*istanbul ignore next*/
        return res.status(500).json({ message: 'Error ending class', error });
    }
};

const confirmPayment = async (req, res) => {
    try {
        const { id_reserva, email, reservationStatus } = req.body;
        const reservation = await Reservation.findByPk(id_reserva);
        
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        if(reservationStatus === 'paid' || reservationStatus === 'in debt' ){
            return res.status(400).json({ message: 'reservation already processed' });
        }
        if (reservationStatus === 'aceptada' ) { //&& reservationStatus !== 'paid'
            reservation.reservation_status = 'paid';
        } else {
            reservation.reservation_status = 'in debt';
            await reservation.save(); 
            return res.status(200).json({ message: 'Transaction rejected successfully' });
        }

        await reservation.save(); 
        return res.status(200).json({ message: 'Payment confirmed successfully' });
    } catch (error) {
        /*istanbul ignore next*/
        return res.status(500).json({ message: 'Error confirming payment', error });
    }
};
const getInDebtClassesById = async (req, res) => {
    try {
        const { id } = req.params; 

  
        const inDebtClasses = await Reservation.findAll({
            where: {
                teacher_id: id, 
                reservation_status: 'in debt'
            },
            include: [
              {
                model: Student,
                attributes: ['firstname', 'lastname'],
              },
              {
                model: Subject,
                attributes: ['subjectname'],
              },
            ],
            attributes: ['id', 'datetime', 'schedule_id'],
            order: [['datetime', 'ASC']],
        });

        if (inDebtClasses.length === 0) {
            return res.status(404).json({ message: 'No terminated classes found for this teacher' });
        }

        return res.status(200).json(inDebtClasses);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching terminated classes', error });
    }
};


       
module.exports = {
    createReservation,
    getReservationsByTeacher,
    getReservationsByStudentId,
    deleteReservation,
    cancelReservation,
    terminateClass,
    confirmPayment,
    cancelGroupClass,
    getInDebtClassesById
};
