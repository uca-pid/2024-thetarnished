const sequelize = require('../config/database');
const Subject = require('../models/subjectModel');

const getAllSubjects = async (req, res) =>{
    const response = await Subject.findAll();
    return res.status(200).json(response);
}

const getSubjectById = async (req, res) =>{
    const response = await Subject.findByPk(req.params.id);
    return res.status(200).json(response);
}

const createSubject = async (req, res) =>{
    const { subjectname } = req.body;
    try{
        const subjectAlreadyExists = await Subject.findOne({
        where: {
            subjectname: subjectname
        }
    });
    if(subjectAlreadyExists){
        return res.status(400).json({
            message: "Subject already exists"
        });
    }
    const response = await Subject.create(req.body);
    return res.status(200).json(response);
    }catch(error){
        /* istanbul ignore next */
        return res.status(500).json({ message: "Error creating subject" });
    }
}

const getAllSubjectsDictatedByTeachers = async (req, res) => {
    try {
      const [results, metadata] = await sequelize.query(`
        SELECT DISTINCT s.subjectid, s.subjectname
        FROM subjects s
        INNER JOIN subjectteacher st ON s.subjectid = st.subjectid
        INNER JOIN schedule sch ON st.teacherid = sch.teacherid
        WHERE sch.start_time IS NOT NULL AND sch.end_time IS NOT NULL;
        `);
        
      return res.status(200).json({message: "Subjects retrieved successfully", results});
    } catch (error) {
        /* istanbul ignore next */
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

module.exports = {
    getAllSubjects,
    getSubjectById,
    createSubject,
    getAllSubjectsDictatedByTeachers
};