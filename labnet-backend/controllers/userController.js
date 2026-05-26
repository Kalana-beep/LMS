const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// Upload or update profile picture
exports.updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete old Cloudinary image if exists
    if (user.profileImagePublicId) {
      await cloudinary.uploader.destroy(user.profileImagePublicId, { resource_type: 'image' });
    }

    // Update with new Cloudinary URL and public_id
    user.profileImage = req.file.path;          // Cloudinary secure URL
    user.profileImagePublicId = req.file.filename; // public_id
    await user.save();

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.json({ user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Remove profile picture
exports.removeProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete from Cloudinary if exists
    if (user.profileImagePublicId) {
      await cloudinary.uploader.destroy(user.profileImagePublicId, { resource_type: 'image' });
    }

    user.profileImage = '';
    user.profileImagePublicId = '';
    await user.save();

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.json({ user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};