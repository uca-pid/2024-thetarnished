const express = require('express');
const { loginUser, createUser, changeUserPassword, editProfile, deleteUserAccount, verifyUserPassword } = require('../controllers/authenticationController');
const authorizeRoles = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', createUser);
router.put('/change-password', authorizeRoles('TEACHER', 'STUDENT'), changeUserPassword)
router.put('/edit-profile', authorizeRoles('TEACHER', 'STUDENT'), editProfile)
router.post('/delete-account/:email', verifyUserPassword)
router.delete('/delete-account', deleteUserAccount)

module.exports = router;