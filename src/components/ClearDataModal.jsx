import React, { useState } from 'react';
import { AlertTriangle, Lock, Eye, EyeOff, X, Trash2, ShieldAlert } from 'lucide-react';

export default function ClearDataModal({
  isOpen,
  onClose,
  onConfirm,
  transactionCount = 0,
  userName = ''
}) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    setPassword('');
    setError('');
    setShowPassword(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu tài khoản của bạn.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await onConfirm(password);
      setPassword('');
      onClose();
    } catch (err) {
      setError(err.message || 'Mật khẩu không chính xác. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '460px', borderRadius: '18px', overflow: 'hidden' }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(239, 68, 68, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f87171'
            }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Xác Nhận Làm Trống Sổ
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Yêu cầu xác thực bảo mật
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            disabled={isSubmitting}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-muted)', 
              cursor: isSubmitting ? 'not-allowed' : 'pointer', 
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={19} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Warning Banner */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '20px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <AlertTriangle size={20} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '13px', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
              Hành động này sẽ <strong style={{ color: '#f87171' }}>xóa toàn bộ {transactionCount} giao dịch</strong> của {userName ? `[${userName}]` : 'bạn'} trên cơ sở dữ liệu MongoDB Atlas.
              <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                ⚠️ Dữ liệu sau khi xóa <strong>không thể khôi phục</strong>.
              </div>
            </div>
          </div>

          {/* Password Prompt */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '13px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: 'var(--text-primary)'
            }}>
              Nhập mật khẩu tài khoản để xác nhận:
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Nhập mật khẩu hiện tại..."
                autoFocus
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 38px',
                  background: 'var(--bg-tertiary)',
                  border: error ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div style={{
                color: '#ef4444',
                fontSize: '12px',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>•</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn btn-secondary"
              style={{ padding: '10px 18px', fontSize: '13px' }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="btn btn-danger"
              style={{
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: '600',
                opacity: (!password.trim() || isSubmitting) ? 0.6 : 1,
                cursor: (!password.trim() || isSubmitting) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Trash2 size={15} />
              <span>{isSubmitting ? 'Đang xác thực & xóa...' : 'Xác nhận xóa sạch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
