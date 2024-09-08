const express = require('express');
const { loginUser, createUser, sendEmailToUser, changeUserPassword } = require('../controllers/authenticationController');

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', createUser);
router.post('/send-email', sendEmailToUser)
router.post('/change-password', changeUserPassword)

module.exports = router;