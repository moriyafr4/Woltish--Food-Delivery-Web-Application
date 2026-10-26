const express = require('express');
const router = express.Router({ mergeParams: true });
const productController = require('../controllers/productController');
const { isLoggedIn } = require('../middlewares/authMiddleware');

router.get('/', productController.getProductsByRestaurant);
router.post('/', isLoggedIn, productController.createProduct);

router.get('/:pId', productController.getProductById);
router.patch('/:pId',isLoggedIn, productController.updateProduct);
router.delete('/:pId',isLoggedIn, productController.deleteProduct);

module.exports = router;