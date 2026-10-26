const Search = require('../models/Search');

// GET /api/search/:query
exports.searchRestaurantsAndProducts = async (req, res) => {
    try {
        const { query } = req.params;
        
        if (!query || query.trim() === '') {
            return res.status(400).json({ error: "Search query cannot be empty" });
        }

        const results = await Search.searchRestaurantsAndProducts(query);

        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};