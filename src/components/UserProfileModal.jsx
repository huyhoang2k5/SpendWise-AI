import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Briefcase, 
  Wallet, 
  Calendar, 
  Save, 
  LogOut, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Check, 
  Sparkles,
  Camera,
  Upload,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';

const PRESET_AVATARS = [
  { id: '1', label: 'Sinh viên', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: '2', label: 'Người đi làm', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: '3', label: 'Gia đình', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { id: '4', label: 'Kinh doanh', url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150&auto=format&fit=crop&q=80' },
  { id: '5', label: 'Công nghệ', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' },
  { id: '6', label: 'Sáng tạo', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' }
];

const SUGGESTED_ROLES = [
  'Sinh viên',
  'Người đi làm',
  'Hộ gia đình',
  'Cá nhân kinh doanh nhỏ',
  'Freelancer / Tự do',
  'Kỹ sư / Lập trình viên',
  'Giáo viên / Giảng viên',
  'Bác sĩ / Nhân viên y tế'
];

export default function UserProfileModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onUpdateProfile, 
  onLogout 
}) {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Sinh viên');
  const [monthlyBudget, setMonthlyBudget] = useState(10000000);
  const [newPassword, setNewPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isCustomPhoto, setIsCustomPhoto] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setRole(currentUser.role || 'Sinh viên');
      setMonthlyBudget(currentUser.monthlyBudget ?? currentUser.defaultBudget ?? 10000000);
      setNewPassword('');
      setAvatar(currentUser.avatar || PRESET_AVATARS[0].url);
      setIsCustomPhoto(Boolean(currentUser.avatar && currentUser.avatar.startsWith('data:image')));
      setErrorMsg('');
      setSuccessNotice('');
      setIsSavedSuccess(false);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  // Handle personal photo upload from device
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP)!');
      return;
    }

    setErrorMsg('');

    // Read and compress via Canvas to ensure lightweight storage
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 320; // 320px is perfect for sharp retina avatar

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setAvatar(compressedDataUrl);
        setIsCustomPhoto(true);
        setSuccessNotice(`Đã tải ảnh cá nhân [${file.name}] thành công!`);
        setTimeout(() => setSuccessNotice(''), 4000);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập của bạn!');
      return;
    }

    if (/\s/.test(username.trim())) {
      setErrorMsg('Tên đăng nhập không được chứa khoảng trắng!');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn!');
      return;
    }

    if (!role.trim()) {
      setErrorMsg('Vui lòng nhập nhóm đối tượng hoặc nghề nghiệp của bạn!');
      return;
    }

    const budgetNum = Number(monthlyBudget) || 10000000;
    if (budgetNum <= 0) {
      setErrorMsg('Ngân sách tháng dự kiến phải lớn hơn 0 VNĐ!');
      return;
    }

    const payload = {
      username: username.trim().toLowerCase(),
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : '',
      role: role.trim(),
      monthlyBudget: budgetNum,
      defaultBudget: budgetNum,
      avatar: avatar
    };

    if (newPassword.trim()) {
      if (newPassword.trim().length < 4) {
        setErrorMsg('Mật khẩu mới phải có ít nhất 4 ký tự!');
        return;
      }
      payload.password = newPassword.trim();
    }

    const res = await onUpdateProfile(payload);

    if (res && res.error) {
      setErrorMsg(res.error);
    } else {
      setIsSavedSuccess(true);
      setSuccessNotice('Đã cập nhật hồ sơ & ngân sách thành công!');
      setTimeout(() => {
        setIsSavedSuccess(false);
        onClose();
      }, 700);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '20px'
    }}>
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-glow)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(16, 185, 129, 0.15)',
          overflow: 'hidden',
          animation: 'fadeIn 0.25s ease-out'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <User size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                  Hồ Sơ Cá Nhân
                </h3>
                <span className="badge badge-food" style={{ fontSize: '10px', padding: '2px 8px' }}>
                  <ShieldCheck size={11} style={{ marginRight: '3px' }} />
                  Bảo Mật Riêng Tư
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Xem lại & chỉnh sửa thông tin tài khoản người dùng cá nhân
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px', borderRadius: '50%' }}
            title="Đóng cửa sổ"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {errorMsg && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successNotice && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Check size={16} />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Hidden File Input for Personal Photo */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* Avatar Section (Upload personal photo + presets) */}
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '18px',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '22px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Clickable Avatar to trigger file upload */}
                <div 
                  onClick={triggerFileInput}
                  style={{ 
                    position: 'relative', 
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  title="Nhấn để tải ảnh cá nhân từ thiết bị của bạn"
                >
                  <img
                    src={avatar}
                    alt={name}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--emerald-500)',
                      boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--emerald-500)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                  }}>
                    <Camera size={13} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      Ảnh Đại Diện Cá Nhân
                    </span>
                    {isCustomPhoto && (
                      <span className="badge badge-food" style={{ fontSize: '10px' }}>
                        Ảnh tải lên từ máy
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0' }}>
                    Tải ảnh từ máy tính hoặc chọn ảnh mẫu phong cách
                  </p>
                </div>
              </div>

              {/* Upload Personal Photo Button */}
              <button
                type="button"
                onClick={triggerFileInput}
                className="btn btn-secondary btn-sm"
                style={{
                  padding: '7px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderColor: 'var(--emerald-500)',
                  color: 'var(--emerald-400)'
                }}
              >
                <Upload size={14} />
                <span>Tải ảnh từ máy tính</span>
              </button>
            </div>

            {/* Quick avatar preset selection */}
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Hoặc chọn nhanh avatar mẫu có sẵn:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PRESET_AVATARS.map((p) => {
                  const isSelected = avatar === p.url;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => {
                        setAvatar(p.url);
                        setIsCustomPhoto(false);
                      }}
                      style={{
                        border: isSelected ? '2px solid var(--emerald-400)' : '1px solid var(--border-subtle)',
                        padding: '2px',
                        borderRadius: '50%',
                        background: 'transparent',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.15s ease'
                      }}
                      title={p.label}
                    >
                      <img
                        src={p.url}
                        alt={p.label}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          opacity: isSelected ? 1 : 0.7
                        }}
                      />
                      {isSelected && (
                        <span style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-2px',
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: 'var(--emerald-500)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '9px'
                        }}>
                          <Check size={9} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Username & Full Name */}
            <div className="grid-2col">
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Tên Đăng Nhập *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="input"
                    style={{ paddingLeft: '38px', width: '100%', fontFamily: 'var(--font-mono)' }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Tên đăng nhập"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Họ và Tên *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="input"
                    style={{ paddingLeft: '38px', width: '100%' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập họ và tên..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email & Role */}
            <div className="grid-2col">
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Gmail / Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    className="input"
                    style={{ paddingLeft: '38px', width: '100%' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Nghề nghiệp / Đối tượng
                </label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="input"
                    style={{ paddingLeft: '38px', width: '100%' }}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="VD: Sinh viên, Người đi làm..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Suggested quick-chips for Role */}
            <div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {SUGGESTED_ROLES.slice(0, 6).map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setRole(sug)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      border: role === sug ? '1px solid var(--emerald-400)' : '1px solid var(--border-subtle)',
                      background: role === sug ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
                      color: role === sug ? 'var(--emerald-400)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Password & Monthly Budget */}
            <div className="grid-2col" style={{ gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Mật Khẩu Mới</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400' }}>
                    (Bỏ trống nếu không đổi)
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    style={{ paddingLeft: '38px', paddingRight: '36px', width: '100%', fontFamily: 'var(--font-mono)' }}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập nếu muốn đổi..."
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '10px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Ngân Sách Tháng</span>
                  <span style={{ fontSize: '11px', color: 'var(--emerald-400)', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                    {Number(monthlyBudget || 0).toLocaleString('vi-VN')} đ
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Wallet size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="number"
                    className="input"
                    style={{ paddingLeft: '38px', width: '100%', fontFamily: 'var(--font-mono)' }}
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    placeholder="10000000"
                    step="500000"
                    min="500000"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Account meta details */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} />
                <span>Ngày tham gia: <strong>{currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('vi-VN') : (currentUser.joinedDate || '2026-09-01')}</strong></span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--emerald-400)' }}>
                ID: {currentUser._id || currentUser.id}
              </span>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div style={{
            marginTop: '28px',
            paddingTop: '18px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* Logout button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="btn btn-secondary btn-sm"
              style={{
                color: '#fb7185',
                borderColor: 'rgba(244, 63, 94, 0.3)',
                padding: '8px 14px'
              }}
              title="Đăng xuất khỏi tài khoản này"
            >
              <LogOut size={15} />
              <span>Đăng xuất</span>
            </button>

            {/* Cancel & Save */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ minWidth: '140px' }}
              >
                {isSavedSuccess ? (
                  <>
                    <Check size={16} />
                    <span>Đã Lưu!</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Lưu Thay Đổi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
