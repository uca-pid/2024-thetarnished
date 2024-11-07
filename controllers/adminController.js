const Admin = require('../models/adminModel');
const Teacher = require('../models/teacherModel');
const dayjs = require('dayjs');

const activateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await Teacher.findByPk(id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        const teacherId = teacher.teacherid;
        await Teacher.update({ is_active: true }, { where: { teacherid: id } });
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
            attributes: ['teacherid', 'firstname', 'lastname', 'email', 'signup_date', 'is_active'],
            where: { is_active: false },
            order: [['signup_date', 'ASC']],
        });

        if (!inactiveTeachers.length) {
            return res.status(404).json({ message: 'No inactive teachers found' });
        }
        const formattedTeachers = inactiveTeachers.map(teacher => {
            const formattedDate = dayjs(teacher.signup_date).format('DD-MM-YYYY, HH:mm');

            return {
                teacherid: teacher.teacherid,
                firstname: teacher.firstname,
                lastname: teacher.lastname,
                email: teacher.email,
                signup_date: formattedDate,
                is_active: teacher.is_active
            };
        });

        res.status(200).json(formattedTeachers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    activateTeacher,
    disableTeacher,
    getInactiveTeachers
}