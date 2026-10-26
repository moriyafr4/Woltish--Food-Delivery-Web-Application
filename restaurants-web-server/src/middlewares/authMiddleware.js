const jwt = require('jsonwebtoken');
const key = "my_secret_key";

const isLoggedIn = (req, res, next) => {
    // check if the Authorization header is present in the request
    if (req.headers.authorization) {
        
        // retrieve the token from the Authorization header
        const token = req.headers.authorization.split(" ")[1];
        
        try {
            // verify the token using the secret key and retrieve the decoded data
            const decodedData = jwt.verify(token, key);
            
            req.user = decodedData;
            console.log('The logged in user is: ' + decodedData.username);
            
            return next();
            
        } catch (err) {
            return res.status(401).send("Invalid Token");
        }
    } else {
        return res.status(403).send('Token required');
    }
};

module.exports = {
    isLoggedIn
};