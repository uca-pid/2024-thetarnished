const express = require('express');
const { loginUser, createUser, sendEmailToUser, changeUserPassword, editProfile } = require('../controllers/authenticationController');

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', createUser);
router.post('/send-email', sendEmailToUser)
router.put('/change-password', changeUserPassword)
router.put('/edit-profile', editProfile)

module.exports = router;