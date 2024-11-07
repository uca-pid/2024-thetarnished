const Student = require('../models/studentModel');
const sequelize = require('../config/database');
const { Sequelize } = require('sequelize');
const Reservation = require('../models/reservationModel');
const MonthlySchedule = require('../models/monthlyScheduleModel');
const StudentComments = require('../models/studentCommentModel');

const getStudentById = async (req, res) => {
    try{
        const { id } = req.params;
        const student = await Student.findByPk(id);
        if(!student){
            return res.status(404).json({ message: 'Student not found' });
        }
        return res.status(200).json(student);
    }
    catch(error){
        /* istanbul ignore next */
        return res.status(400).json({error: error.message});
    }
};

const updateStudent = async (req, res) => {
    try {
      const { id } = req.params;
      const { firstname, lastname } = req.body;
      const student = await Student.findByPk(id);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      student.firstname = firstname;
      student.lastname = lastname;
      await student.save();
      return res.status(200).json(student);
    } catch (error) {
      /* istanbul ignore next */
      return res.status(400).json({ message: `Error updating student: ${error.message}` });
    }
  };

  const deleteStudent = async (req, res) => {
    try {
      const { id } = req.params;
      

      const student = await Student.findByPk(id);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  

      const reservations = await Reservation.findAll({ where: { student_id: id } });
  

      for (const reservation of reservations) {
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
  

      await Reservation.destroy({ where: { student_id: id } });
  

      await student.destroy();
  
      return res.status(200).json({ message: 'Student and associated reservations deleted successfully' });
    } catch (error) {
      /* istanbul ignore next */
      return res.status(400).json({ message: `Error deleting student: ${error.message}` });
    }
  };
  const updateStudentRating = async (req, res) => {
    try {
        const { student_id } = req.params;
        const { newRating, reservationid} = req.body;
        const reservation = await Reservation.findByPk(reservationid);
        reservation.israted = newRating;
        await reservation.save();
        if (newRating < 1 || newRating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const student = await Student.findByPk(student_id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const totalRatings = parseInt(student.total_ratings, 10);
        const currentRating = parseFloat(student.rating) || 0;
        const updatedRating = ((currentRating * totalRatings) + newRating) / (totalRatings + 1);

        student.rating = updatedRating.toFixed(2);
        student.total_ratings = totalRatings + 1;

        await student.save();

        return res.status(200).json({ message: 'Student rating updated', rating: student.rating, total_ratings: student.total_ratings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating student rating' });
    }
};


const getStudentRating = async (req, res) => {
    try {
        const { student_id } = req.params;

        const student = await Student.findByPk(student_id, {
            attributes: ['rating'],
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        if(student.rating === null){
            return res.status(200).json({ rating: 0 });
        }
        return res.status(200).json({ rating: student.rating });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving student rating' });
    }
};

  const getPreviousTeachers = async (req, res) => {
    try {
      const { id, subjectid } = req.params;
  
      const [teachers] = await sequelize.query(`
        SELECT DISTINCT ON (teachers.teacherid) teachers.teacherid, teachers.firstname, teachers.lastname, teachers.email, reservations.id, teachers.rating
        FROM teachers
        JOIN reservations
        ON teachers.teacherid = reservations.teacher_id
        JOIN subjectteacher 
        ON teachers.teacherid = subjectteacher.teacherid
        WHERE reservations.student_id = :studentid AND subjectteacher.subjectid = :subjectid
        ORDER BY teachers.teacherid, reservations.id DESC
        LIMIT 3;
      `, {
        replacements: { studentid: id, subjectid: subjectid }, 
      });
  
      return res.status(200).json(teachers);
  
    } catch (error) {
      /* istanbul ignore next */
      return res.status(500).json({ message: `Error getting previous teachers: ${error.message}` });
    }
  };
  const getStudentComments = async (req, res) => {
    try {
        const { student_id } = req.params;

        // Retrieve all comments along with commenter_name for the specified student ID
        const comments = await StudentComments.findAll({
            where: { student_id },
            attributes: ['comment_id', 'comment', 'commenter_name'],
            order: [['comment_id', 'ASC']] // Order by comment_id if desired
        });

        // If no comments found, return a 404 status
        if (!comments.length) {
            return res.status(404).json({ message: 'No comments found for this student' });
        }

        // Return the comments in JSON format
        return res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving student comments', error: error.message });
    }
};

const createStudentComment = async (req, res) => {
    try {
        const { student_id } = req.params;
        const { comment, commenter_name } = req.body;

        // Check if comment text and commenter_name are provided
        if (!comment || !commenter_name) {
            return res.status(400).json({ message: 'Comment text and commenter name are required' });
        }

        // Create a new comment for the student with commenter_name
        const newComment = await StudentComments.create({
            student_id,
            comment,
            commenter_name
        });

        return res.status(201).json({ message: 'Comment added successfully', newComment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating student comment', error: error.message });
    }
};

const getUnratedClasses = async (req, res) => {
  try {
      const { student_id } = req.params;

      const query = `
          SELECT r.id AS reservation_id, r.datetime, t.firstname AS teacher_firstname, t.lastname AS teacher_lastname, t.teacherid AS teacher_id, r.studentrated,
                 s.subjectname
          FROM reservations r
          JOIN teachers t ON r.teacher_id = t.teacherid
          JOIN subjects s ON r.subject_id = s.subjectid
          WHERE r.student_id = :student_id
            AND r.studentrated = 0
            AND r.reservation_status != 'booked';
      `;

      const unratedClasses = await sequelize.query(query, {
          replacements: { student_id },
          type: sequelize.QueryTypes.SELECT
      });

      if (!unratedClasses.length) {
          return res.status(404).json({ message: 'No unrated classes found for this student' });
      }

      const formattedClasses = unratedClasses.map(classData => ({
          reservation_id: classData.reservation_id,
          datetime: classData.datetime,
          teacher: {
              firstname: classData.teacher_firstname,
              lastname: classData.teacher_lastname,
              teacherid: classData.teacher_id
          },
          studentrated: classData.studentrated,
          subject: classData.subjectname
      }));

      return res.status(200).json(formattedClasses);

  } catch (err) {
      console.error(err);
      return res.status(500).json({
          message: 'Internal server error',
          error: err.message,
      });
  }
};


module.exports = {
    getStudentById,
    updateStudent,
    deleteStudent,
    getPreviousTeachers,
    getStudentRating,
    updateStudentRating,
    getStudentComments,
    createStudentComment,
    getUnratedClasses
}