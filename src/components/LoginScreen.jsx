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
  Check
} from 'lucide-react';
import { authApi } from '../services/apiService';


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
          )}

          {/* REGISTER FORM */}
          {tab === 'register' && (
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
          )}
        </div>
      </div>
    </div>
  );
}
