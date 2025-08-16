const User = require('../models/userModel');
const { userUpdateSchema } = require('../utils/validation');

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist orders').select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage || '',
      wishlist: user.wishlist,
      orders: user.orders,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (err) {
    next(err);
  }
};

const updateUserProfile = async (req, res, next) => {
  // Validate request body (excluding file, handled by Multer)
  const { error } = userUpdateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update fields if provided
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password;
    if (req.file) user.profileImage = req.file.path;

    await user.save();

    // Populate wishlist and orders for response
    const updatedUser = await User.findById(user._id).populate('wishlist orders').select('-password');
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage || '',
      wishlist: updatedUser.wishlist,
      orders: updatedUser.orders,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    });
  } catch (err) {
    next(err);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    const updatedUser = await User.findById(req.user.id).populate('wishlist').select('wishlist');
    res.json(updatedUser.wishlist);
  } catch (err) {
    next(err);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('wishlist').select('wishlist');
    res.json(updatedUser.wishlist);
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').lean();
    // Map users to include profileImage explicitly
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    res.json(formattedUsers);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent superadmin from changing their own role
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({ message: 'Cannot change your own role' });
    }

    user.role = role;
    const updatedUser = await user.save();
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage || '',
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUserProfile, updateUserProfile, addToWishlist, removeFromWishlist, getAllUsers, deleteUser, updateUserRole };