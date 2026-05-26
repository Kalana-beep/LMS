const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch user to check if blocked
    const user = await User.findById(decoded.id).select('blocked');
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (user.blocked) return res.status(403).json({ message: 'Account blocked' });
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};