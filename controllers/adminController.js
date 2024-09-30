const Admin = require('../models/adminModel');
const Teacher = require('../models/teacherModel');

const activateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await Teacher.findByPk(id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        teacher.is_active = true;
        await teacher.save();
        res.status(200).json({ message: 'Teacher activated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

const disableTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await Teacher.findByPk(id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        teacher.is_active = false;
        await teacher.save();
        res.status(200).json({ message: 'Teacher disabled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

const getInactiveTeachers = async (req, res) => {
    try {
        const inactiveTeachers = await Teacher.findAll({
            attributes: ['teacherid', 'firstname', 'lastname', 'email', 'signup_date'],
            where: { is_active: false },
            order: [['signup_date', 'ASC']],
        });
        if (!inactiveTeachers.length) {
            return res.status(404).json({ message: 'No inactive teachers found' });
        }
        res.status(200).json(inactiveTeachers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    activateTeacher,
    disableTeacher,
    getInactiveTeachers
}