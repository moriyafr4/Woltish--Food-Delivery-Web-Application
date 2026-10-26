const express = require('express');
const router = express.Router({ mergeParams: true });
const orderController = require('../controllers/orderController');
const { isLoggedIn } = require('../middlewares/authMiddleware');
router.use(isLoggedIn); 

router.get('/', orderController.getAllOrders);
router.post('/', orderController.createOrder);

router.get('/:id', orderController.getOrderById);
router.patch('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);


module.exports = router;