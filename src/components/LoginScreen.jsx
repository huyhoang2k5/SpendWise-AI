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
  ArrowLeft
} from 'lucide-react';
import { authApi } from '../services/apiService';

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

  // Google OAuth Configuration & State
  const [googleClientId, setGoogleClientId] = useState(() => {
    return (
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      localStorage.getItem('spendwise_google_client_id') ||
      ''
    );
  });
  const [inputClientId, setInputClientId] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customEmail, setCustomEmail] = useState(() => localStorage.getItem('spendwise_last_gmail') || '');
  const [customName, setCustomName] = useState('');
  const [googleModalError, setGoogleModalError] = useState('');
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  // Kích hoạt popup Google OAuth 2.0 chính thức
  // Mở cửa sổ accounts.google.com để người dùng chọn tài khoản Google đang đăng nhập trên trình duyệt
  const triggerGoogleOAuth = (cid) => {
    const clientIdToUse = cid || googleClientId;
    if (!clientIdToUse) {
      setShowGoogleModal(true);
      return;
    }
    if (!window.google?.accounts?.oauth2) {
      setErrorMsg('Thư viện Google Identity Services chưa tải xong. Vui lòng thử lại sau vài giây.');
      return;
    }

    try {
      setIsConnectingGoogle(true);
      setErrorMsg('');
      setGoogleModalError('');

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientIdToUse,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse?.error) {
            setIsConnectingGoogle(false);
            setGoogleModalError(`Lỗi Google OAuth: ${tokenResponse.error_description || tokenResponse.error}`);
            setShowGoogleModal(true);
            return;
          }
          if (tokenResponse?.access_token) {
            try {
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const info = await userInfoRes.json();
              if (info.email) {
                localStorage.setItem('spendwise_last_gmail', info.email);
              }
              const { user } = await authApi.googleAuth({
                email: info.email,
                name: info.name || info.given_name || info.email.split('@')[0],
                avatar: info.picture || '',
                googleId: info.sub || ''
              });
              setShowGoogleModal(false);
              onLoginSuccess(user);
            } catch (err) {
              setGoogleModalError(err.message || 'Đăng nhập Google thất bại.');
              setShowGoogleModal(true);
            } finally {
              setIsConnectingGoogle(false);
            }
          }
        }
      });

      // Mở popup chọn tài khoản chính thức từ accounts.google.com
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      setIsConnectingGoogle(false);
      setGoogleModalError(err.message || 'Không thể mở popup Google.');
      setShowGoogleModal(true);
    }
  };

  const handleGoogleClick = () => {
    setErrorMsg('');
    setGoogleModalError('');
    if (googleClientId) {
      triggerGoogleOAuth(googleClientId);
    } else {
      setShowGoogleModal(true);
    }
  };

  const handleSaveClientIdAndLaunch = (e) => {
    e.preventDefault();
    const cleanId = inputClientId.trim();
    if (!cleanId) {
      setGoogleModalError('Vui lòng dán mã Google Client ID vào ô.');
      return;
    }
    localStorage.setItem('spendwise_google_client_id', cleanId);
    setGoogleClientId(cleanId);
    triggerGoogleOAuth(cleanId);
  };

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
      localStorage.setItem('spendwise_last_gmail', cleanEmail);
      setShowGoogleModal(false);
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

      {/* GOOGLE AUTHENTICATION MODAL */}
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
          <div style={{
            maxWidth: '500px',
            width: '100%',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'modalSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            maxHeight: '92vh'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 22px',
              borderBottom: '1px solid var(--border-subtle)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GoogleIcon size={22} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Đăng Nhập Bằng Google
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Kết nối tài khoản Google hoặc đăng nhập nhanh Gmail
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowGoogleModal(false); setGoogleModalError(''); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '22px', overflowY: 'auto' }}>
              {/* Error Banner */}
              {googleModalError && (
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
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{googleModalError}</span>
                </div>
              )}

              {/* Security / OAuth Explanation Banner */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                padding: '12px 14px',
                borderRadius: '10px',
                color: '#93c5fd',
                fontSize: '12.5px',
                lineHeight: '1.6',
                display: 'flex',
                gap: '10px',
                marginBottom: '20px'
              }}>
                <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#60a5fa' }} />
                <div>
                  <strong style={{ color: '#bfdbfe', display: 'block', marginBottom: '2px' }}>
                    Quy chuẩn bảo mật của Google & Trình duyệt:
                  </strong>
                  Để ứng dụng hiển thị bảng chọn tài khoản Google đang đăng nhập trên trình duyệt/thiết bị này (như CodeLearn, Shopee...), Google yêu cầu mã <strong>Google Client ID</strong> thông qua chuẩn OAuth 2.0.
                </div>
              </div>

              {/* CARD 1: GOOGLE CLIENT ID OAUTH */}
              <div style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: googleClientId ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} color={googleClientId ? 'var(--emerald-400)' : '#f59e0b'} />
                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      Mở cửa sổ chọn tài khoản Google thật
                    </span>
                  </div>
                  {googleClientId && (
                    <span style={{
                      fontSize: '11px',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--emerald-400)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: '600'
                    }}>
                      Đã kết nối
                    </span>
                  )}
                </div>

                {googleClientId ? (
                  <div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: '1.5' }}>
                      Client ID hiện tại: <code style={{ color: 'var(--emerald-400)', fontSize: '11px' }}>{googleClientId.slice(0, 22)}...</code>
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        className="google-auth-btn"
                        style={{ flex: 2 }}
                        onClick={() => triggerGoogleOAuth(googleClientId)}
                        disabled={isConnectingGoogle}
                      >
                        <GoogleIcon size={18} />
                        <span>{isConnectingGoogle ? 'Đang mở Google...' : 'Bật Popup Chọn Tài Khoản'}</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ flex: 1, fontSize: '12px' }}
                        onClick={() => {
                          localStorage.removeItem('spendwise_google_client_id');
                          setGoogleClientId('');
                        }}
                      >
                        Đổi ID
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveClientIdAndLaunch}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: '1.5' }}>
                      Dán mã Google Client ID từ Google Cloud Console vào đây:
                    </p>
                    <div style={{ marginBottom: '10px' }}>
                      <input
                        type="text"
                        className="input"
                        placeholder="VD: 123456789-abc.apps.googleusercontent.com"
                        value={inputClientId}
                        onChange={(e) => setInputClientId(e.target.value)}
                        style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="google-auth-btn"
                      disabled={isConnectingGoogle || !inputClientId.trim()}
                      style={{ width: '100%' }}
                    >
                      <GoogleIcon size={18} />
                      <span>{isConnectingGoogle ? 'Đang kết nối...' : 'Lưu & Bật Popup Chọn Tài Khoản'}</span>
                    </button>
                  </form>
                )}
              </div>

              {/* CARD 2: HOẶC ĐĂNG NHẬP NHANH BẰNG GMAIL */}
              <div style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Mail size={16} color="var(--emerald-400)" />
                  <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Hoặc đăng nhập nhanh bằng Gmail
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px', lineHeight: '1.5' }}>
                  Nhập địa chỉ Gmail của bạn để vào thẳng ứng dụng tức thì (không cần tạo Google Cloud):
                </p>

                <form onSubmit={handleCustomGoogleSubmit}>
                  <div style={{ marginBottom: '12px' }}>
                    <label className="label" style={{ fontSize: '12px' }}>Địa chỉ Gmail *</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="email"
                        className="input"
                        required
                        placeholder="VD: tenban@gmail.com"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        style={{ paddingLeft: '36px', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label className="label" style={{ fontSize: '12px' }}>Tên hiển thị (Tùy chọn)</label>
                    <div style={{ position: 'relative' }}>
                      <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        className="input"
                        placeholder="VD: Hoàng Nguyễn"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        style={{ paddingLeft: '36px', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{ width: '100%', padding: '10px' }}
                  >
                    <Sparkles size={16} />
                    <span>{isSubmitting ? 'Đang xử lý...' : 'Đăng Nhập Tức Thì Bằng Gmail'}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 22px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                🔒 Dữ liệu chi tiêu được lưu trữ riêng tư và bảo mật tuyệt đối cho từng tài khoản.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
