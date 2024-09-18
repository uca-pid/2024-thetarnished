const express = require('express');
const { loginUser, createUser, changeUserPassword, editProfile, deleteUserAccount } = require('../controllers/authenticationController');

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', createUser);
router.put('/change-password', changeUserPassword)
router.put('/edit-profile', editProfile)
router.delete('/delete-account', deleteUserAccount)

module.exports = router;