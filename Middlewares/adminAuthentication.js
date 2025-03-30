const jwt = require('jsonwebtoken');
const User = require('../Schema/user'); 
const secretkey = "ajfhkajlhfkljashdfklashfklshdfliasfdhk";

const adminAuthMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, secretkey); 

    const userId = decoded.userId;

    const user = await User.findById(userId);
    // console.log(user)

    if (!user || !user.isAdmin) {
      return res.status(401).json({ message: 'Access denied. Not authorized as an admin.' });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error('Error authenticating admin:', error);
    return res.status(401).json({ message: 'Access denied. Invalid token or not authorized as an admin.' });
  }
};

module.exports = adminAuthMiddleware;
