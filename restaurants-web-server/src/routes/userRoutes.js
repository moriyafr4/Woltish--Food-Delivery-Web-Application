const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middlewares/upload');

router.post('/', upload.single('profileImage'), userController.createUser);
// router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.post('/tokens', userController.isExistingUser);

module.exports = router;