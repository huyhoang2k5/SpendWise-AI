import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Calendar, 
  CreditCard, 
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
import { analyticsService } from '../services/analyticsService';

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
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState(() => analyticsService.getTodayDateString());
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
      customCategory: category === 'other' ? customCategory.trim() : '',
      date,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod,
      invoiceNumber: 'MANUAL-' + Math.floor(1000 + Math.random() * 9000),
      notes: notes.trim(),
      items: [
        { name: merchant.trim(), quantity: 1, unitPrice: numTotal, total: numTotal, category }
      ]
    });

    setMerchant('');
    setTotal('');
    setCustomCategory('');
    setNotes('');
    setShowAdvanced(false);
    onClose();
  };

  const formattedPreview = total && Number(total) > 0 
    ? new Intl.NumberFormat('vi-VN').format(Number(total)) + ' đ'
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
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Ghi chi tiêu</h3>
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
          {/* Big Amount Display */}
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
                autoFocus
                placeholder="0"
                required
                value={total}
                onChange={(e) => setTotal(e.target.value)}
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

            {/* Quick Presets */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '5px',
              justifyContent: 'center',
              marginTop: '8px',
              paddingTop: '8px',
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
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
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
                    borderRadius: '6px',
                    padding: '3px 8px',
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

          {/* Description Input */}
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              className="input"
              placeholder="Nội dung (cơm trưa, cà phê, xăng xe...)"
              required
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              style={{ fontSize: '13px', padding: '9px 12px', borderRadius: '10px' }}
            />
          </div>

          {/* Category Grid (1-tap) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            marginBottom: '12px'
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

          {/* Custom Category Input if "Khác" is selected */}
          {category === 'other' && (
            <div style={{ marginBottom: '12px', animation: 'fadeIn 0.2s ease' }}>
              <label style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                Tên danh mục khác:
              </label>
              <input
                type="text"
                className="input"
                placeholder="Ghi tên bạn muốn (ví dụ: Nuôi mèo, Gym, Tiền trọ...)"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                style={{ fontSize: '12.5px', padding: '7px 10px', borderRadius: '8px', width: '100%' }}
              />
            </div>
          )}

          {/* Collapsible Details */}
          <div style={{
            borderTop: '1px dashed var(--border-subtle)',
            paddingTop: '8px',
            marginBottom: '14px'
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
                fontSize: '11.5px',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={12} />
                <span>{date === analyticsService.getTodayDateString() ? 'Hôm nay' : date}</span>
                <span>•</span>
                <CreditCard size={12} />
                <span>{paymentMethod}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--emerald-400)', fontWeight: '600' }}>
                {showAdvanced ? 'Thu gọn' : 'Thêm'}
                {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </span>
            </button>

            {showAdvanced && (
              <div style={{
                marginTop: '8px',
                padding: '10px',
                background: 'var(--bg-tertiary)',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input
                    type="date"
                    className="input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ fontSize: '11.5px', padding: '6px 8px' }}
                  />
                  <select
                    className="select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ fontSize: '11.5px', padding: '6px 8px' }}
                  >
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Chuyển khoản / VietQR">Chuyển khoản</option>
                    <option value="Ví MoMo">Ví MoMo</option>
                    <option value="ZaloPay">ZaloPay</option>
                    <option value="Thẻ ATM / Visa">Thẻ ATM / Visa</option>
                  </select>
                </div>
                <input
                  type="text"
                  className="input"
                  placeholder="Ghi chú (tùy chọn)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ fontSize: '11.5px', padding: '6px 8px' }}
                />
              </div>
            )}
          </div>

          {/* Submit */}
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
              disabled={!merchant.trim() || !total || Number(total) <= 0}
              style={{ 
                flex: 2, 
                padding: '9px', 
                fontSize: '12.5px', 
                fontWeight: '700',
                opacity: (!merchant.trim() || !total || Number(total) <= 0) ? 0.5 : 1
              }}
            >
              <Check size={15} />
              <span>Lưu chi tiêu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
