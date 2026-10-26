const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');

router.post('/', tokenController.createToken);

module.exports = router;