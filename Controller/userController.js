const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("../Schema/user")
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
const TOKEN_EXPIRY = "1h";
const SALT_ROUNDS = 10;


exports.getAuthToken = async (req, res) => {
  try {
    const { username, password } = req.query;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ status: "FAILED", message: "Username and password are required" });
    }
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ status: "FAILED", message: "Invalid credentials" });
    }

    // Verify password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: "FAILED", message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { user_id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({ status: "SUCCESS", accessToken: token });
  } catch (error) {
    res.status(500).json({ status: "FAILED", error: error.message });
  }
}


exports.createUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already taken" });
    }

    // Hash password before storing in DB
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully", user: { id: newUser.id, username: newUser.username } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
