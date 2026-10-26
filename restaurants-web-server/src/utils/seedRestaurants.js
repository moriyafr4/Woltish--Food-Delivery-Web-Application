// utils/seedRestaurants.js
// Seeds default restaurants into memory when the server starts

const Restaurant = require('../models/Restaurant');
const fs = require('fs');
const path = require('path');

const seed = async () => {
    const count = await Restaurant.countDocuments();
    if (count > 0) return;

    let defaults = [];
    try {
        const dataPath = path.join(__dirname, '../data/defaultRestaurants.json');
        const fileContent = fs.readFileSync(dataPath, 'utf8');
        defaults = JSON.parse(fileContent);
    } catch (err) {
        console.error('[Seed Error] Failed to read default restaurants from data file:', err);
        return;
    }

    await Restaurant.insertMany(defaults);

    console.log(`[Seed] ${defaults.length} default restaurants loaded.`);
};

module.exports = seed;