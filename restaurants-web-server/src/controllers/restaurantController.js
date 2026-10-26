// controllers/restaurantController.js
const Restaurant = require('../models/Restaurant');

// GET /api/restaurants
exports.getAllRestaurants = async (req, res) => {
    try {
        const allRestaurants = await Restaurant.getAllRestaurants();
        return res.status(200).json(allRestaurants);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

// GET /api/restaurants/:id
exports.getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await Restaurant.getRestaurantById(id);
        // restaurant not found
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        
        // restaurant did found
        return res.status(200).json(restaurant);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}

// GET /api/restaurants/my
exports.getMyRestaurants = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Authentication required" });
        if (req.user.role !== 'owner') {
            return res.status(403).json({ error: "Only owners can access this" });
        }
        const myRestaurants = await Restaurant.getRestaurantsByOwner(req.user.userId);
        return res.status(200).json(myRestaurants);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

// POST /api/restaurants - owners only
exports.createRestaurant = async (req, res) => {
    try {
        // Check role from JWT (set by authMiddleware)
        if (!req.user || req.user.role !== 'owner') {
            return res.status(403).json({ error: "Only restaurant owners can create restaurants" });
        }

        let { name, description, address, phone, category, imageUrl, lat, lng } = req.body;

        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        // Bad Request
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: "Name is required" });
        }
        
        if (isNaN(Number(lat)) || isNaN(Number(lng))) {
            return res.status(400).json({ error: "Latitude and Longitude must be valid numbers" });
        }

         const newRestaurant = await Restaurant.createRestaurant({
            name,
            description,
            address,
            phone,
            category,
            imageUrl,
            lat,
            lng,
            ownerId: req.user.userId,
        });

        res.setHeader('Location', `/api/restaurants/${newRestaurant.id}`);
        
        return res.status(201).json(newRestaurant);
        
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}

// PATCH /api/restaurants/:id - owner of this restaurant only
exports.updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const restaurant = await Restaurant.getRestaurantById(id);
 
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        // Only the owner who created the restaurant can update it
        if (!req.user || req.user.userId !== restaurant.ownerId.toString()) {
            return res.status(403).json({ error: "You are not authorized to update this restaurant" });
        }

        const updatedRestaurant = await Restaurant.updateRestaurant(id, req.body);
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}

// DELETE /api/restaurants/:id - owner of this restaurant only
exports.deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await Restaurant.getRestaurantById(id);
 
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
 
        // Only the owner who created the restaurant can delete it
        if (!req.user || req.user.userId !== restaurant.ownerId.toString()) {
            return res.status(403).json({ error: "You are not authorized to delete this restaurant" });
        }
 
        await Restaurant.deleteRestaurant(id);
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};