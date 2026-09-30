import React, { useState, useEffect } from 'react';
import { 
  Edit3, 
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
          maxWidth: '460px', 
          borderRadius: '20px', 
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)' 
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a78bfa'
            }}>
              <Edit3 size={17} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Sửa Khoản Chi Tiêu</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                {formData.invoiceNumber || 'Giao dịch thủ công'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-muted)', 
              cursor: 'pointer', 
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {/* Hero Amount Input */}
          <div style={{
            background: 'var(--bg-tertiary)',
            borderRadius: '14px',
            padding: '12px 16px',
            marginBottom: '14px',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <label style={{ 
              display: 'block', 
              fontSize: '11px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              color: 'var(--text-muted)', 
              marginBottom: '4px',
              fontWeight: '600'
            }}>
              Tổng số tiền (VNĐ) *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <input
                type="number"
                inputMode="numeric"
                required
                value={formData.total || ''}
                onChange={(e) => handleFieldChange('total', e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '240px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '28px',
                  fontWeight: '800',
                  color: 'var(--emerald-400)',
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'center',
                  padding: '2px 0'
                }}
              />
              <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-muted)' }}>đ</span>
            </div>
            {formattedPreview && (
              <div style={{ fontSize: '12px', color: 'var(--emerald-400)', fontWeight: '600' }}>
                = {formattedPreview}
              </div>
            )}
          </div>

          {/* Merchant Input */}
          <div style={{ marginBottom: '14px' }}>
            <label className="label" style={{ fontSize: '12px', marginBottom: '6px' }}>
              Tên khoản chi / Quán / Đơn vị *
            </label>
            <input
              type="text"
              className="input"
              required
              value={formData.merchant || ''}
              onChange={(e) => handleFieldChange('merchant', e.target.value)}
              style={{ fontSize: '14px', padding: '10px 14px', borderRadius: '10px' }}
            />
          </div>

          {/* Quick Category Grid */}
          <div style={{ marginBottom: '14px' }}>
            <label className="label" style={{ fontSize: '12px', marginBottom: '6px' }}>
              Danh mục chi tiêu
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px'
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
                      gap: '7px',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: isSelected ? `1.5px solid ${cat.color}` : '1px solid var(--border-subtle)',
                      background: isSelected ? cat.bgColor : 'var(--bg-tertiary)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: isSelected ? '700' : '500',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <IconComponent size={15} color={cat.color} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Ngày chi
              </label>
              <input
                type="date"
                className="input"
                value={formData.date || ''}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                style={{ fontSize: '12px', padding: '8px 10px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Hình thức
              </label>
              <select
                className="select"
                value={formData.paymentMethod || 'Tiền mặt'}
                onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
                style={{ fontSize: '12px', padding: '8px 10px' }}
              >
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Chuyển khoản / VietQR">Chuyển khoản</option>
                <option value="Ví MoMo">Ví MoMo</option>
                <option value="ZaloPay">ZaloPay</option>
                <option value="Thẻ ATM / Visa">Thẻ ATM / Visa</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Ghi chú (tùy chọn)
            </label>
            <input
              type="text"
              className="input"
              value={formData.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="VD: Mua chung, chi phí phát sinh..."
              style={{ fontSize: '12px', padding: '8px 12px' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
              style={{ flex: 1, padding: '10px', fontSize: '13px' }}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ flex: 2, padding: '10px', fontSize: '13px', fontWeight: '700' }}
            >
              <Check size={16} />
              <span>Lưu Thay Đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
