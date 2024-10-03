const express = require('express');
const { loginUser, createUser, changeUserPassword, editProfile, deleteUserAccount, verifyUserPassword } = require('../controllers/authenticationController');

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', createUser);
router.put('/change-password', changeUserPassword)
router.put('/edit-profile', editProfile)
router.post('/delete-account/:email', verifyUserPassword)
router.delete('/delete-account', deleteUserAccount)

module.exports = router;