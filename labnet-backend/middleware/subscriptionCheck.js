const User = require('../models/User');

/**
 * Middleware to check if a student's subscription is active.
 * If the subscription has expired, it updates the status and denies access.
 * Admin and teacher roles bypass this check.
 */
module.exports = async (req, res, next) => {
  try {
    // Only check for students; admins and teachers have no subscription requirement
    if (req.user.role !== 'student') {
      return next();
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If subscription is marked active but end date has passed, mark as expired
    if (user.subscriptionStatus === 'active' && new Date(user.subscriptionEnd) < new Date()) {
      user.subscriptionStatus = 'expired';
      await user.save();
    }

    // Block access if subscription is expired
    if (user.subscriptionStatus !== 'active') {
      return res.status(403).json({
        message: 'Your subscription has expired. Please renew to continue accessing the platform.'
      });
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Server error during subscription check' });
  }
};