const Restaurant = require('../models/Restaurant');
const SocketClient = require('../utils/SocketClient');
const Product = require('../models/Product');

// Instantiate the socket client facing the Exercise 2 server
const ex2Client = new SocketClient();

// GET /api/restaurants/:id/products
async function getProductsByRestaurant(req, res) {
  try {
    const restaurantId = req.params.id;
    const restaurant = await Restaurant.getRestaurantById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    return res.status(200).json(restaurant.products);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/restaurants/:id/products
async function createProduct(req, res) {
  try {
    const restaurantId = req.params.id;
    const { name, price, description = '' } = req.body;

    const restaurant = await Restaurant.getRestaurantById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (restaurant.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "You are not authorized to manage this restaurant's products" });
    }

    if (!name || name.trim() === '' || price === undefined || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const newProduct = await Restaurant.addProductToRestaurant(restaurantId, { name, price, description });

    return res.status(201).json(newProduct);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/restaurants/:id/products/:pId
async function getProductById(req, res) {
  try {
    const restaurantId = req.params.id; 
    const productId = req.params.pId;

    // Extract the authenticated user ID from the HTTP request headers (SP-54)
    const userId = req.header('user-id') || 'guest_user';

    const product = await Restaurant.getProductById(restaurantId, productId);

    if (!product) {
      return res.status(404).json({ error: 'Product or Restaurant not found' });
    }

    ex2Client.updateUser(userId, [productId])
      .then(response => console.log(`Ex2 Server integration success: ${response}`))
      .catch(err => console.error(`Ex2 Server integration error: ${err.message}`));

    return res.status(200).json(product);

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PATCH /api/restaurants/:id/products/:pId
async function updateProduct(req, res) {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({ error: "Only restaurant owners can manage products" });
    }

    const restaurantId = req.params.id;
    const productId = req.params.pId;
    const { name, price, description } = req.body;

    const restaurant = await Restaurant.getRestaurantById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (restaurant.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "You are not authorized to manage this restaurant's products" });
    }

    const product = restaurant.products.find(p => p._id.toString() === productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (description !== undefined) product.description = description;
    await restaurant.save();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/restaurants/:id/products/:pId
async function deleteProduct(req, res) {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({ error: "Only restaurant owners can manage products" });
    }

    const restaurantId = req.params.id;
    const productId = req.params.pId;

    const restaurant = await Restaurant.getRestaurantById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (restaurant.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "You are not authorized to manage this restaurant's products" });
    }

    const productIndex = restaurant.products.findIndex(p => p._id.toString() === productId);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    restaurant.products.splice(productIndex, 1);
    await restaurant.save();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getProductsByRestaurant,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct
};