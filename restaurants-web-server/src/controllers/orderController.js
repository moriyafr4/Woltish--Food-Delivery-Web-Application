const User = require('../models/User');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

// GET /api/orders — logged-in user sees their own orders
exports.getAllOrders = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const userId = req.user.userId;
        const userExists = await User.getUserById(userId);
        if (!userExists) {
            return res.status(404).json({ error: "User not found" });
        }
        const allOrders = await Order.getOrdersByUserId(userId);
        return res.status(200).json(allOrders);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.getOrderById(id);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        if (req.user && order.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: "Not authorized to view this order" });
        }
        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

// POST /api/orders — customers only
exports.createOrder = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }
        if (req.user.role === 'owner') {
            return res.status(403).json({ error: "Restaurant owners cannot place orders" });
        }

        const userId = req.user.userId;
        const { restaurantId, products, totalPrice } = req.body;

        if (!restaurantId || restaurantId.trim() === '') {
            return res.status(400).json({ error: "Restaurant ID is required" });
        }
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Products array is required and cannot be empty" });
        }

        const userExists = await User.getUserById(userId);
        if (!userExists) {
            return res.status(404).json({ error: "User not found" });
        }

        const restaurantExists = await Restaurant.getRestaurantById(restaurantId);
        if (!restaurantExists) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        const existingOrder = await Order.findOne({ userId, restaurantId, status: 'pending' });
        
        if (existingOrder) {
            const mergedProducts = [...existingOrder.products];
            for (const newP of products) {
                const exPIndex = mergedProducts.findIndex(p => (p.id || p._id) === (newP.id || newP._id));
                if (exPIndex >= 0) {
                    mergedProducts[exPIndex] = {
                        ...mergedProducts[exPIndex],
                        quantity: (mergedProducts[exPIndex].quantity || 1) + (newP.quantity || 1)
                    };
                } else {
                    mergedProducts.push(newP);
                }
            }
            existingOrder.products = mergedProducts;
            existingOrder.totalPrice += (Number(totalPrice) || 0);
            existingOrder.markModified('products');
            await existingOrder.save();
            
            return res.status(200).json(existingOrder);
        }

        const newOrder = await Order.createOrder({
            userId,
            restaurantId,
            restaurantName: restaurantExists.name,
            restaurantImage: restaurantExists.imageUrl,
            products,
            totalPrice: totalPrice || 0,
        });

        res.setHeader('Location', `/api/orders/${newOrder.id}`);
        return res.status(201).json(newOrder);

    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

// PATCH /api/orders/:id
exports.updateOrder = async (req, res) => {
    try {
          const { id } = req.params;
          const order = await Order.getOrderById(id);
          if (!order) return res.status(404).json({ error: "Order not found" });

          if (req.user && order.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: "Not authorized to update this order" });
          }

          const updatedOrder = await Order.updateOrder(id, req.body);
          if (!updatedOrder) return res.status(404).json({ error: "Order not found" });

          return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

// DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
    try {
          const { id } = req.params;
          const order = await Order.getOrderById(id);
          if (!order) return res.status(404).json({ error: "Order not found" });

          if (req.user && order.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: "Not authorized to delete this order" });
          }

          await Order.deleteOrder(id);
          return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};