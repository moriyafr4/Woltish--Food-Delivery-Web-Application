const jwt = require("jsonwebtoken")
const User = require('../models/User');
const key = "my_secret_key";

const createToken = async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const existingUser = await User.isExistingUser(username, password);

        if (existingUser) {
            const data = { 
                username: username,
                userId: existingUser.id,
                role: existingUser.role,
                profileImage: existingUser.profileImage,
                lat: existingUser.lat,
                lng: existingUser.lng
            };
            const token = jwt.sign(data, key);
            return res.status(201).json({ token });
        } else {
            return res.status(404).send('Invalid username and/or password');
        }

    } catch (error) {
        return res.status(500).json({ error: "Server error during authentication" });
    }
};

module.exports = {
    createToken
};