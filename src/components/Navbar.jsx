import React from 'react';
import { 
  ScanLine, 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Bot, 
  PlusCircle, 
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
  Settings
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
    { id: 'scanner', label: 'Quét hóa đơn AI', icon: ScanLine, highlight: true },
    { id: 'transactions', label: 'Lịch sử giao dịch', icon: Receipt },
    { id: 'budget', label: 'Ngân sách & Cảnh báo', icon: PieChart },
    { id: 'advisor', label: 'Trợ lý AI', icon: Bot }
  ];

  const getRoleIcon = (roleCode) => {
    switch(roleCode) {
      case 'student': return <GraduationCap size={12} color="#34d399" />;
      case 'office_worker': return <Briefcase size={12} color="#38bdf8" />;
      case 'family': return <Users size={12} color="#fbbf24" />;
      case 'small_business': return <Building2 size={12} color="#a78bfa" />;
      default: return <User size={12} color="#34d399" />;
    }
  };

  return (
    <header className="navbar-header" style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--surface-glass)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px',
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
          title="Về màn hình Tổng quan SpendWise AI"
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.35)',
            color: 'white',
            flexShrink: 0
          }}>
            <Wallet size={20} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span className="brand-name" style={{ 
              fontSize: '18px', 
              fontWeight: '800', 
              letterSpacing: '-0.5px',
              background: 'linear-gradient(120deg, #10b981, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap'
            }}>
              SpendWise AI
            </span>
            <span className="brand-badge" style={{
              fontSize: '10px',
              fontWeight: '700',
              padding: '1px 6px',
              borderRadius: '5px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap'
            }}>
              PRO
            </span>
          </div>
        </div>

        {/* Center Navigation Tabs (Modern Segmented Pill Dock) */}
        <nav className="navbar-center-nav" style={{ 
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
                className="nav-tab-btn"
                onClick={() => setCurrentTab(item.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '7px 13px',
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
                  flexShrink: 0,
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                <span className="nav-label" style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                {item.highlight && !isActive && (
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 6px #10b981',
                    marginLeft: '1px'
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* User Account / Profile Info Button */}
          <button
            onClick={openProfileModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '3px 10px 3px 5px',
              borderRadius: '9999px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              height: '36px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--emerald-500)';
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.background = 'var(--bg-secondary)';
            }}
            title="Nhấn để xem lại hoặc chỉnh sửa hồ sơ cá nhân"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
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
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              minWidth: 0,
              maxWidth: '105px',
              textAlign: 'left'
            }}>
              <span style={{
                fontSize: '12px',
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
                fontSize: '9.5px',
                color: 'var(--emerald-400)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                lineHeight: 1.15,
                whiteSpace: 'nowrap'
              }}>
                {getRoleIcon(currentUser?.roleCode)}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser?.role || 'Sinh viên'}
                </span>
              </span>
            </div>
            <Settings size={12} color="var(--text-muted)" style={{ flexShrink: 0, marginLeft: '1px' }} />
          </button>

          {/* Independent Logout Button */}
          <button
            onClick={onLogout}
            style={{
              padding: '0 10px',
              fontSize: '11.5px',
              fontWeight: '600',
              color: '#fb7185',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              height: '36px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.25)';
            }}
            title="Đăng xuất khỏi tài khoản cá nhân"
          >
            <LogOut size={13} />
            <span>Đăng xuất</span>
          </button>

          {/* Add Manual Expense Button */}
          <button
            onClick={openManualModal}
            className="btn btn-secondary btn-sm"
            style={{
              height: '36px',
              padding: '0 12px',
              fontSize: '12px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Thêm khoản chi thủ công"
          >
            <PlusCircle size={14} color="#34d399" />
            <span>Thêm chi tiêu</span>
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={openApiKeyModal}
            className="btn btn-secondary btn-sm"
            title="Cài đặt Gemini AI Key"
            style={{
              height: '36px',
              padding: '0 10px',
              fontSize: '11.5px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              position: 'relative',
              borderColor: hasApiKey ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)',
              background: hasApiKey ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-tertiary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Key size={13} color={hasApiKey ? '#34d399' : 'currentColor'} />
            <span>API Key</span>
            {hasApiKey && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 6px #10b981'
              }} />
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            style={{ 
              width: '36px',
              height: '36px',
              padding: 0,
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          >
            {theme === 'dark' ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#38bdf8" />}
          </button>
        </div>
      </div>
    </header>
  );
}
