// Import the Express framework module
const express = require('express');
const path = require('path');
const cors = require('cors');

// Initialize the Express application instance
const app = express();
app.set('json spaces', 2);

// Enable CORS for cross-origin requests from the mobile-web client
app.use(cors());

// Middleware to parse incoming requests with JSON payloads (available in req.body)
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// --- Core API Routes ---
const productRoutes = require('./routes/productRoutes');
app.use('/api/restaurants/:id/products', productRoutes);

const restaurantRoutes = require('./routes/restaurantRoutes');
app.use('/api/restaurants', restaurantRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

const searchRoutes = require('./routes/searchRoutes');
app.use('/api/search', searchRoutes);

const tokenRoutes = require('./routes/tokenRoutes');
app.use('/api/tokens', tokenRoutes);

const seedRestaurants = require('./utils/seedRestaurants');
seedRestaurants().catch(err => console.error('Seeding failed:', err));

// ==========================================
// Secondary Web Server (Static Resources)
// ==========================================
const staticApp = express();

staticApp.use(express.static(path.join(__dirname, '..', 'public')));

const STATIC_PORT = 4000;
staticApp.listen(STATIC_PORT, () => {
    console.log(`[Static Server] Secondary Web Server running on port ${STATIC_PORT}`);
});
// ==========================================


// Export the app instance for modular reuse and testing purposes
module.exports = app;