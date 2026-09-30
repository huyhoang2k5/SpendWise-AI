import React, { useState, useEffect } from 'react';
import { Edit3, X, Check, Store, Calendar, CreditCard, Tag, Layers, Trash2 } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { analyticsService } from '../services/analyticsService';

export default function EditTransactionModal({ isOpen, onClose, transaction, onUpdateTransaction }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (transaction) {
      setFormData({
        ...transaction,
        items: transaction.items ? [...transaction.items] : []
      });
    }
  }, [transaction]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateTransaction(formData.id, formData);
    onClose();
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'total' ? Number(value) || 0 : value
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
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
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a78bfa'
            }}>
              <Edit3 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '700' }}>Chỉnh Sửa Giao Dịch / Hóa Đơn</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mã: {formData.invoiceNumber || formData.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ marginBottom: '14px' }}>
            <label className="label">Cửa hàng / Đơn vị *</label>
            <input
              type="text"
              className="input"
              required
              value={formData.merchant || ''}
              onChange={(e) => handleFieldChange('merchant', e.target.value)}
            />
          </div>

          <div className="grid-2col" style={{ marginBottom: '14px' }}>
            <div>
              <label className="label">Danh mục chi tiêu</label>
              <select
                className="select"
                value={formData.category || 'other'}
                onChange={(e) => handleFieldChange('category', e.target.value)}
              >
                {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Ngày giao dịch</label>
              <input
                type="date"
                className="input"
                value={formData.date || ''}
                onChange={(e) => handleFieldChange('date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid-2col" style={{ marginBottom: '14px' }}>
            <div>
              <label className="label">Tổng tiền thanh toán (VNĐ) *</label>
              <input
                type="number"
                className="input"
                required
                value={formData.total || 0}
                onChange={(e) => handleFieldChange('total', e.target.value)}
                style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}
              />
            </div>

            <div>
              <label className="label">Phương thức thanh toán</label>
              <input
                type="text"
                className="input"
                value={formData.paymentMethod || ''}
                onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label className="label">Ghi chú giao dịch</label>
            <input
              type="text"
              className="input"
              value={formData.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>Cập Nhật Thay Đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
