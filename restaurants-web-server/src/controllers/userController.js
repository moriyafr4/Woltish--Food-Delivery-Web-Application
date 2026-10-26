// controllers/userController.js
const User = require('../models/User');

// POST /api/users
exports.createUser = async (req, res) => {
    try {
        const { username, password, fullName, phone, role, lat, lng } = req.body;

        // Bad Request
        if (!username || username.trim() === '') {
            return res.status(400).json({ error: "username is required" });
        }
        if (!password || password.trim() === '') {
            return res.status(400).json({ error: "password is required" });
        }
        if (!fullName || fullName.trim() === '') {
            return res.status(400).json({ error: "fullName is required" });
        }
        if (!phone || phone.trim() === '') {
            return res.status(400).json({ error: "phone is required" });
        }
        if (!role || role.trim() === '') {
            return res.status(400).json({ error: "role is required" });
        }
        if (!lat || isNaN(lat)) {
            return res.status(400).json({ error: "valid lat is required" });
        }
        if (!lng || isNaN(lng)) {
            return res.status(400).json({ error: "valid lng is required" });
        }
        const existing = await User.getUserByUsername(username);
        if (existing) {
            return res.status(409).json({ error: "Username already taken" });
        }

        // If a file was uploaded, build a URL path to access it
        const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

        const newUser = await User.createUser({
            username,
            password,
            fullName,
            phone,
            role,
            lat,
            lng,
            profileImage
        });

        res.setHeader('Location', `/api/users/${newUser.id}`);
        
        return res.status(201).json(newUser);
        
    } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
    };
}

// GET /api/users/:id
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.getUserById(id);
        // user not found
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // user did found
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}

// POST /api/users/tokens
exports.isExistingUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Bad Request
        if (!username || username.trim() === '') {
            return res.status(400).json({ error: "username is required" });
        }
        if (!password || password.trim() === '') {
            return res.status(400).json({ error: "password is required" });
        }

        const result = await User.isExistingUser(username, password);
        
        if (!result) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        return res.status(200).json(result);
        
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}