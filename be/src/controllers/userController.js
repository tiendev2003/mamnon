const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Normalize common Mongoose/Mongo errors into readable messages + appropriate status codes
const parseDbError = (err) => {
  // Duplicate key error
  if (err && err.code === 11000) {
    const keys = Object.keys(err.keyValue || {});
    const items = keys.map((k) => `${k}: "${err.keyValue[k]}"`).join(", ");
    return { status: 409, message: `Duplicate value for field(s): ${items}` };
  }

  // Mongoose validation errors
  if (err && err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return { status: 400, message: messages.join("; ") };
  }

  // Fallback
  return { status: 400, message: err.message || "An error occurred" };
};

// Helper: send token in cookie and response
const sendToken = (user, statusCode, res) => {
  const payload = { id: user._id };
  const token = jwt.sign(payload, process.env.JWT_SECRET || "secretkey", {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

  res
    .status(statusCode)
    .json({
      success: true,
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
};

// @desc    Get all users
// @route   GET /api/users
// @access  Public
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "-password -resetPasswordToken -resetPasswordExpire"
    );
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create new user (admin or initial)
// @route   POST /api/users
// @access  Public
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    const parsed = parseDbError(error);
    res.status(parsed.status).json({ success: false, error: parsed.message });
  }
};

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, position } = req.body;
    const user = await User.create({
      username,
      email,
      password,
      fullName,
      position,
    });
    sendToken(user, 201, res);
  } catch (error) {
    const parsed = parseDbError(error);
    res.status(parsed.status).json({ success: false, error: parsed.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, error: "Vui lòng nhập email và mật khẩu" });

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      // log attempt here: console.warn(...) or use a logger
      const msg =
        process.env.SHOW_DETAILED_AUTH_ERRORS === "true"
          ? "Không tìm thấy tài khoản với email này"
          : "Email hoặc mật khẩu không chính xác";
      return res.status(401).json({ success: false, error: msg });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // increment failed-attempt counter, consider locking account after N tries
      const msg =
        process.env.SHOW_DETAILED_AUTH_ERRORS === "true"
          ? "Mật khẩu không đúng"
          : "Email hoặc mật khẩu không chính xác";
      return res.status(401).json({ success: false, error: msg });
    }

    // optional: check user.isActive and return 403 with clear message if inactive
    if (!user.isActive)
      return res
        .status(403)
        .json({ success: false, error: "Tài khoản đã bị vô hiệu hóa" });
    user.lastLogin = Date.now();
    await user.save();
    sendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Logout user (clear cookie)
// @route   POST /api/users/logout
// @access  Private?
exports.logout = async (req, res) => {
  // Client should simply discard the token. Return success for client-side logout.
  res.status(200).json({ success: true, data: {} });
};

// @desc    Forgot password - generate reset token
// @route   POST /api/users/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "There is no user with that email" });

    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // In a real app, send this token via email. For now return token in response for dev.
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/users/reset-password/${resetToken}`;
    res.status(200).json({ success: true, data: { resetUrl } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Reset password
// @route   PUT /api/users/reset-password/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ success: false, error: "Invalid token" });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ 
      success: true, 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions,
        phoneNumber: user.phoneNumber,
        position: user.position,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/users/me
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = (({ fullName, email, phoneNumber, position }) => ({
      fullName,
      email,
      phoneNumber,
      position,
    }))(req.body);
    
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).select("-password");
    
    res.status(200).json({ 
      success: true, 
      message: 'Cập nhật thông tin thành công',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions,
        phoneNumber: user.phoneNumber,
        position: user.position,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email này đã được sử dụng bởi tài khoản khác' 
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({
          success: false,
          message: "Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới",
        });

    const user = await User.findById(req.user.id).select("+password");
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Mật khẩu hiện tại không đúng" });

    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ 
      success: true, 
      message: "Đổi mật khẩu thành công" 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin only)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const fieldsToUpdate = {};
    const allowedFields = ['username', 'email', 'fullName', 'role', 'position', 'phoneNumber', 'permissions', 'isActive'];
    
    // Only update allowed fields that are provided
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    // Handle password update separately if provided
    if (req.body.password) {
      fieldsToUpdate.password = req.body.password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    const parsed = parseDbError(error);
    res.status(parsed.status).json({ success: false, error: parsed.message });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          success: false, 
          error: "Cannot delete the last admin user" 
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update user status (Admin only)
// @route   PATCH /api/users/:id/status
// @access  Private (Admin only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Prevent deactivating the last active admin
    if (user.role === 'admin' && user.isActive && !isActive) {
      const activeAdminCount = await User.countDocuments({ 
        role: 'admin', 
        isActive: true,
        _id: { $ne: req.params.id }
      });
      if (activeAdminCount === 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Cannot deactivate the last active admin user" 
        });
      }
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({ 
      success: true, 
      data: user
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Change user password (Admin only)
// @route   PATCH /api/users/:id/change-password
// @access  Private (Admin only)
exports.changeUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: "Please provide new password" 
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ 
      success: true, 
      data: { message: "Password updated successfully" }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
