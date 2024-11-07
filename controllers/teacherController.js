const Teacher = require('../models/teacherModel');
const SubjectTeacher = require('../models/subjectTeacherModel');
const Subject = require('../models/subjectModel');
const Reservation = require('../models/reservationModel');
const sequelize = require('../config/database');
const TeacherComments = require('../models/teacherCommentModel');
const { Op } = require('sequelize');
const moment = require('moment');
const { Sequelize } = require('sequelize');


const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll();
    return res.status(200).json(teachers);
  } catch (error) {
    /* istanbul ignore next */
    return res.status(400).json({ message: `Error getting teachers: ${error.message}` });
  }
};

const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByPk(id);
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    return res.status(200).json(teacher);
  } catch (error) {
    /* istanbul ignore next */
    return res.status(400).json({ message: `Error getting teacher: ${error.message}` });
  }
};
const getTeacherRating = async (req, res) => {
  try {
      const { teacher_id } = req.params;

      const teacher = await Teacher.findByPk(teacher_id, {
          attributes: ['rating'],
      });

      if (!teacher) {
          return res.status(404).json({ message: 'Teacher not found' });
      }
      if(teacher.rating === null){
        return res.status(200).json({ rating: 0 });
    }
      return res.status(200).json({ rating: teacher.rating });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error retrieving teacher rating' });
  }
};
const updateTeacherRating = async (req, res) => {
  try {
      const { teacher_id } = req.params;
      const { newRating, reservationid } = req.body;

      // Validate the new rating value
      if (newRating < 1 || newRating > 5) {
          return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }

      // Update the studentrated field in the reservation if reservationid is provided
      if (reservationid) {
          const reservation = await Reservation.findByPk(reservationid);
          if (reservation) {
              reservation.studentrated = newRating;
              await reservation.save();
          } else {
              return res.status(404).json({ message: 'Reservation not found' });
          }
      }

      // Find the teacher and validate existence
      const teacher = await Teacher.findByPk(teacher_id);
      if (!teacher) {
          return res.status(404).json({ message: 'Teacher not found' });
      }

      // Calculate the updated rating
      const totalRatings = parseInt(teacher.total_ratings, 10) || 0;
      const currentRating = parseFloat(teacher.rating) || 0;
      const updatedRating = ((currentRating * totalRatings) + newRating) / (totalRatings + 1);

      // Update teacher's rating and increment total ratings
      teacher.rating = updatedRating.toFixed(2);
      teacher.total_ratings = totalRatings + 1;

      await teacher.save();

      return res.status(200).json({ 
          message: 'Teacher rating updated', 
          rating: teacher.rating, 
          total_ratings: teacher.total_ratings 
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error updating teacher rating' });
  }
};



const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, lastname  } = req.body;
    const teacher = await Teacher.findByPk(id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    teacher.firstname = firstname;
    teacher.lastname = lastname;
    await teacher.save();
    return res.status(200).json(teacher);
  } catch (error) {
    /* istanbul ignore next */
    return res.status(400).json({ message: `Error updating teacher: ${error.message}` });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the teacher by ID
    const teacher = await Teacher.findByPk(id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Check if the teacher has any reservations
    const reservationsCount = await Reservation.count({
      where: {
        teacher_id: id,
        datetime: {
          [Op.gt]: moment().toDate() 
        }
      }
    });

    if (reservationsCount > 0) {
      return res.status(400).json({ message: 'Cannot delete teacher with existing reservations' });
    }

    // If no reservations, delete the teacher
    await teacher.destroy();
    return res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    /* istanbul ignore next */
    return res.status(400).json({ message: `Error deleting teacher: ${error.message}` });
  }
};

const assignSubjectToTeacher = async (req, res) => {
  try {
    const { teacherid } = req.params; 
    const { subjectid } = req.body; 

    const bigIntSubjectId = BigInt(subjectid);
    
    const teacher = await Teacher.findByPk(teacherid);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    const subject = await Subject.findByPk(bigIntSubjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    await SubjectTeacher.create({ teacherid: teacherid, subjectid: bigIntSubjectId });

    return res.status(201).json({ message: 'Subject assigned to teacher successfully' });
  } catch (error) {
   
    /* istanbul ignore next */
    return res.status(400).json({ message: `Error assigning subject to teacher: ${error.message}` });
  }
};

const removeSubjectFromTeacher = async (req, res) => {
  try {
    const { teacherid } = req.params;
    const { subjectid } = req.body;
    const teacher = await Teacher.findByPk(teacherid);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const subject = await Subject.findByPk(subjectid);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    await SubjectTeacher.destroy({ where: { teacherid, subjectid } });
    return res.status(200).json({ message: 'Subject removed from teacher successfully' });
  } catch(error){
    /* istanbul ignore next */
     return res.status(400).json({ message: `Error deleting subject from teacher: ${error.message}` });
  }
};

  const getAllTeachersDictatingASubjectById = async (req, res) => {
    try {
      const { subjectid } = req.params;
      const [teachers] = await sequelize.query(`
        SELECT DISTINCT teachers.teacherid, firstname, lastname, email, subjectid, rating  
        FROM teachers 
        JOIN subjectteacher 
        ON teachers.teacherid = subjectteacher.teacherid 
        JOIN monthlyschedule 
        ON teachers.teacherid = monthlyschedule.teacherid 
        WHERE subjectid = :subjectid 
        AND istaken = 'false' 
        ORDER BY firstname ASC, lastname ASC`
      , {

        replacements: { subjectid: subjectid },
      });

      return res.status(200).json(teachers);
    
    } catch (error) {
      /* istanbul ignore next */
      return res.status(500).json({ message: `Error getting teachers: ${error.message}` });
    }
  };

  const updateTeacherSubjects = async (email, subjects) => {
      try {
          if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
              throw new Error('Invalid subjects data');
          }

          const teacher = await Teacher.findOne({where: {email: email}});
          if (!teacher) {
              throw new Error('Teacher not found');
          }

          await SubjectTeacher.destroy({ where: { teacherid: teacher.teacherid } });

          const newRelations = subjects.map(subjectId => ({
              teacherid: teacher.teacherid,
              subjectid: subjectId
          }));
          await SubjectTeacher.bulkCreate(newRelations);
      } catch (error) {
          throw error;
      }
  };
  const getTeacherComments = async (req, res) => {
    try {
        const { teacher_id } = req.params;

        // Retrieve all comments along with commenter_name for the specified teacher ID
        const comments = await TeacherComments.findAll({
            where: { teacher_id },
            attributes: ['comment_id', 'comment', 'commenter_name'],
            order: [['comment_id', 'ASC']] // Order by comment_id if desired
        });

        // If no comments found, return a 404 status
        if (!comments.length) {
            return res.status(404).json({ message: 'No comments found for this teacher' });
        }

        // Return the comments in JSON format
        return res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving teacher comments', error: error.message });
    }
};

const createTeacherComment = async (req, res) => {
    try {
        const { teacher_id } = req.params;
        const { comment, commenter_name } = req.body;

        // Check if comment text and commenter_name are provided
        if (!comment || !commenter_name) {
            return res.status(400).json({ message: 'Comment text and commenter name are required' });
        }

        // Create a new comment for the teacher with commenter_name
        const newComment = await TeacherComments.create({
            teacher_id,
            comment,
            commenter_name
        });

        return res.status(201).json({ message: 'Comment added successfully', newComment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating teacher comment', error: error.message });
    }
};


module.exports = {
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  assignSubjectToTeacher,
  removeSubjectFromTeacher,
  getAllTeachers,
  getAllTeachersDictatingASubjectById,
  updateTeacherSubjects,
  getTeacherRating,
  updateTeacherRating,
  getTeacherComments,
  createTeacherComment
};
