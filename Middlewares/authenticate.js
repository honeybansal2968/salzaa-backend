const jwt = require("jsonwebtoken");
const User = require("../Schema/user"); // Ensure the correct path to User model
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        // Verify and decode JWT
        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.user_id; // Ensure your JWT payload includes `user_id`

        // Check if token is expired (jwt.verify already handles this)
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            return res.status(401).json({ message: "Token expired" });
        }

        // Find user by MongoDB ObjectId (_id)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: "Invalid user" });
        }

        req.user = user; // Attach user to request
        next(); // Proceed to next middleware/controller
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;