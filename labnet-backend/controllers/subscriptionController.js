const User = require('../models/User');

exports.activateSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.subscriptionStatus === 'active') return res.status(400).json({ message: 'Already active' });
    const endDate = new Date(); endDate.setDate(endDate.getDate() + 30);
    user.subscriptionStatus = 'active';
    user.subscriptionEnd = endDate;
    // Remove SigmaId generation
    await user.save();
    res.json({ message: 'Subscription activated', user: { subscriptionStatus: user.subscriptionStatus } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};