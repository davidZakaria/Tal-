const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtSecret } = require('../config/jwt');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret());
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user no longer exists' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token cryptographic failure' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token attached' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Insufficient privilege' });
  }
};

const guestOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Guest') {
    next();
  } else {
    res.status(403).json({ message: 'Guest account required' });
  }
};

module.exports = { protect, admin, guestOnly };
