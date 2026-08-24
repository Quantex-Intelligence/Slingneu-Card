const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    // First check if user is authenticated (authMiddleware should be called before this)
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user exists and has admin role
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Add admin user info to request
    req.adminUser = {
      userId: user._id,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = adminMiddleware; 