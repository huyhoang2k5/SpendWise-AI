import React from 'react';
import { 
  ScanLine, 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Bot, 
  Plus, 
  Moon, 
  Sun, 
  Key, 
  Wallet, 
  User, 
  GraduationCap, 
  Briefcase, 
  Users, 
  Building2, 
  LogOut, 
  Settings,
  PlusCircle
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  theme, 
  toggleTheme, 
  openApiKeyModal, 
  openManualModal, 
  openProfileModal, 
  onLogout, 
  currentUser, 
  hasApiKey 
}) {
  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'transactions', label: 'Lịch sử', icon: Receipt },
    { id: 'scanner', label: 'Quét AI', icon: ScanLine, highlight: true },
    { id: 'budget', label: 'Ngân sách', icon: PieChart },
    { id: 'advisor', label: 'Trợ lý AI', icon: Bot }
  ];

  const getRoleIcon = (roleCode) => {
    switch (roleCode) {
      case 'student': return <GraduationCap size={12} color="#34d399" />;
      case 'office_worker': return <Briefcase size={12} color="#38bdf8" />;
      case 'family': return <Users size={12} color="#fbbf24" />;
      case 'small_business': return <Building2 size={12} color="#a78bfa" />;
      default: return <User size={12} color="#34d399" />;
    }
  };

  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  return (
    <>
      {/* ═════════════════════════════════════════════════════════════════════
          TOP HEADER (Cả Desktop và Mobile, tự co giãn cực chuẩn)
      ══════════════════════════════════════════════════════════════════════ */}
      <header className="navbar-header" style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        paddingTop: 'env(safe-area-inset-top, 0px)'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
          padding: '0 16px',
          gap: '12px'
        }}>
          {/* Brand */}
          <div 
            onClick={() => setCurrentTab('dashboard')} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: 'pointer',
              flexShrink: 0,
              userSelect: 'none'
            }}
            title="SpendWise AI"
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(16, 185, 129, 0.4)',
              color: 'white',
              flexShrink: 0
            }}>
              <Wallet size={18} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ 
                fontSize: '17px', 
                fontWeight: '800', 
                letterSpacing: '-0.4px',
                background: 'linear-gradient(120deg, #10b981, #22d3ee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                whiteSpace: 'nowrap'
              }}>
                SpendWise AI
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Ẩn trên Mobile) */}
          <nav className="navbar-desktop-nav" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            background: 'var(--bg-tertiary)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            flexShrink: 0
          }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    background: isActive 
                      ? (item.highlight ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(16, 185, 129, 0.15)')
                      : 'transparent',
                    color: isActive 
                      ? (item.highlight ? '#ffffff' : '#34d399')
                      : 'var(--text-secondary)',
                    border: isActive && !item.highlight ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
                    boxShadow: isActive && item.highlight ? '0 4px 12px rgba(16, 185, 129, 0.35)' : 'none',
                    fontSize: '13px',
                    fontWeight: isActive ? '700' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    lineHeight: '1',
                    userSelect: 'none'
                  }}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Quick Add Expense Button */}
            <button
              onClick={openManualModal}
              className="btn btn-secondary btn-sm navbar-top-btn"
              style={{
                height: '34px',
                padding: '0 10px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Thêm khoản chi"
            >
              <Plus size={15} color="#34d399" />
              <span className="desktop-only-text">Thêm</span>
            </button>

            {/* API Key Modal Button */}
            <button
              onClick={openApiKeyModal}
              className="btn btn-secondary btn-sm navbar-top-btn"
              title="Cài đặt Gemini AI API Key"
              style={{
                height: '34px',
                padding: '0 9px',
                fontSize: '11.5px',
                fontWeight: '600',
                position: 'relative',
                borderColor: hasApiKey ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)',
                background: hasApiKey ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-tertiary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Key size={14} color={hasApiKey ? '#34d399' : 'currentColor'} />
              <span className="desktop-only-text">API Key</span>
              {hasApiKey && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 6px #10b981'
                }} />
              )}
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn btn-secondary btn-sm navbar-top-btn"
              style={{ 
                width: '34px',
                height: '34px',
                padding: 0,
                borderRadius: '9px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            >
              {theme === 'dark' ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#38bdf8" />}
            </button>

            {/* User Profile Pill / Button */}
            <button
              onClick={openProfileModal}
              className="navbar-avatar-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '3px 8px 3px 4px',
                borderRadius: '9999px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                height: '34px',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              title="Hồ sơ tài khoản & Đăng xuất"
            >
              <img
                src={currentUser?.avatar || defaultAvatar}
                alt="Avatar"
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '1.5px solid var(--emerald-400)'
                }}
              />
              <div className="desktop-only-user" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                maxWidth: '90px',
                textAlign: 'left'
              }}>
                <span style={{
                  fontSize: '11.5px',
                  fontWeight: '700',
                  lineHeight: 1.15,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%'
                }}>
                  {currentUser?.name || 'Tài khoản'}
                </span>
                <span style={{
                  fontSize: '9px',
                  color: 'var(--emerald-400)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  lineHeight: 1.15,
                  whiteSpace: 'nowrap'
                }}>
                  {getRoleIcon(currentUser?.roleCode)}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser?.role || 'Sinh viên'}
                  </span>
                </span>
              </div>
              <Settings size={12} color="var(--text-muted)" className="desktop-only-user" />
            </button>

            {/* Logout Button (Desktop only) */}
            <button
              onClick={onLogout}
              className="desktop-only-logout"
              style={{
                padding: '0 9px',
                fontSize: '11px',
                fontWeight: '600',
                color: '#fb7185',
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                height: '34px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
              title="Đăng xuất"
            >
              <LogOut size={13} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════════════════
          BOTTOM MOBILE NAVIGATION DOCK (Chuyên dụng cho Điện Thoại)
      ══════════════════════════════════════════════════════════════════════ */}
      <nav className="mobile-bottom-dock">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const isScanner = item.id === 'scanner';

          if (isScanner) {
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className="mobile-dock-btn mobile-dock-center-action"
                title="Quét hóa đơn bằng Camera AI"
              >
                <div className="mobile-dock-scanner-circle">
                  <Icon size={22} color="#ffffff" />
                </div>
                <span className="mobile-dock-label" style={{ color: isActive ? '#34d399' : 'var(--text-secondary)', fontWeight: '700' }}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`mobile-dock-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span className="mobile-dock-label">{item.label}</span>
              {isActive && <div className="mobile-dock-active-dot" />}
            </button>
          );
        })}
      </nav>
    </>
  );
}
