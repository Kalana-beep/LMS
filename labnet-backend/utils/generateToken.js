const jwt = require('jsonwebtoken');
const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
module.exports = generateToken;