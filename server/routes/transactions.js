import express from 'express';
import Transaction from '../models/Transaction.js';
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

    res.json({ success: true, transactions });
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
      merchant, total, date, category, paymentMethod,
      invoiceNumber, notes, items, confidence, imageUrl, source
    } = req.body;

    if (!merchant || total === undefined || !date) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: merchant, total, date.' });
    }

    const tx = await Transaction.create({
      userId: req.user._id,
      merchant,
      total: Number(total),
      date,
      category: category || 'other',
      paymentMethod: paymentMethod || 'Không rõ',
      invoiceNumber: invoiceNumber || '',
      notes: notes || '',
      items: items || [],
      confidence: confidence || 0,
      imageUrl: imageUrl || '',
      source: source || 'manual'
    });

    res.status(201).json({ success: true, transaction: tx });
  } catch (err) {
    console.error('Add transaction error:', err);
    res.status(500).json({ error: 'Lỗi khi thêm giao dịch.' });
  }
});

// ─── PUT /api/transactions/:id ───────────────────────────────────────────
// Cập nhật giao dịch
router.put('/:id', async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!tx) {
      return res.status(404).json({ error: 'Không tìm thấy giao dịch.' });
    }

    const allowed = ['merchant', 'total', 'date', 'category', 'paymentMethod',
                     'invoiceNumber', 'notes', 'items'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) tx[field] = req.body[field];
    });

    await tx.save();
    res.json({ success: true, transaction: tx });
  } catch (err) {
    console.error('Update transaction error:', err);
    res.status(500).json({ error: 'Lỗi khi cập nhật giao dịch.' });
  }
});

// ─── DELETE /api/transactions/:id ───────────────────────────────────────
// Xóa giao dịch
router.delete('/:id', async (req, res) => {
  try {
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

// ─── DELETE /api/transactions (xóa tất cả của user) ─────────────────────
router.delete('/', async (req, res) => {
  try {
    await Transaction.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: 'Đã xóa toàn bộ giao dịch.' });
  } catch (err) {
    console.error('Clear transactions error:', err);
    res.status(500).json({ error: 'Lỗi khi xóa dữ liệu.' });
  }
});

export default router;
