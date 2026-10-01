import React, { useState } from 'react';
import { Key, X, Check, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, currentKey, onSaveKey }) {
  const [keyInput, setKeyInput] = useState(currentKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
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
              <Key size={18} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: '700' }}>Cài Đặt Gemini API Key</h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
            SpendWise AI tích hợp trực tiếp với mô hình <strong>Gemini 3.5 Flash Multimodal Vision</strong> để đọc và nhận diện mọi hóa đơn thực tế có dấu tiếng Việt với độ chính xác cao.
          </p>

          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '14px 18px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--emerald-400)', marginBottom: '6px' }}>
              <Sparkles size={16} />
              <span>Chưa có khóa API? Lấy hoàn toàn miễn phí:</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Bạn có thể tạo một API Key miễn phí từ Google AI Studio trong chưa đầy 30 giây:
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              <span>Mở Google AI Studio</span>
              <ExternalLink size={13} />
            </a>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="label">Nhập khóa Google Gemini API Key của bạn:</label>
            <input
              type="password"
              className="input"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px', lineHeight: 1.5 }}>
              * Khóa API này được lưu trên thiết bị/máy này (Local Storage) và dùng chung cho mọi tài khoản đăng nhập trên máy. Các máy khác sẽ cài đặt API riêng biệt.
            </span>
          </div>

          <div className="modal-actions-grid">
            <button onClick={onClose} className="btn btn-secondary">
              Đóng
            </button>
            <button onClick={handleSave} className="btn btn-primary">
              {savedSuccess ? <Check size={16} /> : null}
              <span>{savedSuccess ? 'Đã lưu thành công!' : 'Lưu Khóa API'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
