// routes/restaurantRoutes.js
const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { isLoggedIn } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

router.post('/', isLoggedIn, upload.single('image'), restaurantController.createRestaurant);
router.get('/', restaurantController.getAllRestaurants);
router.get('/my', isLoggedIn, restaurantController.getMyRestaurants);
router.get('/:id', restaurantController.getRestaurantById);

router.patch('/:id', isLoggedIn, upload.single('image'), restaurantController.updateRestaurant);
router.delete('/:id', isLoggedIn, restaurantController.deleteRestaurant);
module.exports = router;