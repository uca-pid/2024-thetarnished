const request = require('supertest');
const app = require('../app');
const Teacher = require('../models/teacherModel');
const Subject = require('../models/subjectModel');
const Schedule = require('../models/weeklyScheduleModel');
const MonthlySchedule = require('../models/monthlyScheduleModel');
const Student = require('../models/studentModel');
const Reservation = require('../models/reservationModel');
const moment = require('moment');
jest.setTimeout(20000);

describe('Reservation Controller Tests', () => {
  let teacherId;
  let studentId;
  let scheduleId;
  let secondScheduleId;
  let subjectId;
  let reservationId;
  let newStudentId;
  let newTeacherId;
  let firstTeacherMonthlySchedule;
  let secondTeacherMonthlySchedule;
  let thirdTeacherMonthlySchedule;
  
  beforeAll(async () => {

    const teacher = await Teacher.create(
      { firstname: 'John', lastname: 'Doe', email: 'john.doe5@example.com', password: 'password' });
    teacherId = teacher.teacherid;

    const newTeacher = await Teacher.create(
      { firstname: 'John', lastname: 'Doe', email: 'john.doe6@example.com', password: 'password' });
    newTeacherId = newTeacher.teacherid;

    const student = await Student.create(
      { firstname: 'Jane', lastname: 'Doe', email: 'jane.doe7@example.com', password: 'password' });
    studentId = student.studentid;

    const newStudent = await Student.create(
      { firstname: 'Jane', lastname: 'Doe', email: 'jane.doe8@example.com', password: 'password' });
    newStudentId = newStudent.studentid;

    const schedule = await Schedule.create(
      { start_time: '09:00:00',
        end_time: '10:00:00',
        teacherid: teacherId,
        dayofweek: 1,
        maxstudents: 1 });
    scheduleId = schedule.weeklyscheduleid;
    
    const secondSchedule = await Schedule.create(
      { start_time: '00:00:00',
        end_time: '01:00:00',
        teacherid: teacherId,
        dayofweek: moment().isoWeekday(),
        maxstudents: 1 });
    secondScheduleId = secondSchedule.weeklyscheduleid;

    const thirdSchedule = await Schedule.create(
      { teacherid: teacherId,
        start_time: '23:59:59',
        end_time: '01:00:00',
        dayofweek: moment().isoWeekday(),
        maxstudents: 1
       });
    thirdScheduleId = thirdSchedule.weeklyscheduleid;
    
    firstTeacherMonthlySchedule = await MonthlySchedule.create({
      datetime: "2023-05-29 10:00:00", //quizas esta fecha cause problemas
      teacherid: teacherId,

    });

    secondTeacherMonthlySchedule = await MonthlySchedule.create({
      datetime: "2023-05-29 11:00:00", //quizas esta fecha cause problemas
      teacherid: teacherId,
      maxstudents: 2,


    });
    thirdTeacherMonthlySchedule = await MonthlySchedule.create({
      datetime: "2023-05-29 11:00:00", //quizas esta fecha cause problemas
      teacherid: teacherId,
      


    });

    const subject = await Subject.create(
      { subjectname: 'Mathematics' });
    subjectId = subject.subjectid;
  });

  afterAll(async () => {
    await Schedule.destroy({ where: { weeklyscheduleid: scheduleId } });
    await Schedule.destroy({ where: { weeklyscheduleid: secondScheduleId } });
    await Teacher.destroy({ where: { teacherid: teacherId } });
    await Teacher.destroy({ where: { teacherid: newTeacherId } });
    await Student.destroy({ where: { studentid: studentId } });
    await Student.destroy({ where: { studentid: newStudentId } });
    await Subject.destroy({ where: { subjectid: subjectId } });
    await Teacher.destroy({ where: { email: 'john.doe52@example.com' } });
    await Teacher.destroy({ where: { email: 'john.doe333@example.com' } });
    await Teacher.destroy({ where: { email: 'john.doe444@example.com' } });
    await Student.destroy({ where: { email: 'pp@gmail.com' } });
    await Student.destroy({ where: { email: 'joanDoe@gmail.com' } });
    await Student.destroy({ where: { email: 'juanaDoe@gmail.com' } });
    
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a new reservation', async () => {
    const res = await request(app)
      .post('/reservation/create')
      .send({
        student_id: studentId,
        subject_id: subjectId,
        teacher_id: teacherId,
        dayofweek: moment().isoWeekday(),
        start_time: '00:00:00',
        schedule_id: firstTeacherMonthlySchedule.monthlyscheduleid,
      });

    expect(res.status).toBe(201);
    reservationId = res.body.id;
  });

  it('should create a new reservation the same day as today', async () => {
    const res = await request(app)
      .post('/reservation/create')
      .send({
        student_id: studentId,
        subject_id: subjectId,
        teacher_id: teacherId,
        dayofweek: moment().isoWeekday(),
        start_time: '00:00:00',
        schedule_id: secondTeacherMonthlySchedule.monthlyscheduleid,
      });

    expect(res.status).toBe(201);
    
  });
  it('should create a new reservation today in the future', async () => {
    const res = await request(app)
      .post('/reservation/create')
      .send({
        student_id: studentId,
        subject_id: subjectId,
        teacher_id: teacherId,
        dayofweek: moment().isoWeekday(),
        start_time: '23:59:59',
        schedule_id: thirdTeacherMonthlySchedule.monthlyscheduleid,
      });

    expect(res.status).toBe(201);
    
  });
  

  it('should not create a reservation if one already exists', async () => {
    const res = await request(app)
      .post('/reservation/create')
      .send({
        student_id: studentId,
        subject_id: subjectId,
        teacher_id: teacherId,
        dayofweek: 1,
        start_time: '09:00:00',
        schedule_id: firstTeacherMonthlySchedule.monthlyscheduleid,
      });
  
    expect(res.status).toBe(409);
    expect(res.body.message).toBe('This schedule is full');
  });

  it('should return 500 if an error occurs during reservation creation', async () => {
    jest.spyOn(Reservation, 'create').mockImplementation(() => {
      throw new Error('Database error');
    });

    const res = await request(app)
      .post('/reservation/create')
      .send({
        student_id: newStudentId,
        subject_id: subjectId,
        teacher_id: newTeacherId,
        dayofweek: 1,
        start_time: '09:00:00',
        schedule_id: scheduleId,
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Error creating reservation');

    Reservation.create.mockRestore();
  });

  it('should get all reservations for a student', async () => {
    const res = await request(app)
      .get(`/reservation/student/${studentId}`)
      
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should return 404 if no reservations found for student', async () => {
    const res = await request(app)
      .get(`/reservation/student/${newStudentId}`)
      
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('No reservations found for this student.');
  });

  it('should return 404 if the student doess not exist', async () => {
    const res = await request(app)
      .get(`/reservation/student/123`)
    
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Student not found');
  });

  it('should return 500 if an error occurs during student reservation retrieval', async () => {
    jest.spyOn(Reservation, 'findAll').mockImplementation(() => {
      throw new Error('Database error');
    });
    
    const res = await request(app)
      .get(`/reservation/student/${studentId}`)

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Error fetching reservations for student');
    
    Reservation.findAll.mockRestore();
  });

  it('should terminate class', async() => {
    
    let teacherId, studentId, monthlyScheduleId, subjectId, reservationId;
     // Create Teacher
     const teacher = await Teacher.create({
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe52@example.com',
      password: 'password',
  });
    teacherId = teacher.teacherid;
    // Create Student
    const student = await Student.create({
      firstname: 'Jane',
      lastname: 'Doe',
      email: 'pp@gmail.com', //este es un mail que si esta en la base de datos de CASHFLOW
      password: 'password',
  });
  studentId = student.studentid;
  // Create Monthly Schedule
  const monthlySchedule = await MonthlySchedule.create({
    datetime: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss'), // Set for a future date
    teacherid: teacherId,
    maxstudents: 1,
    currentstudents: 0,
  });
  monthlyScheduleId = monthlySchedule.monthlyscheduleid;
  // Create Subject
  const subject = await Subject.create({
    subjectname: 'Mathematics',
  });
    subjectId = subject.subjectid;
    const reservation = await Reservation.create({
      student_id: studentId,
      teacher_id: teacherId,
      subject_id: subjectId,
      schedule_id: monthlyScheduleId, // Use the monthly schedule ID
      datetime: moment().format('YYYY-MM-DD HH:mm:ss'), // Current datetime
      payment_method: 'CASH',
      day_of_month: 1
  });
  
  reservationId = reservation.id;

  const res = await request(app)
            .delete(`/reservation/terminate/${reservationId}`)
            .send({ valor: 100 }); // Send any required payload
            const reservationCreated = await Reservation.findByPk(reservationId);
            await MonthlySchedule.destroy({ where: { monthlyscheduleid: monthlyScheduleId } });


            // Check if the class was terminated successfully
            expect(res.status).toBe(200);
            expect(reservationCreated.reservation_status).toBe('terminated');
            

  });

  it('should confirm the payment successfully', async () => {

    let teacherId, studentId, monthlyScheduleId, subjectId, reservationId;
     // Create Teacher
     const teacher = await Teacher.create({
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe333@example.com',
      password: 'password',
  });
    teacherId = teacher.teacherid;
    // Create Student
    const student = await Student.create({
      firstname: 'Jane',
      lastname: 'Doe',
      email: 'joanDoe@gmail.com', 
      password: 'password',
  });
  studentId = student.studentid;
  // Create Monthly Schedule
  const monthlySchedule = await MonthlySchedule.create({
    datetime: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss'), // Set for a future date
    teacherid: teacherId,
    maxstudents: 1,
    currentstudents: 0,
  });
  monthlyScheduleId = monthlySchedule.monthlyscheduleid;
  // Create Subject
  const subject = await Subject.create({
    subjectname: 'Mathematics',
  });
    subjectId = subject.subjectid;
    const reservation = await Reservation.create({
      student_id: studentId,
      teacher_id: teacherId,
      subject_id: subjectId,
      schedule_id: monthlyScheduleId, // Use the monthly schedule ID
      datetime: moment().format('YYYY-MM-DD HH:mm:ss'), // Current datetime
      payment_method: 'CASH',
      day_of_month: 1
  });
  
  reservationId = reservation.id;
    const reqBody = { //esto mockeamos que es lo que nos mandan ellos.
        id_reserva: reservationId, // Use the real reservation ID
        email: 'test@example.com', // Example email
        reservationStatus: 'aceptada', // Status that confirms payment
    };

    // Send a request to the confirmPayment route (assumed to be a POST request)
    const res = await request(app)
        .put('/reservation/confirm') // Adjust this to your actual route
        .send(reqBody);

    // Check if the reservation status was updated correctly
    const updatedReservation = await Reservation.findByPk(reservationId);
    expect(updatedReservation.reservation_status).toBe('paid');

    // Verify the response from the API
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Payment confirmed successfully');
});
it('should deny the payment', async () => {

  let teacherId, studentId, monthlyScheduleId, subjectId, reservationId;
   // Create Teacher
   const teacher = await Teacher.create({
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe444@example.com',
    password: 'password',
});
  teacherId = teacher.teacherid;
  // Create Student
  const student = await Student.create({
    firstname: 'Jane',
    lastname: 'Doe',
    email: 'juanaDoe@gmail.com', 
    password: 'password',
});
studentId = student.studentid;
// Create Monthly Schedule
const monthlySchedule = await MonthlySchedule.create({
  datetime: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss'), // Set for a future date
  teacherid: teacherId,
  maxstudents: 1,
  currentstudents: 0,
});
monthlyScheduleId = monthlySchedule.monthlyscheduleid;
// Create Subject
const subject = await Subject.create({
  subjectname: 'Mathematics',
});
  subjectId = subject.subjectid;
  const reservation = await Reservation.create({
    student_id: studentId,
    teacher_id: teacherId,
    subject_id: subjectId,
    schedule_id: monthlyScheduleId, // Use the monthly schedule ID
    datetime: moment().format('YYYY-MM-DD HH:mm:ss'), // Current datetime
    payment_method: 'CASH',
    day_of_month: 1
});

reservationId = reservation.id;
  const reqBody = { //esto mockeamos que es lo que nos mandan ellos.
      id_reserva: reservationId, // Use the real reservation ID
      email: 'juancito@example.com', // Example email
      reservationStatus: 'rechazada', // Status that confirms payment
  };

  // Send a request to the confirmPayment route (assumed to be a POST request)
  const res = await request(app)
      .put('/reservation/confirm') // Adjust this to your actual route
      .send(reqBody);

  // Check if the reservation status was updated correctly
  const updatedReservation = await Reservation.findByPk(reservationId);
  expect(updatedReservation.reservation_status).toBe('in debt');

  // Verify the response from the API
  expect(res.status).toBe(200);
  expect(res.body.message).toBe('Transaction rejected successfully');
});

it('should return 404 if the reservation does not exist when confirming payment', async () => {
  const reqBody = { //esto mockeamos que es lo que nos mandan ellos.
    id_reserva: "123133", // Use the real reservation ID
    email: 'juancito@example.com', // Example email
    reservationStatus: 'rechazada', // Status that confirms payment
};
const res = await request(app)
      .put('/reservation/confirm') // Adjust this to your actual route
      .send(reqBody);

  
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Reservation not found');
  });
  it('should return 404 if the reservation does not exist when terminating a class', async () => {
  const res = await request(app)
            .delete(`/reservation/terminate/3838`)
            expect(res.status).toBe(404);
    expect(res.body.message).toBe('Reservation not found');
  });

  
  it('should return 404 if the reservation does not exist', async () => {
    const res = await request(app)
      .delete(`/reservation/delete/123`)

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Reservation not found');
  });

  it('should get all reservations for a teacher in the next 5 days', async () => {
    const res = await request(app)
      .get(`/reservation/teacher/${teacherId}`)

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should return 404 if no reservations found for teacher', async () => {
    const res = await request(app)
      .get(`/reservation/teacher/${newTeacherId}`)
      
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('No reservations found for this teacher in the next five days.');
  });

  it('should return 404 if the teacher does not exist', async () => {
    const res = await request(app)
      .get(`/reservation/teacher/123`)
    
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Teacher not found');
  });

  it('should return 500 if an error occurs during teacher reservation retrieval', async () => {
    jest.spyOn(Reservation, 'findAll').mockImplementation(() => {
      throw new Error('Database error');
    });
    
    const res = await request(app)
      .get(`/reservation/teacher/${teacherId}`)

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Error fetching reservations for teacher');
    
    Reservation.findAll.mockRestore();
  });

  it('should delete an existing reservation', async () => {
    const res = await request(app)
      .delete(`/reservation/delete/${reservationId}`)

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Reservation deleted successfully');
  });

  it('should return 500 if an error occurs during reservation delete', async () => {
    jest.spyOn(Reservation, 'findByPk').mockImplementation(() => {
      throw new Error('Database error');
    });

    const res = await request(app)
      .delete(`/reservation/delete/${reservationId}`)

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Error deleting reservation');

    Reservation.findByPk.mockRestore();
  });

  it('Should cancel the reservation successfully', async () => {

    const weekly_schedule = await Schedule.create(
      { start_time: '09:00:00',
        end_time: '10:00:00',
        teacherid: teacherId,
        dayofweek: 1,
        maxstudents: 1
      });
      
      const weeklyscheduleId = weekly_schedule.weeklyscheduleid;

    const monthly_schedule = await MonthlySchedule.create({
      datetime: "2023-05-29 10:00:00", //quizas esta fecha cause problemas
      teacherid: teacherId,
      currentstudents: 1,
      maxstudents: 1,
      istaken: true
    });

    const monthlyId = monthly_schedule.monthlyscheduleid;
    
    const reservation = await Reservation.create({
      datetime: "2023-05-29 10:00:00",
      student_id: studentId,
      subject_id: subjectId,
      teacher_id: teacherId,
      schedule_id: monthlyId,
      day_of_month: 1
    });

    const reservationId = reservation.id;

    const res = await request(app).delete(`/reservation/cancel/${reservationId}`);


    const monthlySchedule2 = await MonthlySchedule.findByPk(monthlyId);
    expect(monthlySchedule2.currentstudents).toBe("0");
    expect(monthlySchedule2.istaken).toBe(false);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Reservation canceled successfully');
    
    const foundReservation = await Reservation.findByPk(reservationId);
    expect(foundReservation.reservation_status).toBe('canceled');

    await Reservation.destroy({ where: { id: reservationId } });
    await MonthlySchedule.destroy({ where: { monthlyscheduleid: monthlyId } });
    await Schedule.destroy({ where: { weeklyscheduleid: weeklyscheduleId } });
  });

    it('Should return 404 when reservation is not found', async () => {

    jest.spyOn(Reservation, 'findByPk').mockResolvedValue(null);

    const res = await request(app).delete('/reservation/cancel/999');

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Reservation not found');
  });

  it('Should return 400 when reservation is already canceled', async () => {

    jest.spyOn(Reservation, 'findByPk').mockResolvedValue({
        id: 1,
        reservation_status: 'canceled',
        save: jest.fn(),
        schedule_id: 1,
    });

    const res = await request(app).delete('/reservation/cancel/1');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Cannot cancel a reservation with status 'canceled'");
  });

  it('Should return 400 when reservation is already finished', async () => {

    jest.spyOn(Reservation, 'findByPk').mockResolvedValue({
        id: 1,
        reservation_status: 'finished',
        save: jest.fn(),
        schedule_id: 1,
    });

    const res = await request(app).delete('/reservation/cancel/1');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Cannot cancel a reservation with status 'finished'");
  });


  it('Should return 500 when a server error occurs', async () => {

    jest.spyOn(Reservation, 'findByPk').mockRejectedValue(new Error('Database error'));

    const res = await request(app).delete('/reservation/cancel/1');

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Error canceling reservation');
  });


  it('Should cancel the reservation and update the schedule successfully', async () => {

    const mockReservation = {
      id: 1,
      schedule_id: 100,
      reservation_status: 'booked',
      update: jest.fn().mockResolvedValue(true)
    };
    jest.spyOn(Reservation, 'findByPk').mockResolvedValue(mockReservation);

    const mockReservations = [
      { id: 1, schedule_id: 100, update: jest.fn().mockResolvedValue(true) },
      { id: 2, schedule_id: 100, update: jest.fn().mockResolvedValue(true) },
    ];
    jest.spyOn(Reservation, 'findAll').mockResolvedValue(mockReservations);

    jest.spyOn(MonthlySchedule, 'update').mockResolvedValue([1]);

    const res = await request(app).delete('/reservation/cancel-group/1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Reservation canceled successfully' });
  });

  it('Should return 404 if reservation is not found', async () => {

    jest.spyOn(Reservation, 'findByPk').mockResolvedValue(null);

    const res = await request(app).delete('/reservation/cancel-group/1');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Reservation not found' });
  });

  it('Should return 500 if there is a server error during cancellation', async () => {

    jest.spyOn(Reservation, 'findByPk').mockRejectedValue(new Error('Database error'));

    const res = await request(app).delete('/reservation/cancel-group/1');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: 'Error canceling reservation', error: expect.anything() });
  });

});
