import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus, 
  Wallet, 
  AlertCircle,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Users,
  Building2,
  Upload,
  Camera,
  Check,
  X,
  Sparkles,
  ArrowLeft,
  Minus,
  Square,
  ChevronDown
} from 'lucide-react';
import { authApi } from '../services/apiService';

/**
 * Danh sách tài khoản Google mặc định (Khớp chính xác ảnh tài khoản Chrome của người dùng)
 */
const DEFAULT_GOOGLE_ACCOUNTS = [
  {
    id: '1',
    name: 'H H',
    email: 'lnhhoang2k5@gmail.com',
    initial: 'H',
    bg: '#004d40',
    color: '#4db6ac'
  },
  {
    id: '2',
    name: 'ngọc Bảo',
    email: 'lebaongoccute29092009@gmail.com',
    initial: 'n',
    bg: '#c5221f',
    color: '#ffffff'
  },
  {
    id: '3',
    name: 'Hoàng Hoàng',
    email: 'huyhoang2k555@gmail.com',
    initial: 'H',
    bg: '#4a2c11',
    color: '#f6bf26'
  }
];

/**
 * Official Google 4-Color 'G' SVG
 */
export function GoogleIcon({ size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, display: 'block' }}>
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function LoginScreen({ onLoginSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Registration form fields
  const [regUsername, setRegUsername] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Sinh viên');
  const [regBudget, setRegBudget] = useState('6500000');
  const [regAvatar, setRegAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
  const [isCustomRegAvatar, setIsCustomRegAvatar] = useState(false);

  // Google Account Chooser modal state
  const [googleAccounts, setGoogleAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('spendwise_saved_google_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_GOOGLE_ACCOUNTS;
  });

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isOtherAccountMode, setIsOtherAccountMode] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [googleModalError, setGoogleModalError] = useState('');
  const [activeAccountEmail, setActiveAccountEmail] = useState('');

  const handleGoogleClick = () => {
    setErrorMsg('');
    setGoogleModalError('');
    setIsOtherAccountMode(false);
    setShowGoogleModal(true);
  };

  const handleGoogleCredentialResponse = async (response) => {
    try {
      setIsSubmitting(true);
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      const { user } = await authApi.googleAuth({
        email: payload.email,
        name: payload.name || payload.given_name || payload.email.split('@')[0],
        avatar: payload.picture || '',
        googleId: payload.sub
      });
      setShowGoogleModal(false);
      onLoginSuccess(user);
    } catch (err) {
      setErrorMsg(err.message || 'Đăng nhập Google thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Người dùng chọn 1 tài khoản có sẵn trong danh sách Google (như trong ảnh)
  const handleSelectGoogleAccount = async (acc) => {
    setActiveAccountEmail(acc.email);
    setIsSubmitting(true);
    setGoogleModalError('');
    try {
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${acc.email}`;
      const { user } = await authApi.googleAuth({
        email: acc.email,
        name: acc.name,
        avatar: avatarUrl,
        googleId: ''
      });
      setShowGoogleModal(false);
      onLoginSuccess(user);
    } catch (err) {
      setGoogleModalError(err.message || 'Đăng nhập Google thất bại.');
    } finally {
      setIsSubmitting(false);
      setActiveAccountEmail('');
    }
  };

  // Người dùng chọn "Sử dụng một tài khoản khác" và nhập Gmail
  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    setGoogleModalError('');
    const cleanEmail = customEmail.trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setGoogleModalError('Vui lòng nhập địa chỉ Gmail / Email hợp lệ (VD: tenban@gmail.com)');
      return;
    }
    const cleanName = customName.trim() || cleanEmail.split('@')[0];

    setIsSubmitting(true);
    try {
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`;
      const { user } = await authApi.googleAuth({
        email: cleanEmail,
        name: cleanName,
        avatar: avatarUrl,
        googleId: ''
      });

      // Lưu tài khoản mới vào danh sách tài khoản cho các lần sau
      setGoogleAccounts((prev) => {
        if (!prev.some((a) => a.email.toLowerCase() === cleanEmail)) {
          const colors = [
            { bg: '#004d40', color: '#4db6ac' },
            { bg: '#1a73e8', color: '#ffffff' },
            { bg: '#9c27b0', color: '#ffffff' },
            { bg: '#e65100', color: '#ffffff' }
          ];
          const c = colors[prev.length % colors.length];
          const newAcc = {
            id: String(Date.now()),
            name: cleanName,
            email: cleanEmail,
            initial: cleanName[0].toUpperCase(),
            bg: c.bg,
            color: c.color
          };
          const updated = [...prev, newAcc];
          localStorage.setItem('spendwise_saved_google_accounts', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });

      setShowGoogleModal(false);
      setIsOtherAccountMode(false);
      setCustomEmail('');
      setCustomName('');
      onLoginSuccess(user);
    } catch (err) {
      setGoogleModalError(err.message || 'Đăng nhập Google thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const { user } = await authApi.login(username, password);
      onLoginSuccess(user);
    } catch (err) {
      setErrorMsg(err.message || 'Đăng nhập thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chọn một tệp hình ảnh hợp lệ!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 320;
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
        const compressed = canvas.toDataURL('image/jpeg', 0.88);
        setRegAvatar(compressed);
        setIsCustomRegAvatar(true);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regUsername.trim() || !regName.trim() || !regPassword) {
      setErrorMsg('Vui lòng điền Tên đăng nhập, Họ tên và Mật khẩu!');
      return;
    }

    setIsSubmitting(true);
    try {
      const roleCode = (() => {
        const r = regRole.toLowerCase();
        if (r.includes('sinh viên') || r.includes('student')) return 'student';
        if (r.includes('văn phòng') || r.includes('office')) return 'office_worker';
        if (r.includes('gia đình') || r.includes('family')) return 'family';
        if (r.includes('kinh doanh') || r.includes('business')) return 'small_business';
        return 'other';
      })();

      const { user } = await authApi.register({
        username: regUsername,
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        roleCode,
        monthlyBudget: Number(regBudget) || 10000000,
        avatar: regAvatar
      });
      onLoginSuccess(user);
    } catch (err) {
      setErrorMsg(err.message || 'Đăng ký thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (roleCode) => {
    switch(roleCode) {
      case 'student': return <GraduationCap size={13} color="#34d399" />;
      case 'office_worker': return <Briefcase size={13} color="#38bdf8" />;
      case 'family': return <Users size={13} color="#fbbf24" />;
      case 'small_business': return <Building2 size={13} color="#a78bfa" />;
      default: return <User size={13} color="#34d399" />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px 20px',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #10b981, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 0 25px rgba(16, 185, 129, 0.45)',
          color: 'white'
        }}>
          <Wallet size={32} />
        </div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '800',
          letterSpacing: '-0.5px',
          marginBottom: '6px',
          background: 'linear-gradient(120deg, #10b981, #22d3ee)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          SpendWise AI
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
          "Chụp một hóa đơn – Hiểu cả thói quen chi tiêu"
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
          Ứng dụng quản lý tài chính cá nhân thông minh bằng AI
        </p>
      </div>

      {/* Main Login Card */}
      <div className="card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '0',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Tab switch */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-tertiary)'
        }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '14px 10px',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === 'login' ? '2px solid var(--emerald-500)' : '2px solid transparent',
              color: tab === 'login' ? 'var(--emerald-400)' : 'var(--text-secondary)',
              fontWeight: tab === 'login' ? '700' : '500',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <LogIn size={16} />
            <span>Đăng Nhập</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '14px 10px',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === 'register' ? '2px solid var(--emerald-500)' : '2px solid transparent',
              color: tab === 'register' ? 'var(--emerald-400)' : 'var(--text-secondary)',
              fontWeight: tab === 'register' ? '700' : '500',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <UserPlus size={16} />
            <span>Đăng Ký Tài Khoản</span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '26px' }}>
          {/* Privacy Guarantee Note */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '10px 12px',
            borderRadius: '8px',
            color: '#34d399',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '18px'
          }}>
            <ShieldCheck size={16} style={{ flexShrink: 0 }} />
            <span>Dữ liệu chi tiêu được lưu trữ riêng tư cho từng tài khoản, không bị xem chung.</span>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              padding: '10px 14px',
              borderRadius: '8px',
              color: '#fb7185',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <div>
              {/* Google Button - Pixel-perfect to user's screenshot */}
              <div style={{ marginBottom: '18px' }}>
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  className="google-auth-btn"
                  disabled={isSubmitting}
                  title="Đăng nhập nhanh bằng tài khoản Google"
                >
                  <GoogleIcon size={20} />
                  <span>Log in with Google</span>
                </button>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginTop: '8px'
                }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    ⚡ Đăng nhập nhanh 1 chạm bằng tài khoản Gmail
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '18px',
                gap: '12px'
              }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>
                  HOẶC DÙNG TÊN ĐĂNG NHẬP
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              </div>

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="label">Tên đăng nhập</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="input"
                      style={{ paddingLeft: '38px', fontFamily: 'var(--font-mono)' }}
                      required
                      placeholder="Nhập tên đăng nhập"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="label" style={{ margin: 0 }}>Mật khẩu</label>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input"
                      style={{ paddingLeft: '38px', paddingRight: '38px' }}
                      required
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: '16px' }} disabled={isSubmitting}>
                  <LogIn size={18} />
                  <span>{isSubmitting ? 'Đang đăng nhập...' : 'Đăng Nhập Vào Sổ Chi Tiêu'}</span>
                </button>

                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Chưa có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => { setTab('register'); setErrorMsg(''); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--emerald-400)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '13px',
                        padding: 0
                      }}
                    >
                      Đăng ký tài khoản mới
                    </button>
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* REGISTER FORM */}
          {tab === 'register' && (
            <div>
              {/* Google Button - Pixel-perfect to user's screenshot */}
              <div style={{ marginBottom: '18px' }}>
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  className="google-auth-btn"
                  disabled={isSubmitting}
                  title="Đăng ký & kết nối nhanh với tài khoản Google"
                >
                  <GoogleIcon size={20} />
                  <span>Log in with Google</span>
                </button>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginTop: '8px'
                }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    ⚡ Đăng ký & kết nối ngay bằng tài khoản Gmail
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '18px',
                gap: '12px'
              }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>
                  HOẶC ĐĂNG KÝ BẰNG FORM
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              </div>

              <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '14px' }}>
                  <label className="label">Tên đăng nhập * (Dùng để đăng nhập)</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="input"
                      style={{ paddingLeft: '38px', fontFamily: 'var(--font-mono)' }}
                      required
                      placeholder="VD: hoang_nguyen (viết liền không dấu)"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid-2col" style={{ marginBottom: '14px' }}>
                  <div>
                    <label className="label">Họ và tên *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="VD: Nguyễn Văn Hoàng"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="label">Gmail / Email liên hệ (Tùy chọn)</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="VD: hoang@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="label">Mật khẩu bảo vệ *</label>
                  <input
                    type="password"
                    className="input"
                    required
                    placeholder="Tạo mật khẩu cho tài khoản"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>

                {/* Avatar Upload for Registration */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '16px'
                }}>
                  <input
                    type="file"
                    id="reg-avatar-upload"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    style={{ display: 'none' }}
                    onChange={handleRegAvatarUpload}
                  />
                  <label 
                    htmlFor="reg-avatar-upload" 
                    style={{ position: 'relative', cursor: 'pointer' }}
                    title="Nhấn để tải ảnh đại diện từ máy tính"
                  >
                    <img
                      src={regAvatar}
                      alt="Avatar"
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--emerald-500)',
                        boxShadow: '0 0 10px rgba(16, 185, 129, 0.25)'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'var(--emerald-500)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px'
                    }}>
                      <Camera size={10} />
                    </div>
                  </label>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        Ảnh Đại Diện Cá Nhân
                      </span>
                      {isCustomRegAvatar && (
                        <span className="badge badge-food" style={{ fontSize: '9px', padding: '1px 5px' }}>
                          Đã tải ảnh riêng
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 6px' }}>
                      Tải file ảnh từ máy của bạn hoặc dùng ảnh mặc định
                    </p>
                    <label
                      htmlFor="reg-avatar-upload"
                      className="btn btn-secondary btn-sm"
                      style={{
                        padding: '3px 8px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Upload size={12} />
                      <span>Tải ảnh từ máy tính</span>
                    </label>
                  </div>
                </div>

                <div className="grid-2col" style={{ marginBottom: '14px' }}>
                  <div>
                    <label className="label">Nhóm đối tượng (Gõ tay tùy ý)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="VD: Sinh viên, Bác sĩ..."
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Ngân sách tháng</label>
                    <input
                      type="number"
                      className="input"
                      value={regBudget}
                      onChange={(e) => setRegBudget(e.target.value)}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                </div>

                {/* Quick role suggestions */}
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>
                    Gợi ý nhanh (nhấp để chọn hoặc tự do gõ ở trên):
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['Sinh viên', 'Người đi làm', 'Hộ gia đình', 'Kinh doanh nhỏ', 'Freelancer'].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setRegRole(sug)}
                        style={{
                          padding: '2px 7px',
                          borderRadius: '5px',
                          fontSize: '10.5px',
                          border: regRole === sug ? '1px solid var(--emerald-400)' : '1px solid var(--border-subtle)',
                          background: regRole === sug ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
                          color: regRole === sug ? 'var(--emerald-400)' : 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={isSubmitting}>
                  <UserPlus size={18} />
                  <span>{isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản & Bắt Đầu Sử Dụng'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* GOOGLE ACCOUNT CHOOSER POPUP (Chính xác theo giao diện Google Chrome người dùng cung cấp) */}
      {showGoogleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          {/* Chrome Popup Window Frame */}
          <div style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: '#1f1f1f',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 65px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'modalSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            maxHeight: '92vh'
          }}>
            {/* 1. Chrome Window Titlebar */}
            <div style={{
              height: '36px',
              backgroundColor: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px',
              borderBottom: '1px solid #2d2d2d',
              userSelect: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <GoogleIcon size={14} />
                <span style={{ fontSize: '12px', color: '#c4c7c5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Đăng nhập - Tài khoản Google - Google Chrome
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#9aa0a6',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Đóng cửa sổ"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* 2. Chrome URL Bar */}
            <div style={{
              padding: '6px 12px',
              backgroundColor: '#262626',
              borderBottom: '1px solid #333333',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                flex: 1,
                backgroundColor: '#191919',
                borderRadius: '20px',
                padding: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid #3c4043'
              }}>
                <Lock size={12} color="#9aa0a6" />
                <span style={{ fontSize: '11.5px', color: '#c4c7c5', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  accounts.google.com/v3/signin/accountchooser?client_id=16523143533...
                </span>
              </div>
            </div>

            {/* 3. Window Body */}
            <div style={{
              backgroundColor: '#131314',
              padding: '24px 20px 18px',
              overflowY: 'auto'
            }}>
              {/* Inner Google Account Card */}
              <div style={{
                backgroundColor: '#1e1f20',
                border: '1px solid #3c4043',
                borderRadius: '24px',
                padding: '28px 24px',
                color: '#e3e3e3'
              }}>
                {/* Brand row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <GoogleIcon size={18} />
                  <span style={{ fontSize: '13.5px', fontWeight: '500', color: '#e3e3e3' }}>
                    Đăng nhập bằng Google
                  </span>
                </div>

                {/* Error Banner */}
                {googleModalError && (
                  <div style={{
                    background: 'rgba(244, 63, 94, 0.15)',
                    border: '1px solid rgba(244, 63, 94, 0.35)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    color: '#fb7185',
                    fontSize: '12.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <AlertCircle size={15} />
                    <span>{googleModalError}</span>
                  </div>
                )}

                {!isOtherAccountMode ? (
                  /* LIST OF SIGNED-IN GOOGLE ACCOUNTS (As in the photo) */
                  <div>
                    <h2 style={{
                      fontSize: '26px',
                      fontWeight: '400',
                      color: '#ffffff',
                      margin: '0 0 6px',
                      letterSpacing: '-0.3px',
                      fontFamily: '"Google Sans", Roboto, sans-serif'
                    }}>
                      Chọn tài khoản
                    </h2>
                    <p style={{ fontSize: '14px', color: '#c4c7c5', margin: '0 0 20px' }}>
                      Tiếp tục tới <span style={{ color: '#8ab4f8', fontWeight: '500' }}>SpendWise AI</span>
                    </p>

                    {/* Account Rows */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {googleAccounts.map((acc) => {
                        const isThisLoading = isSubmitting && activeAccountEmail === acc.email;
                        return (
                          <div
                            key={acc.email}
                            onClick={() => !isSubmitting && handleSelectGoogleAccount(acc)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '14px',
                              padding: '12px 10px',
                              borderBottom: '1px solid #333538',
                              cursor: isSubmitting ? 'not-allowed' : 'pointer',
                              borderRadius: '8px',
                              transition: 'background 0.15s ease',
                              backgroundColor: isThisLoading ? 'rgba(138, 180, 248, 0.1)' : 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSubmitting) e.currentTarget.style.backgroundColor = '#2a2b2d';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSubmitting) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {/* Avatar Badge */}
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: acc.bg,
                              color: acc.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px',
                              fontWeight: '600',
                              flexShrink: 0
                            }}>
                              {acc.initial}
                            </div>

                            {/* Name & Email */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#e3e3e3',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {acc.name}
                              </div>
                              <div style={{
                                fontSize: '12.5px',
                                color: '#9aa0a6',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {acc.email}
                              </div>
                            </div>

                            {isThisLoading && (
                              <span style={{ fontSize: '12px', color: '#8ab4f8' }}>
                                Đang vào...
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {/* Row 4: Sử dụng một tài khoản khác */}
                      <div
                        onClick={() => {
                          if (!isSubmitting) {
                            setGoogleModalError('');
                            setIsOtherAccountMode(true);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '13px 10px',
                          borderBottom: '1px solid #333538',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#2a2b2d';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          border: '1px solid #5f6368',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <User size={18} color="#9aa0a6" />
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#e3e3e3' }}>
                          Sử dụng một tài khoản khác
                        </div>
                      </div>
                    </div>

                    {/* Disclaimer text */}
                    <p style={{
                      fontSize: '12px',
                      color: '#9aa0a6',
                      lineHeight: '1.6',
                      marginTop: '24px',
                      marginBottom: 0
                    }}>
                      Trước khi sử dụng SpendWise AI, bạn có thể xem{' '}
                      <span style={{ color: '#8ab4f8', cursor: 'pointer' }}>Chính sách quyền riêng tư</span>{' '}
                      và{' '}
                      <span style={{ color: '#8ab4f8', cursor: 'pointer' }}>Điều khoản dịch vụ</span>{' '}
                      của ứng dụng này.
                    </p>
                  </div>
                ) : (
                  /* "SỬ DỤNG MỘT TÀI KHOẢN KHÁC" VIEW */
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsOtherAccountMode(false)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#8ab4f8',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: 0,
                        marginBottom: '16px'
                      }}
                    >
                      <ArrowLeft size={16} />
                      <span>Quay lại danh sách tài khoản</span>
                    </button>

                    <h2 style={{
                      fontSize: '24px',
                      fontWeight: '400',
                      color: '#ffffff',
                      margin: '0 0 6px',
                      fontFamily: '"Google Sans", Roboto, sans-serif'
                    }}>
                      Đăng nhập tài khoản khác
                    </h2>
                    <p style={{ fontSize: '13.5px', color: '#c4c7c5', margin: '0 0 18px' }}>
                      Nhập địa chỉ Gmail để tiếp tục tới SpendWise AI
                    </p>

                    <form onSubmit={handleCustomGoogleSubmit}>
                      <div style={{ marginBottom: '14px' }}>
                        <label className="label" style={{ color: '#c4c7c5' }}>Email hoặc số điện thoại *</label>
                        <div style={{ position: 'relative' }}>
                          <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9aa0a6' }} />
                          <input
                            type="email"
                            className="input"
                            style={{
                              paddingLeft: '38px',
                              backgroundColor: '#131314',
                              borderColor: '#3c4043',
                              color: '#ffffff',
                              fontFamily: 'var(--font-mono)'
                            }}
                            required
                            placeholder="VD: yourname@gmail.com"
                            value={customEmail}
                            onChange={(e) => setCustomEmail(e.target.value)}
                            autoFocus
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <label className="label" style={{ color: '#c4c7c5' }}>Họ và tên của bạn (Tùy chọn)</label>
                        <div style={{ position: 'relative' }}>
                          <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9aa0a6' }} />
                          <input
                            type="text"
                            className="input"
                            style={{
                              paddingLeft: '38px',
                              backgroundColor: '#131314',
                              borderColor: '#3c4043',
                              color: '#ffffff'
                            }}
                            placeholder="VD: Nguyễn Văn Hoàng"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setIsOtherAccountMode(false)}
                          disabled={isSubmitting}
                          style={{
                            backgroundColor: 'transparent',
                            borderColor: '#3c4043',
                            color: '#8ab4f8'
                          }}
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSubmitting}
                          style={{
                            backgroundColor: '#8ab4f8',
                            color: '#062e6f',
                            fontWeight: '600'
                          }}
                        >
                          {isSubmitting ? 'Đang xác thực...' : 'Tiếp theo'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* 4. Chrome Footer (Outside Card) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 8px 4px',
                fontSize: '12px',
                color: '#9aa0a6',
                userSelect: 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <span>Tiếng Việt</span>
                  <ChevronDown size={14} />
                </div>
                <div style={{ display: 'flex', gap: '18px' }}>
                  <span style={{ cursor: 'pointer' }}>Trợ giúp</span>
                  <span style={{ cursor: 'pointer' }}>Quyền riêng tư</span>
                  <span style={{ cursor: 'pointer' }}>Điều khoản</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
