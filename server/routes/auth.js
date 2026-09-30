import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper: tạo JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// ─── POST /api/auth/register ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email, role, roleCode, monthlyBudget, avatar } = req.body;

    // Validate
    if (!username || !password || !name || !role) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin bắt buộc.' });
    }
    if (username.length < 3) {
      return res.status(400).json({ error: 'Tên đăng nhập phải có ít nhất 3 ký tự.' });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 4 ký tự.' });
    }

    // Kiểm tra trùng username
    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: `Tên đăng nhập "${username}" đã được dùng. Hãy chọn tên khác.` });
    }

    const user = await User.create({
      username: username.toLowerCase().trim(),
      password,
      name: name.trim(),
      email: email?.trim() || '',
      role: role.trim(),
      roleCode: roleCode || 'other',
      monthlyBudget: monthlyBudget || 10000000,
      avatar: avatar || ''
    });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: user.toJSON()
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Lỗi server khi tạo tài khoản. Vui lòng thử lại.' });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Tên đăng nhập không tồn tại.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Mật khẩu không đúng.' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: user.toJSON()
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Lỗi server khi đăng nhập. Vui lòng thử lại.' });
  }
});

// ─── GET /api/auth/me — Lấy thông tin user hiện tại ────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// ─── PUT /api/auth/profile — Cập nhật hồ sơ cá nhân ────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, role, roleCode, avatar, password, monthlyBudget, categoryBudgets } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'Tài khoản không tồn tại.' });

    // Cập nhật các trường được phép thay đổi
    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim();
    if (role !== undefined) user.role = role.trim();
    if (roleCode !== undefined) user.roleCode = roleCode;
    if (avatar !== undefined) user.avatar = avatar;
    if (monthlyBudget !== undefined) user.monthlyBudget = Number(monthlyBudget);
    if (categoryBudgets !== undefined) user.categoryBudgets = categoryBudgets;

    // Đổi mật khẩu nếu có
    if (password && password.length >= 4) {
      user.password = password;   // pre-save hook sẽ hash
    }

    await user.save();
    res.json({ success: true, user: user.toJSON() });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Lỗi khi cập nhật hồ sơ.' });
  }
});

export default router;
