import React, { useState } from 'react';
import { PlusCircle, X, Check, Store, Calendar, CreditCard, Tag, FileText } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../constants/categories';

export default function ManualExpenseModal({ isOpen, onClose, onAddTransaction }) {
  const [merchant, setMerchant] = useState('');
  const [total, setTotal] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!merchant.trim() || !total) return;

    onAddTransaction({
      id: 'tx-manual-' + Date.now(),
      merchant: merchant.trim(),
      total: Number(total) || 0,
      category,
      date,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod,
      invoiceNumber: 'MANUAL-' + Math.floor(1000 + Math.random() * 9000),
      notes: notes.trim(),
      items: [
        { name: merchant.trim(), quantity: 1, unitPrice: Number(total) || 0, total: Number(total) || 0, category }
      ]
    });

    // Reset and close
    setMerchant('');
    setTotal('');
    setNotes('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}>
              <PlusCircle size={18} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: '700' }}>Thêm Khoản Chi Tiêu Thủ Công</h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Merchant & Amount */}
          <div style={{ marginBottom: '14px' }}>
            <label className="label">Tên khoản chi / Quán / Địa điểm *</label>
            <input
              type="text"
              className="input"
              placeholder="VD: Cơm tấm vỉa hè, Tiền gửi xe, Trà đá..."
              required
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label className="label">Số tiền (VNĐ) *</label>
            <input
              type="number"
              className="input"
              placeholder="VD: 35000"
              required
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          {/* Category & Date */}
          <div className="grid-2col" style={{ marginBottom: '14px' }}>
            <div>
              <label className="label">Danh mục chi tiêu</label>
              <select
                className="select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Ngày phát sinh</label>
              <input
                type="date"
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: '14px' }}>
            <label className="label">Phương thức thanh toán</label>
            <select
              className="select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Tiền mặt">Tiền mặt</option>
              <option value="Chuyển khoản / VietQR">Chuyển khoản / VietQR</option>
              <option value="Ví MoMo">Ví MoMo</option>
              <option value="ZaloPay">ZaloPay</option>
              <option value="Thẻ ATM / Visa">Thẻ ATM / Visa</option>
            </select>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '22px' }}>
            <label className="label">Ghi chú (tùy chọn)</label>
            <input
              type="text"
              className="input"
              placeholder="VD: Ăn cùng nhóm bạn, tiền thừa gửi xe..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>Ghi Nhận Khoản Chi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
