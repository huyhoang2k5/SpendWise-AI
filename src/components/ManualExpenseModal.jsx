import React, { useState } from 'react';
import { 
  PlusCircle, 
  X, 
  Check, 
  Store, 
  Calendar, 
  CreditCard, 
  Tag, 
  FileText, 
  ChevronDown, 
  ChevronUp,
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

const PRESET_AMOUNTS = [
  { label: '+10k', value: 10000 },
  { label: '+20k', value: 20000 },
  { label: '+50k', value: 50000 },
  { label: '+100k', value: 100000 },
  { label: '+200k', value: 200000 },
  { label: '+500k', value: 500000 }
];

export default function ManualExpenseModal({ isOpen, onClose, onAddTransaction }) {
  const [merchant, setMerchant] = useState('');
  const [total, setTotal] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');
  const [notes, setNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const handleAddPreset = (val) => {
    const currentNum = Number(total) || 0;
    setTotal(String(currentNum + val));
  };

  const handleClearAmount = () => {
    setTotal('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numTotal = Number(total) || 0;
    if (!merchant.trim() || numTotal <= 0) return;

    onAddTransaction({
      id: 'tx-manual-' + Date.now(),
      merchant: merchant.trim(),
      total: numTotal,
      category,
      date,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod,
      invoiceNumber: 'MANUAL-' + Math.floor(1000 + Math.random() * 9000),
      notes: notes.trim(),
      items: [
        { name: merchant.trim(), quantity: 1, unitPrice: numTotal, total: numTotal, category }
      ]
    });

    // Reset and close
    setMerchant('');
    setTotal('');
    setNotes('');
    setShowAdvanced(false);
    onClose();
  };

  // Format display helper
  const formattedPreview = total && Number(total) > 0 
    ? new Intl.NumberFormat('vi-VN').format(Number(total)) + ' đ'
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
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}>
              <PlusCircle size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Ghi Khoản Chi Nhanh</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Tối giản, ghi nhanh trong 5 giây</p>
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
            padding: '14px 16px',
            marginBottom: '16px',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <label style={{ 
              display: 'block', 
              fontSize: '11px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              color: 'var(--text-muted)', 
              marginBottom: '6px',
              fontWeight: '600'
            }}>
              Số tiền chi tiêu (VNĐ) *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <input
                type="number"
                inputMode="numeric"
                autoFocus
                placeholder="0"
                required
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '240px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '30px',
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
              <div style={{ fontSize: '12px', color: 'var(--emerald-400)', fontWeight: '600', marginTop: '2px' }}>
                = {formattedPreview}
              </div>
            )}

            {/* Quick Preset Buttons */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              justifyContent: 'center',
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              {PRESET_AMOUNTS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleAddPreset(p.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '4px 9px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                >
                  {p.label}
                </button>
              ))}
              {total && (
                <button
                  type="button"
                  onClick={handleClearAmount}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '4px 9px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#f87171',
                    cursor: 'pointer'
                  }}
                >
                  Xóa
                </button>
              )}
            </div>
          </div>

          {/* Merchant / Description Input */}
          <div style={{ marginBottom: '14px' }}>
            <label className="label" style={{ fontSize: '12px', marginBottom: '6px' }}>
              Khoản chi cho việc gì? *
            </label>
            <input
              type="text"
              className="input"
              placeholder="VD: Cơm trưa, Xăng xe, Trà sữa, Mua đồ..."
              required
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              style={{ fontSize: '14px', padding: '10px 14px', borderRadius: '10px' }}
            />
          </div>

          {/* Quick Category Grid (1-tap selection) */}
          <div style={{ marginBottom: '14px' }}>
            <label className="label" style={{ fontSize: '12px', marginBottom: '6px' }}>
              Chọn danh mục
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px'
            }}>
              {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => {
                const isSelected = category === key;
                const IconComponent = CATEGORY_ICONS[key] || MoreHorizontal;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
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

          {/* Collapsible Advanced Info (Date, Payment, Notes) */}
          <div style={{
            borderTop: '1px dashed var(--border-subtle)',
            paddingTop: '10px',
            marginBottom: '16px'
          }}>
            <button
              type="button"
              onClick={() => setShowAdvanced(prev => !prev)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '6px 4px'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} />
                <span>{date === new Date().toISOString().split('T')[0] ? 'Hôm nay' : date}</span>
                <span>•</span>
                <CreditCard size={13} />
                <span>{paymentMethod}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--emerald-400)', fontWeight: '600' }}>
                {showAdvanced ? 'Thu gọn' : 'Tùy chọn thêm'}
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>

            {showAdvanced && (
              <div style={{
                marginTop: '10px',
                padding: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Ngày phát sinh
                    </label>
                    <input
                      type="date"
                      className="input"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      style={{ fontSize: '12px', padding: '6px 8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Hình thức
                    </label>
                    <select
                      className="select"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ fontSize: '12px', padding: '6px 8px' }}
                    >
                      <option value="Tiền mặt">Tiền mặt</option>
                      <option value="Chuyển khoản / VietQR">Chuyển khoản</option>
                      <option value="Ví MoMo">Ví MoMo</option>
                      <option value="ZaloPay">ZaloPay</option>
                      <option value="Thẻ ATM / Visa">Thẻ ATM / Visa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Ghi chú chi tiết (nếu có)
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="VD: Đi ăn cùng nhóm bạn, tiền lẻ..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
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
              disabled={!merchant.trim() || !total || Number(total) <= 0}
              style={{ 
                flex: 2, 
                padding: '10px', 
                fontSize: '13px', 
                fontWeight: '700',
                opacity: (!merchant.trim() || !total || Number(total) <= 0) ? 0.5 : 1
              }}
            >
              <Check size={16} />
              <span>Ghi Nhận Ngay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
