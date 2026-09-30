import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Calendar, 
  CreditCard, 
  Utensils,
  ShoppingBag,
  Car,
  GraduationCap,
  Home,
  MoreHorizontal
} from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../constants/categories';

const CATEGORY_ICONS = {
  food: Utensils,
  shopping: ShoppingBag,
  transport: Car,
  education: GraduationCap,
  living: Home,
  other: MoreHorizontal
};

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
    onUpdateTransaction(formData._id || formData.id, formData);
    onClose();
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'total' ? Number(value) || 0 : value
    }));
  };

  const formattedPreview = formData.total && Number(formData.total) > 0
    ? new Intl.NumberFormat('vi-VN').format(Number(formData.total)) + ' đ'
    : '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '430px', 
          borderRadius: '18px', 
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)' 
        }}
      >
        {/* Minimal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-secondary)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Sửa chi tiêu</h3>
          <button 
            type="button"
            onClick={onClose} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-muted)', 
              cursor: 'pointer', 
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
          {/* Amount Display */}
          <div style={{
            background: 'var(--bg-tertiary)',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '12px',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <input
                type="number"
                inputMode="numeric"
                required
                value={formData.total || ''}
                onChange={(e) => handleFieldChange('total', e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '220px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '32px',
                  fontWeight: '800',
                  color: 'var(--emerald-400)',
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'center',
                  padding: '0'
                }}
              />
              <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-muted)' }}>đ</span>
            </div>
            {formattedPreview && (
              <div style={{ fontSize: '11px', color: 'var(--emerald-400)', fontWeight: '600', marginTop: '2px' }}>
                {formattedPreview}
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              className="input"
              required
              value={formData.merchant || ''}
              onChange={(e) => handleFieldChange('merchant', e.target.value)}
              placeholder="Tên khoản chi..."
              style={{ fontSize: '13px', padding: '9px 12px', borderRadius: '10px' }}
            />
          </div>

          {/* Category Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            marginBottom: '12px'
          }}>
            {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => {
              const isSelected = formData.category === key;
              const IconComponent = CATEGORY_ICONS[key] || MoreHorizontal;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleFieldChange('category', key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 8px',
                    borderRadius: '8px',
                    border: isSelected ? `1.5px solid ${cat.color}` : '1px solid var(--border-subtle)',
                    background: isSelected ? cat.bgColor : 'var(--bg-tertiary)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '11.5px',
                    fontWeight: isSelected ? '700' : '500'
                  }}
                >
                  <IconComponent size={14} color={cat.color} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Date & Payment */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <input
              type="date"
              className="input"
              value={formData.date || ''}
              onChange={(e) => handleFieldChange('date', e.target.value)}
              style={{ fontSize: '11.5px', padding: '6px 8px' }}
            />
            <select
              className="select"
              value={formData.paymentMethod || 'Tiền mặt'}
              onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
              style={{ fontSize: '11.5px', padding: '6px 8px' }}
            >
              <option value="Tiền mặt">Tiền mặt</option>
              <option value="Chuyển khoản / VietQR">Chuyển khoản</option>
              <option value="Ví MoMo">Ví MoMo</option>
              <option value="ZaloPay">ZaloPay</option>
              <option value="Thẻ ATM / Visa">Thẻ ATM / Visa</option>
            </select>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '14px' }}>
            <input
              type="text"
              className="input"
              value={formData.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Ghi chú (tùy chọn)"
              style={{ fontSize: '11.5px', padding: '6px 8px' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
              style={{ flex: 1, padding: '9px', fontSize: '12.5px' }}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ flex: 2, padding: '9px', fontSize: '12.5px', fontWeight: '700' }}
            >
              <Check size={15} />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
