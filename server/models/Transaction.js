import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { _id: false });

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // ─── Thông tin hóa đơn chính ─────────────────────────────────────────
  merchant: {
    type: String,
    required: true,
    trim: true
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: String,   // Lưu dạng 'YYYY-MM-DD' để dễ filter
    required: true
  },
  category: {
    type: String,
    enum: ['food', 'shopping', 'transport', 'education', 'living', 'other'],
    default: 'other'
  },
  paymentMethod: {
    type: String,
    default: 'Không rõ'
  },
  invoiceNumber: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },

  // ─── Danh sách món hàng ──────────────────────────────────────────────
  items: {
    type: [itemSchema],
    default: []
  },

  // ─── Metadata từ AI ──────────────────────────────────────────────────
  confidence: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  imageUrl: {
    type: String,   // Base64 ảnh hóa đơn (optional)
    default: ''
  },
  scannedAt: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['ai_scan', 'manual'],
    default: 'manual'
  }
}, {
  timestamps: true
});

// Index để query nhanh theo user + date
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
