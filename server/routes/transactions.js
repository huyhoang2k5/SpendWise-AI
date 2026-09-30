import express from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Tất cả routes đều cần đăng nhập
router.use(protect);

// ─── GET /api/transactions ───────────────────────────────────────────────
// Lấy toàn bộ giao dịch của user hiện tại (có thể filter theo tháng)
router.get('/', async (req, res) => {
  try {
    const { month } = req.query;  // Ví dụ: month=2026-09

    const filter = { userId: req.user._id };
    if (month) {
      // Lọc date bắt đầu bằng YYYY-MM
      filter.date = { $regex: `^${month}` };
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    // Chuẩn hóa để mọi bản ghi đều có cả id và _id (dạng string)
    const normalized = transactions.map(t => ({
      ...t,
      id: t._id.toString()
    }));

    res.json({ success: true, transactions: normalized });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Lỗi khi tải danh sách giao dịch.' });
  }
});

// ─── POST /api/transactions ──────────────────────────────────────────────
// Thêm giao dịch mới
router.post('/', async (req, res) => {
  try {
    const {
      merchant, total, date, time, address, category, customCategory, paymentMethod,
      invoiceNumber, notes, items, vat, discount, confidence, imageUrl, source
    } = req.body;

    if (!merchant || total === undefined || !date) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: merchant, total, date.' });
    }

    const validCategories = ['food', 'shopping', 'transport', 'education', 'living', 'other'];
    const safeCategory = validCategories.includes(category) ? category : 'other';

    // Normalize confidence
    let conf = Number(confidence) || 0;
    if (conf > 1) conf = conf / 100;
    conf = Math.min(1, Math.max(0, conf));

    // Normalize items
    const safeItems = Array.isArray(items) ? items.map(it => ({
      name: String(it?.name || 'Món hàng').trim(),
      quantity: Number(it?.quantity) || 1,
      unitPrice: Number(it?.unitPrice) || 0,
      total: Number(it?.total) || 0,
      category: validCategories.includes(it?.category) ? it.category : safeCategory
    })) : [];

    const tx = await Transaction.create({
      userId: req.user._id,
      merchant: String(merchant).trim(),
      total: Math.max(0, Number(total) || 0),
      date: String(date).trim(),
      time: time || '',
      address: address || '',
      category: safeCategory,
      customCategory: customCategory ? String(customCategory).trim() : '',
      paymentMethod: paymentMethod || 'Không rõ',
      invoiceNumber: invoiceNumber || '',
      notes: notes || '',
      items: safeItems,
      vat: Number(vat) || 0,
      discount: Number(discount) || 0,
      confidence: conf,
      imageUrl: imageUrl || '',
      source: source || 'manual'
    });

    const txObj = tx.toObject();
    txObj.id = txObj._id.toString();

    res.status(201).json({ success: true, transaction: txObj });
  } catch (err) {
    console.error('Add transaction error:', err);
    res.status(500).json({ error: err.message || 'Lỗi khi thêm giao dịch.' });
  }
});

// ─── PUT /api/transactions/:id ───────────────────────────────────────────
// Cập nhật giao dịch
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID giao dịch không hợp lệ.' });
    }

    const tx = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!tx) {
      return res.status(404).json({ error: 'Không tìm thấy giao dịch.' });
    }

    const validCategories = ['food', 'shopping', 'transport', 'education', 'living', 'other'];
    const allowed = ['merchant', 'total', 'date', 'time', 'address', 'category', 'customCategory', 'paymentMethod',
                     'invoiceNumber', 'notes', 'items', 'vat', 'discount'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'category') {
          tx[field] = validCategories.includes(req.body[field]) ? req.body[field] : 'other';
        } else if (field === 'items' && Array.isArray(req.body.items)) {
          tx.items = req.body.items.map(it => ({
            name: String(it?.name || 'Món hàng').trim(),
            quantity: Number(it?.quantity) || 1,
            unitPrice: Number(it?.unitPrice) || 0,
            total: Number(it?.total) || 0,
            category: validCategories.includes(it?.category) ? it.category : 'other'
          }));
        } else {
          tx[field] = req.body[field];
        }
      }
    });

    await tx.save();

    const txObj = tx.toObject();
    txObj.id = txObj._id.toString();

    res.json({ success: true, transaction: txObj });
  } catch (err) {
    console.error('Update transaction error:', err);
    res.status(500).json({ error: err.message || 'Lỗi khi cập nhật giao dịch.' });
  }
});

// ─── DELETE /api/transactions/:id ───────────────────────────────────────
// Xóa giao dịch
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID giao dịch không hợp lệ.' });
    }

    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!tx) {
      return res.status(404).json({ error: 'Không tìm thấy giao dịch.' });
    }
    res.json({ success: true, message: 'Đã xóa giao dịch.' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ error: 'Lỗi khi xóa giao dịch.' });
  }
});

// ─── DELETE /api/transactions (xóa tất cả của user - yêu cầu mật khẩu) ───
router.delete('/', async (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password) {
      return res.status(400).json({ error: 'Vui lòng nhập mật khẩu tài khoản để xác nhận làm trống sổ.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy tài khoản người dùng.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Mật khẩu tài khoản không chính xác.' });
    }

    const result = await Transaction.deleteMany({ userId: req.user._id });
    res.json({ 
      success: true, 
      message: `Đã xóa toàn bộ ${result.deletedCount || 0} giao dịch khỏi sổ chi tiêu.`,
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    console.error('Clear transactions error:', err);
    res.status(500).json({ error: 'Lỗi khi xóa dữ liệu.' });
  }
});

export default router;
