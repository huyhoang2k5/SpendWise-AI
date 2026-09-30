import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────
app.use(cors({
  origin: true, // Cho phép mọi origin (Vercel, GitHub Pages, mobile, localhost)
  credentials: true
}));

// Tăng giới hạn body size vì avatar có thể là base64 lớn
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

let lastDbError = null;

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.1.0',
    message: 'SpendWise AI Server đang chạy',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    dbError: lastDbError,
    hasMongoUri: Boolean(process.env.MONGODB_URI),
    timestamp: new Date().toISOString()
  });
});

// Serve static frontend files if dist exists (Railway / Production full-stack deploy)
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // For any client route (SPA), fallback to index.html if not an API route
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── 404 Handler for API ────────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route không tồn tại: ${req.method} ${req.path}` });
});

// ─── Global Error Handler ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Lỗi server không xác định.' });
});

// ─── Connect MongoDB → Start Server ─────────────────────────────────────
const startServer = async () => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SpendWise AI Server đang chạy tại port ${PORT} (0.0.0.0)`);
    console.log(`📡 Health check: /api/health`);
  });

  if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('YOUR_USERNAME')) {
    console.warn('⚠️ MONGODB_URI chưa được cấu hình. Các API Database sẽ tạm thời không khả dụng.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ Đã kết nối MongoDB Atlas thành công!');
    lastDbError = null;
  } catch (err) {
    lastDbError = err.message;
    console.error('❌ Lỗi kết nối MongoDB Atlas:', err.message);
    console.error('👉 Gợi ý: Hãy kiểm tra mục Network Access trên MongoDB Atlas xem đã thêm IP 0.0.0.0/0 chưa.');
  }
};

// Xử lý khi mất kết nối
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB bị ngắt kết nối. Đang thử kết nối lại...');
});

startServer();
