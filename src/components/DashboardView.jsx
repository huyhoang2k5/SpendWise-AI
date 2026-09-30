import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Zap, 
  ArrowUpRight, 
  ScanLine, 
  Plus, 
  Clock, 
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  Sparkles,
  BarChart2
} from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { analyticsService } from '../services/analyticsService';
import MonthTransactionsModal from './MonthTransactionsModal';

export default function DashboardView({ 
  transactions, 
  monthlyBudget, 
  categoryBudgets, 
  onNavigateToTab, 
  openManualModal 
}) {
  const stats = analyticsService.calculateStats(transactions, monthlyBudget, categoryBudgets);
  const [activeCategoryKey, setActiveCategoryKey] = useState(null);
  const [timeHorizon, setTimeHorizon] = useState('day'); // 'day' | 'week' | 'month'
  const [isPrevMonthModalOpen, setIsPrevMonthModalOpen] = useState(false);
  const [selectedMonthPrefix, setSelectedMonthPrefix] = useState(() => stats.recentMonths?.[0]?.key || '2026-09');
  const [isCardDropdownOpen, setIsCardDropdownOpen] = useState(false);
  const cardDropdownRef = useRef(null);

  // Close card month dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardDropdownRef.current && !cardDropdownRef.current.contains(e.target)) {
        setIsCardDropdownOpen(false);
      }
    };
    if (isCardDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCardDropdownOpen]);

  // SVG Donut calculation
  const total = stats.totalSpent || 1;
  let accumulatedAngle = 0;
  const donutSlices = stats.categoryBreakdown
    .filter(cat => cat.amount > 0)
    .map(cat => {
      const sliceAngle = (cat.amount / total) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += sliceAngle;
      return {
        ...cat,
        startAngle,
        sliceAngle,
        endAngle: accumulatedAngle
      };
    });

  // Helper for SVG arc
  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }

  function describeArc(x, y, radius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  }

  // Dynamic weekly breakdown for current month (1-7, 8-14, 15-21, 22-end)
  const curMonthParts = (stats.currentMonthPrefix || '2026-10').split('-');
  const currentMonthNum = parseInt(curMonthParts[1], 10);
  const currentYearNum = parseInt(curMonthParts[0], 10);
  const daysInCurMonth = new Date(currentYearNum, currentMonthNum, 0).getDate();

  const weeklyData = [
    { label: `Tuần 1 (01-07/${currentMonthNum})`, amount: 0 },
    { label: `Tuần 2 (08-14/${currentMonthNum})`, amount: 0 },
    { label: `Tuần 3 (15-21/${currentMonthNum})`, amount: 0 },
    { label: `Tuần 4 (22-${daysInCurMonth}/${currentMonthNum})`, amount: 0 }
  ];

  transactions.forEach(t => {
    if (!t.date || !t.date.startsWith(stats.currentMonthPrefix)) return;
    const day = parseInt(t.date.split('-')[2], 10);
    const amt = Number(t.total) || 0;
    if (day <= 7) weeklyData[0].amount += amt;
    else if (day <= 14) weeklyData[1].amount += amt;
    else if (day <= 21) weeklyData[2].amount += amt;
    else weeklyData[3].amount += amt;
  });

  return (
    <div style={{ padding: '28px 0 60px' }}>
      {/* Top Banner: Greeting & Quick Scan Action */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '26px' }}>Bảng Thống Kê Tài Chính</h1>
            <span style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              fontWeight: '700'
            }}>
              {stats.currentMonthLabel}
            </span>
            <button
              onClick={() => setIsPrevMonthModalOpen(true)}
              style={{
                fontSize: '11px',
                padding: '3px 10px',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.22)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
              }}
              title="Nhấn vào để xem toàn bộ hóa đơn & giao dịch tháng trước (08/2026)"
            >
              <Calendar size={12} />
              <span>{stats.prevMonthLabel || 'Tháng trước'}: {analyticsService.formatCurrency(stats.prevMonthTotal)}</span>
              <ChevronRight size={12} />
            </button>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Phân tích tự động thói quen chi tiêu theo ngày, tuần và tháng từ các hóa đơn đã quét
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onNavigateToTab('scanner')}
            className="btn btn-primary"
          >
            <ScanLine size={17} />
            <span>Quét Hóa Đơn Ngay</span>
          </button>
          <button
            onClick={openManualModal}
            className="btn btn-secondary"
          >
            <Plus size={17} />
            <span>Thêm thủ công</span>
          </button>
        </div>
      </div>

      {/* AI Financial Health Score Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(99, 102, 241, 0.12))',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: '16px',
        padding: '18px 24px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '800',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
          }}>
            <span style={{ fontSize: '18px', lineHeight: 1 }}>{stats.healthScore}</span>
            <span style={{ fontSize: '9px', opacity: 0.85 }}>ĐIỂM</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '700', fontSize: '15px' }}>
                Đánh giá sức khỏe tài chính AI: {stats.healthScore >= 80 ? 'Rất tốt' : stats.healthScore >= 60 ? 'Cần chú ý' : 'Cảnh báo quá chi'}
              </span>
              <Sparkles size={16} color="#34d399" />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
              {stats.isOverBudget 
                ? '⚠️ Bạn đã vượt ngân sách tháng này! Hãy xem khuyến nghị từ Trợ lý AI để cân bằng lại chi tiêu.'
                : `Dự báo chi tiêu cuối tháng khoảng ${analyticsService.formatCurrency(stats.projectedMonthEnd)}, vẫn nằm trong hạn mức an toàn.`}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateToTab('advisor')}
          className="btn btn-outline btn-sm"
        >
          <span>Xem Lời Khuyên AI</span>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* 4 Core Financial KPI Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '18px',
        marginBottom: '28px',
        position: 'relative',
        zIndex: isCardDropdownOpen ? 80 : 2
      }}>
        {/* Card 1: Total Spent */}
        <div className="card" style={{ 
          padding: '20px',
          position: 'relative',
          zIndex: isCardDropdownOpen ? 90 : 1,
          overflow: 'visible'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              TỔNG CHI TIÊU THÁNG ({stats.currentMonthDisplay})
            </span>
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
              <Wallet size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
            {analyticsService.formatCurrency(stats.totalSpent)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span style={{ color: '#34d399', fontWeight: '600' }}>
              {stats.totalTransactions} giao dịch
            </span>
            <span>đã ghi nhận qua hóa đơn</span>
          </div>

          {/* 1 Single Button Dropdown: Chọn xem hóa đơn 3 tháng gần nhất */}
          {(() => {
            const currentSelectedMonthObj = (stats.recentMonths || []).find(m => m.key === selectedMonthPrefix) || stats.recentMonths?.[0] || {
              key: stats.prevMonthPrefix || '2026-09',
              label: stats.prevMonthLabel || 'Tháng 09/2026',
              shortLabel: stats.recentMonths?.[0]?.shortLabel || 'T09/2026',
              tag: 'Tháng trước',
              total: stats.prevMonthTotal,
              count: stats.prevMonthCount
            };

            return (
              <div ref={cardDropdownRef} style={{ 
                position: 'relative', 
                marginTop: '14px',
                zIndex: isCardDropdownOpen ? 100 : 1
              }}>
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Left Clickable Area: Click amount or label to open invoice modal directly */}
                  <div
                    onClick={() => {
                      setIsPrevMonthModalOpen(true);
                      setIsCardDropdownOpen(false);
                    }}
                    role="button"
                    tabIndex={0}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      flex: 1,
                      padding: '4px 0'
                    }}
                    title="Nhấn để mở danh sách toàn bộ hóa đơn tháng này"
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#34d399',
                      flexShrink: 0
                    }}>
                      <Calendar size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>Xem hóa đơn:</span>
                        <span style={{
                          fontSize: '9px',
                          fontWeight: '700',
                          padding: '0 4px',
                          borderRadius: '3px',
                          background: 'rgba(16, 185, 129, 0.25)',
                          color: '#6ee7b7'
                        }}>
                          {currentSelectedMonthObj.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#34d399' }}>
                        {currentSelectedMonthObj.shortLabel}
                      </div>
                    </div>
                  </div>

                  {/* Right Clickable Area: Total Amount & Dropdown Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div 
                      onClick={() => {
                        setIsPrevMonthModalOpen(true);
                        setIsCardDropdownOpen(false);
                      }}
                      role="button"
                      tabIndex={0}
                      style={{ textAlign: 'right', cursor: 'pointer' }}
                      title="Nhấn vào số tiền để xem chi tiết hóa đơn"
                    >
                      <div style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>
                        {analyticsService.formatCurrency(currentSelectedMonthObj.total)}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {currentSelectedMonthObj.count} HĐ • Xem ↗
                      </div>
                    </div>

                    {/* Dropdown Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCardDropdownOpen(prev => !prev);
                      }}
                      style={{
                        background: isCardDropdownOpen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid',
                        borderColor: isCardDropdownOpen ? 'var(--emerald-500)' : 'var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '4px 6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        cursor: 'pointer',
                        color: '#34d399',
                        fontSize: '10px',
                        fontWeight: '700'
                      }}
                      title="Chọn tháng 6, 7 hoặc 8"
                    >
                      <span>Tháng</span>
                      <ChevronDown 
                        size={13} 
                        style={{ 
                          transform: isCardDropdownOpen ? 'rotate(180deg)' : 'none', 
                          transition: 'transform 0.2s ease' 
                        }} 
                      />
                    </button>
                  </div>
                </div>

                {/* Dropdown Options Popup */}
                {isCardDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    minWidth: '280px',
                    background: '#131b2e',
                    border: '1.5px solid var(--emerald-500)',
                    borderRadius: '12px',
                    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 15px rgba(16, 185, 129, 0.25)',
                    zIndex: 9999,
                    overflow: 'hidden',
                    padding: '6px'
                  }}>
                    <div style={{
                      padding: '6px 10px 6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '1px solid var(--border-subtle)',
                      marginBottom: '4px'
                    }}>
                      Chọn 1 trong 3 tháng gần nhất để xem hóa đơn:
                    </div>
                    {(stats.recentMonths || []).map((m) => {
                      const isSelected = m.key === selectedMonthPrefix;
                      return (
                        <div
                          key={m.key}
                          onClick={() => {
                            setSelectedMonthPrefix(m.key);
                            setIsCardDropdownOpen(false);
                            setIsPrevMonthModalOpen(true);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background 0.15s ease',
                            background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                            margin: '2px 0'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '13px', fontWeight: isSelected ? '800' : '600', color: isSelected ? '#34d399' : 'var(--text-primary)' }}>
                                {m.label}
                              </span>
                              <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)' }}>
                                {m.tag}
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {m.count} hóa đơn đã ghi nhận
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: isSelected ? '#34d399' : 'var(--emerald-400)' }}>
                              {analyticsService.formatCurrency(m.total)}
                            </div>
                            <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: '700' }}>
                              Mở xem hóa đơn ↗
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Card 2: Remaining Budget */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              NGÂN SÁCH CÒN LẠI
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: stats.isOverBudget ? 'rgba(244, 63, 94, 0.15)' : 'rgba(14, 165, 233, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: stats.isOverBudget ? '#fb7185' : '#38bdf8'
            }}>
              {stats.isOverBudget ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
            </div>
          </div>
          <div style={{
            fontSize: '26px',
            fontWeight: '800',
            fontFamily: 'var(--font-mono)',
            marginBottom: '8px',
            color: stats.isOverBudget ? '#fb7185' : 'var(--text-primary)'
          }}>
            {analyticsService.formatCurrency(stats.remainingBudget)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              flex: 1,
              height: '6px',
              background: 'var(--bg-tertiary)',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, stats.percentSpent)}%`,
                background: stats.percentSpent > 90 ? '#f43f5e' : stats.percentSpent > 70 ? '#f59e0b' : '#10b981'
              }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
              {Math.round(stats.percentSpent)}%
            </span>
          </div>
        </div>

        {/* Card 3: Daily Average */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              TRUNG BÌNH MỖI NGÀY
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24'
            }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
            {analyticsService.formatCurrency(stats.dailyAverage)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Đỉnh điểm: {stats.peakDay ? `${analyticsService.formatCurrency(stats.peakDay.amount)} (${stats.peakDay.displayDate})` : 'Chưa có'}
          </div>
        </div>

        {/* Card 4: Top Category */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              NHÓM CHI CAO NHẤT
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a78bfa'
            }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>
            {stats.topCategory?.name || 'Chưa có'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <span style={{ fontWeight: '700', color: stats.topCategory?.color, fontFamily: 'var(--font-mono)' }}>
              {analyticsService.formatCurrency(stats.topCategory?.amount || 0)}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              ({Math.round(stats.topCategory?.percentOfTotal || 0)}% tổng chi)
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid-sidebar-main" style={{
        marginBottom: '28px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Left Chart: Interactive Donut Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
            Phân Bổ Chi Tiêu Theo Danh Mục
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Tỷ lệ phần trăm 6 nhóm chi tiêu trong tháng (Mục 4.3.3)
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '220px', height: '220px', marginBottom: '20px' }}>
              <svg width="220" height="220" viewBox="0 0 220 220">
                {/* Background Ring */}
                <circle cx="110" cy="110" r="80" fill="transparent" stroke="var(--bg-tertiary)" strokeWidth="26" />
                
                {/* Slices */}
                {donutSlices.map((slice, i) => {
                  const isHovered = activeCategoryKey === slice.key;
                  return (
                    <path
                      key={i}
                      d={describeArc(110, 110, 80, slice.startAngle, Math.min(slice.endAngle, 359.99))}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={isHovered ? 32 : 26}
                      strokeLinecap="round"
                      style={{
                        cursor: 'pointer',
                        transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                        opacity: activeCategoryKey && !isHovered ? 0.4 : 1
                      }}
                      onMouseEnter={() => setActiveCategoryKey(slice.key)}
                      onMouseLeave={() => setActiveCategoryKey(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Donut Label */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                  {activeCategoryKey 
                    ? stats.categoryBreakdown.find(c => c.key === activeCategoryKey)?.name 
                    : 'Tổng cộng'}
                </span>
                <span style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
                  {analyticsService.formatCurrency(
                    activeCategoryKey 
                      ? stats.categoryBreakdown.find(c => c.key === activeCategoryKey)?.amount || 0
                      : stats.totalSpent
                  )}
                </span>
              </div>
            </div>

            {/* Category Legend list */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stats.categoryBreakdown.map((cat) => (
                <div
                  key={cat.key}
                  onMouseEnter={() => setActiveCategoryKey(cat.key)}
                  onMouseLeave={() => setActiveCategoryKey(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: activeCategoryKey === cat.key ? 'var(--surface-hover)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color }} />
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{cat.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                      {analyticsService.formatCurrency(cat.amount)}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '35px', textAlign: 'right' }}>
                      {Math.round(cat.percentOfTotal)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Chart: Spending Timeline with Day / Week / Month switch (Mục 3.b) */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>
                  Biểu Đồ Chi Tiêu
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Phân tích chi tiêu theo Ngày / Tuần / Tháng (Mục 3.b)
                </p>
              </div>

              {/* Time Horizon Switcher */}
              <div style={{
                display: 'inline-flex',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                padding: '3px',
                border: '1px solid var(--border-subtle)'
              }}>
                <button
                  onClick={() => setTimeHorizon('day')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: timeHorizon === 'day' ? 'var(--emerald-500)' : 'transparent',
                    color: timeHorizon === 'day' ? 'white' : 'var(--text-secondary)',
                    fontWeight: timeHorizon === 'day' ? '700' : '500'
                  }}
                >
                  Theo Ngày
                </button>
                <button
                  onClick={() => setTimeHorizon('week')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: timeHorizon === 'week' ? 'var(--emerald-500)' : 'transparent',
                    color: timeHorizon === 'week' ? 'white' : 'var(--text-secondary)',
                    fontWeight: timeHorizon === 'week' ? '700' : '500'
                  }}
                >
                  Theo Tuần
                </button>
                <button
                  onClick={() => setTimeHorizon('month')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: timeHorizon === 'month' ? 'var(--emerald-500)' : 'transparent',
                    color: timeHorizon === 'month' ? 'white' : 'var(--text-secondary)',
                    fontWeight: timeHorizon === 'month' ? '700' : '500'
                  }}
                >
                  Theo Tháng
                </button>
              </div>
            </div>

            {/* Custom SVG Bar Chart */}
            <div style={{ width: '100%', height: '230px', position: 'relative', marginTop: '16px' }}>
              {timeHorizon === 'day' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  height: '190px',
                  gap: '8px',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '4px'
                }}>
                  {(() => {
                    const maxAmount = Math.max(...stats.dailyTimeline.map(d => d.amount), 1);
                    return stats.dailyTimeline.map((item, idx) => {
                      const heightPercent = (item.amount / maxAmount) * 100;
                      const isPeak = stats.peakDay && stats.peakDay.date === item.date;

                      return (
                        <div
                          key={idx}
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            height: '100%',
                            justifyContent: 'flex-end',
                            position: 'relative'
                          }}
                        >
                          <div style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: isPeak ? '#fb7185' : 'var(--text-secondary)',
                            fontFamily: 'var(--font-mono)',
                            marginBottom: '4px'
                          }}>
                            {Math.round(item.amount / 1000)}k
                          </div>
                          <div
                            style={{
                              width: '100%',
                              maxWidth: '32px',
                              height: `${Math.max(8, heightPercent)}%`,
                              background: isPeak 
                                ? 'linear-gradient(180deg, #f43f5e, #fb7185)' 
                                : 'linear-gradient(180deg, #10b981, #06b6d4)',
                              borderRadius: '6px 6px 0 0',
                              transition: 'height 0.4s ease'
                            }}
                            title={`${item.date}: ${analyticsService.formatCurrency(item.amount)}`}
                          />
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', whiteSpace: 'nowrap' }}>
                            {item.displayDate}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              {timeHorizon === 'week' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  height: '190px',
                  gap: '20px',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '4px'
                }}>
                  {(() => {
                    const maxW = Math.max(...weeklyData.map(w => w.amount), 1);
                    return weeklyData.map((wk, idx) => {
                      const h = (wk.amount / maxW) * 100;
                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                            {analyticsService.formatCurrency(wk.amount)}
                          </div>
                          <div
                            style={{
                              width: '100%',
                              maxWidth: '64px',
                              height: `${Math.max(10, h)}%`,
                              background: 'linear-gradient(180deg, #6366f1, #a855f7)',
                              borderRadius: '8px 8px 0 0'
                            }}
                          />
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                            {wk.label}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              {timeHorizon === 'month' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '10px',
                  alignItems: 'stretch',
                  height: '190px',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '8px'
                }}>
                  {/* Month 6, 7, 8 in chronological order: Month 6 -> Month 7 -> Month 8 */}
                  {[
                    ...(stats.recentMonths ? [...stats.recentMonths].reverse() : [
                      { key: '2026-06', label: 'Tháng 06/2026', shortLabel: 'T06/2026', tag: '3 tháng trước', total: 0, count: 0 },
                      { key: '2026-07', label: 'Tháng 07/2026', shortLabel: 'T07/2026', tag: '2 tháng trước', total: 0, count: 0 },
                      { key: '2026-08', label: 'Tháng 08/2026', shortLabel: 'T08/2026', tag: 'Tháng trước', total: stats.prevMonthTotal, count: stats.prevMonthCount }
                    ])
                  ].map((m) => (
                    <div
                      key={m.key}
                      onClick={() => {
                        setSelectedMonthPrefix(m.key);
                        setIsPrevMonthModalOpen(true);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '12px 10px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: '1px solid var(--border-subtle)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        transition: 'all 0.2s ease',
                        textAlign: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--emerald-500)';
                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      title={`Nhấn để xem toàn bộ ${m.count || 0} hóa đơn & chi tiêu ${m.label}`}
                    >
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <Calendar size={11} color="#34d399" />
                          <span>{m.shortLabel}</span>
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {m.tag}
                        </div>
                      </div>

                      <div style={{ fontSize: '15px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)', margin: '4px 0' }}>
                        {analyticsService.formatCurrency(m.total)}
                      </div>

                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px',
                        fontSize: '10px',
                        fontWeight: '700',
                        color: '#34d399',
                        background: 'rgba(16, 185, 129, 0.15)',
                        padding: '3px 6px',
                        borderRadius: '6px'
                      }}>
                        <span>👆 Xem {m.count || 0} HĐ</span>
                      </div>
                    </div>
                  ))}

                  {/* Current Month: Month 9 */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '12px 10px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(16, 185, 129, 0.4)',
                    background: 'rgba(16, 185, 129, 0.06)',
                    textAlign: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#34d399', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Sparkles size={12} color="#34d399" />
                        <span>T09/2026</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: '700', marginTop: '2px' }}>
                        Hiện tại
                      </div>
                    </div>

                    <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)', margin: '4px 0' }}>
                      {analyticsService.formatCurrency(stats.totalSpent)}
                    </div>

                    <div style={{
                      fontSize: '10px',
                      color: 'var(--text-secondary)',
                      background: 'rgba(255, 255, 255, 0.06)',
                      padding: '3px 6px',
                      borderRadius: '6px'
                    }}>
                      Tiêu {Math.round(stats.percentSpent)}% budget
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-tertiary)',
            padding: '12px 18px',
            borderRadius: '10px',
            marginTop: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <Zap size={16} color="#34d399" />
              <span>Dự báo tháng: <strong>{analyticsService.formatCurrency(stats.projectedMonthEnd)}</strong></span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--emerald-400)', fontWeight: '600' }}>
              {stats.projectedMonthEnd <= stats.monthlyBudget ? '✓ Trong ngân sách' : '⚠️ Nguy cơ vượt hạn mức'}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Scanned Receipts Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '700' }}>Hóa Đơn & Giao Dịch Gần Đây</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Các khoản chi được quét và trích xuất tự động bằng AI
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('transactions')}
            className="btn btn-secondary btn-sm"
          >
            <span>Xem tất cả ({transactions.length})</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '10px 14px' }}>Cửa hàng / Đơn vị</th>
                <th style={{ padding: '10px 14px' }}>Danh mục</th>
                <th style={{ padding: '10px 14px' }}>Ngày mua</th>
                <th style={{ padding: '10px 14px' }}>Mã HĐ</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((t) => {
                const cat = EXPENSE_CATEGORIES[t.category] || EXPENSE_CATEGORIES.other;
                return (
                  <tr 
                    key={t.id}
                    style={{ 
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '600' }}>{t.merchant}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {t.items?.length ? `${t.items.length} món: ${t.items.map(i => i.name).slice(0, 2).join(', ')}...` : 'Không có chi tiết'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge ${cat.badgeClass}`}>
                        {cat.name}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      {t.date} {t.time ? `• ${t.time}` : ''}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {t.invoiceNumber || '—'}
                    </td>
                    <td style={{ 
                      padding: '12px 14px', 
                      textAlign: 'right', 
                      fontWeight: '700', 
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--emerald-400)',
                      fontSize: '14px'
                    }}>
                      {analyticsService.formatCurrency(t.total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Month Invoices & Transactions Detail Modal (Supports Dynamic Rolling Months) */}
      <MonthTransactionsModal
        isOpen={isPrevMonthModalOpen}
        onClose={() => setIsPrevMonthModalOpen(false)}
        monthPrefix={selectedMonthPrefix}
        monthName={
          stats.recentMonths?.find(m => m.key === selectedMonthPrefix)?.label || 'Tháng Chi Tiêu'
        }
        transactions={transactions}
        currentMonthTotal={stats.totalSpent}
        recentMonths={stats.recentMonths}
      />
    </div>
  );
}
