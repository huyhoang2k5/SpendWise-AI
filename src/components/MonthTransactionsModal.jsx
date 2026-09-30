import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, 
  Calendar, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronDown, 
  ChevronUp, 
  Store, 
  CreditCard, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Printer, 
  Download, 
  Layers, 
  ShoppingBag,
  Sparkles,
  Receipt
} from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { analyticsService } from '../services/analyticsService';

const getFallbackRecentMonths = () => {
  return analyticsService.getRollingRecentMonths(analyticsService.getCurrentMonthKey(), 3);
};

export default function MonthTransactionsModal({
  isOpen,
  onClose,
  monthPrefix = '2026-08',
  monthName = 'Tháng 08/2026',
  transactions = [],
  currentMonthTotal = 0,
  recentMonths = []
}) {
  const dynamicMonths = (recentMonths && recentMonths.length > 0) ? recentMonths : getFallbackRecentMonths();
  const [activeMonthKey, setActiveMonthKey] = useState(monthPrefix || dynamicMonths[0]?.key);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [expandedId, setExpandedId] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsMonthDropdownOpen(false);
      }
    };
    if (isMonthDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMonthDropdownOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isMonthDropdownOpen) {
          setIsMonthDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isMonthDropdownOpen]);

  // Sync active month when monthPrefix prop changes or modal opens
  useEffect(() => {
    if (monthPrefix) {
      setActiveMonthKey(monthPrefix);
    }
  }, [monthPrefix, isOpen]);

  // Reset filters when active month changes or opened
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedCategory('all');
      setSelectedSort('newest');
      setExpandedId(null);
    }
  }, [isOpen, activeMonthKey]);

  // Calculate 3-month overview for switcher buttons
  const monthsOverview = useMemo(() => {
    return dynamicMonths.map(m => {
      const mTx = transactions.filter(t => t.date && t.date.startsWith(m.key));
      const total = mTx.reduce((sum, t) => sum + (Number(t.total) || 0), 0);
      return {
        ...m,
        total: m.total !== undefined ? m.total : total,
        count: m.count !== undefined ? m.count : mTx.length
      };
    });
  }, [transactions, dynamicMonths]);

  const activeMonthConfig = monthsOverview.find(m => m.key === activeMonthKey) || monthsOverview[0];
  const activeMonthLabel = activeMonthConfig.label;

  // Extract month transactions for activeMonthKey
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date && t.date.startsWith(activeMonthKey));
  }, [transactions, activeMonthKey]);

  // Calculate detailed stats for this month
  const monthStats = useMemo(() => {
    return analyticsService.getMonthStats(transactions, activeMonthKey);
  }, [transactions, activeMonthKey]);

  // Filter & sort
  const filteredTransactions = useMemo(() => {
    return monthTransactions
      .filter((t) => {
        if (selectedCategory !== 'all' && t.category !== selectedCategory) {
          return false;
        }
        if (searchTerm.trim() !== '') {
          const query = searchTerm.toLowerCase();
          const matchMerchant = t.merchant?.toLowerCase().includes(query);
          const matchInvoice = t.invoiceNumber?.toLowerCase().includes(query);
          const matchNotes = t.notes?.toLowerCase().includes(query);
          const matchItem = t.items?.some(i => i.name?.toLowerCase().includes(query));
          return matchMerchant || matchInvoice || matchNotes || matchItem;
        }
        return true;
      })
      .sort((a, b) => {
        if (selectedSort === 'newest') return new Date(b.date || 0) - new Date(a.date || 0);
        if (selectedSort === 'oldest') return new Date(a.date || 0) - new Date(b.date || 0);
        if (selectedSort === 'highest') return (b.total || 0) - (a.total || 0);
        if (selectedSort === 'lowest') return (a.total || 0) - (b.total || 0);
        return 0;
      });
  }, [monthTransactions, selectedCategory, searchTerm, selectedSort]);

  if (!isOpen) return null;

  // Comparison with current month
  const diffFromCurrent = currentMonthTotal - monthStats.totalSpent;
  const diffPercent = monthStats.totalSpent > 0 
    ? Math.abs((diffFromCurrent / monthStats.totalSpent) * 100).toFixed(1) 
    : '0';

  // Export CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ['Mã HĐ', 'Ngày', 'Thời gian', 'Đơn vị / Cửa hàng', 'Danh mục', 'Phương thức', 'Ghi chú', 'Tổng tiền (VND)'];
    const rows = filteredTransactions.map(t => [
      `"${t.invoiceNumber || t.id}"`,
      `"${t.date || ''}"`,
      `"${t.time || ''}"`,
      `"${(t.merchant || '').replace(/"/g, '""')}"`,
      `"${EXPENSE_CATEGORIES[t.category]?.name || t.category || ''}"`,
      `"${t.paymentMethod || ''}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      Number(t.total) || 0
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hoa-don-chi-tieu-${activeMonthKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '920px', 
          width: '95vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
            }}>
              <Receipt size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800' }}>
                  Hóa Đơn {activeMonthLabel}
                </h2>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}>
                  {activeMonthConfig.tag}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Danh sách hóa đơn trong {activeMonthLabel}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleExportCSV}
              className="btn btn-secondary btn-sm"
              title={`Xuất file CSV danh sách hóa đơn ${activeMonthLabel}`}
            >
              <Download size={15} />
              <span>Xuất CSV</span>
            </button>
            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--rose-500)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* 1 Single Button Dropdown: Chọn xem tháng */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399'
              }}>
                <Calendar size={17} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Chọn Tháng
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  3 tháng gần đây
                </div>
              </div>
            </div>

            {/* THE ONE SINGLE BUTTON WITH DROPDOWN OPTIONS */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsMonthDropdownOpen(prev => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1.5px solid var(--emerald-500)',
                  color: '#34d399',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(16, 185, 129, 0.2)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.22)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
                }}
                title="Chọn tháng xem hóa đơn"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} />
                  <span style={{ color: '#ffffff', fontWeight: '800' }}>{activeMonthLabel}</span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    background: 'rgba(16, 185, 129, 0.3)',
                    color: '#6ee7b7'
                  }}>
                    {activeMonthConfig.tag}
                  </span>
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '800',
                  fontFamily: 'var(--font-mono)',
                  color: '#34d399',
                  paddingLeft: '8px',
                  borderLeft: '1px solid rgba(16, 185, 129, 0.35)'
                }}>
                  {analyticsService.formatCurrency(activeMonthConfig.total)}
                </div>
                <ChevronDown 
                  size={15} 
                  style={{ 
                    transform: isMonthDropdownOpen ? 'rotate(180deg)' : 'none', 
                    transition: 'transform 0.2s ease',
                    color: '#34d399'
                  }} 
                />
              </button>

              {/* Dropdown Menu Popup with 3 months */}
              {isMonthDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  minWidth: '320px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  boxShadow: '0 14px 36px rgba(0, 0, 0, 0.55)',
                  zIndex: 100,
                  overflow: 'hidden',
                  padding: '6px'
                }}>
                  <div style={{
                    padding: '8px 12px 6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: '4px'
                  }}>
                    Chọn tháng cần xem hóa đơn:
                  </div>

                  {monthsOverview.map((m) => {
                    const isSelected = m.key === activeMonthKey;
                    return (
                      <div
                        key={m.key}
                        onClick={() => {
                          setActiveMonthKey(m.key);
                          setIsMonthDropdownOpen(false);
                          setSelectedCategory('all');
                          setSearchTerm('');
                          setExpandedId(null);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(16, 185, 129, 0.16)' : 'transparent',
                          border: isSelected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                          transition: 'all 0.15s ease',
                          margin: '3px 0'
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
                            <span style={{
                              fontSize: '13px',
                              fontWeight: isSelected ? '800' : '600',
                              color: isSelected ? '#34d399' : 'var(--text-primary)'
                            }}>
                              {m.label}
                            </span>
                            <span style={{
                              fontSize: '10px',
                              padding: '1px 6px',
                              borderRadius: '999px',
                              background: isSelected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                              color: isSelected ? '#6ee7b7' : 'var(--text-muted)',
                              fontWeight: '700'
                            }}>
                              {m.tag}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {m.count} hóa đơn đã ghi nhận
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '800',
                            fontFamily: 'var(--font-mono)',
                            color: isSelected ? '#34d399' : 'var(--emerald-400)'
                          }}>
                            {analyticsService.formatCurrency(m.total)}
                          </div>
                          {isSelected && (
                            <span style={{ fontSize: '10px', color: '#34d399', fontWeight: '700' }}>
                              ✓ Đang xem
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Top KPI Cards Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            marginBottom: '24px'
          }}>
            {/* KPI 1: Total Spent */}
            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                TỔNG CHI TIÊU {activeMonthLabel.toUpperCase()}
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                {analyticsService.formatCurrency(monthStats.totalSpent)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Ghi nhận qua {monthStats.totalTransactions} hóa đơn/chứng từ
              </div>
            </div>

            {/* KPI 2: Number of Transactions */}
            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                SỐ LƯỢNG HÓA ĐƠN
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
                {monthStats.totalTransactions} <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>giao dịch</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                TB: {analyticsService.formatCurrency(monthStats.totalTransactions > 0 ? monthStats.totalSpent / monthStats.totalTransactions : 0)} / lần
              </div>
            </div>

            {/* KPI 3: Comparison with Current Month */}
            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                SO VỚI THÁNG NÀY (09/2026)
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: diffFromCurrent >= 0 ? '#34d399' : '#fb7185'
              }}>
                {diffFromCurrent >= 0 ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                <span>
                  {diffFromCurrent >= 0 ? `Ít hơn ${diffPercent}%` : `Nhiều hơn ${diffPercent}%`}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Tháng này chi {analyticsService.formatCurrency(currentMonthTotal)}
              </div>
            </div>

            {/* KPI 4: Top Category */}
            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                NHÓM CHI CAO NHẤT
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: monthStats.topCategory?.color || 'var(--text-primary)' }}>
                {monthStats.topCategory?.name || 'Chưa có'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {analyticsService.formatCurrency(monthStats.topCategory?.amount || 0)} ({Math.round(monthStats.topCategory?.percent || 0)}%)
              </div>
            </div>
          </div>

          {/* Category Quick Badges */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '18px'
          }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                border: '1px solid',
                borderColor: selectedCategory === 'all' ? 'var(--emerald-500)' : 'var(--border-subtle)',
                background: selectedCategory === 'all' ? 'var(--emerald-500)' : 'var(--bg-tertiary)',
                color: selectedCategory === 'all' ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              Tất cả ({monthTransactions.length})
            </button>
            {Object.entries(EXPENSE_CATEGORIES).map(([key, meta]) => {
              const count = monthTransactions.filter(t => t.category === key).length;
              if (count === 0) return null;
              const isSelected = selectedCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: isSelected ? '700' : '600',
                    border: '1px solid',
                    borderColor: isSelected ? meta.color : 'var(--border-subtle)',
                    background: isSelected ? meta.color : 'var(--bg-tertiary)',
                    color: isSelected ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{meta.name}</span>
                  <span style={{
                    fontSize: '10px',
                    padding: '1px 5px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.08)'
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search and Sort Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {/* Search Box */}
            <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="text"
                placeholder="Tìm theo quán, món hàng, mã hóa đơn, ghi chú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
                style={{ paddingLeft: '38px', height: '40px' }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpDown size={15} color="var(--text-muted)" />
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="select"
                style={{ height: '40px', width: 'auto', minWidth: '160px' }}
              >
                <option value="newest">Mới nhất trước</option>
                <option value="oldest">Cũ nhất trước</option>
                <option value="highest">Số tiền cao nhất</option>
                <option value="lowest">Số tiền thấp nhất</option>
              </select>
            </div>
          </div>

          {/* Invoices and Transactions List */}
          {filteredTransactions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'var(--bg-tertiary)',
              borderRadius: '16px',
              border: '1px dashed var(--border-subtle)'
            }}>
              <ShoppingBag size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', opacity: 0.5 }} />
              <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
                Không tìm thấy hóa đơn nào phù hợp
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {searchTerm ? `Không có giao dịch nào khớp với từ khóa "${searchTerm}"` : 'Chưa có giao dịch nào trong danh mục đã chọn.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredTransactions.map((tx) => {
                const categoryMeta = EXPENSE_CATEGORIES[tx.category] || EXPENSE_CATEGORIES.other;
                const isExpanded = expandedId === tx.id;
                const itemsCount = tx.items ? tx.items.length : 0;

                return (
                  <div
                    key={tx.id}
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Main Row */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '14px',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement.style.borderColor = categoryMeta.color;
                        e.currentTarget.parentElement.style.background = 'var(--surface-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.parentElement.style.background = 'var(--bg-tertiary)';
                      }}
                    >
                      {/* Left: Merchant & Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1', minWidth: '260px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: `${categoryMeta.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: categoryMeta.color,
                          flexShrink: 0
                        }}>
                          <Store size={20} />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '15px', fontWeight: '700' }}>
                              {tx.merchant}
                            </span>
                            <span className={`badge ${categoryMeta.badgeClass}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                              {categoryMeta.name}
                            </span>
                            {tx.invoiceNumber && (
                              <span style={{
                                fontSize: '11px',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--text-muted)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                #{tx.invoiceNumber}
                              </span>
                            )}
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                            marginTop: '4px',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={13} />
                              {tx.date ? tx.date.split('-').reverse().join('/') : ''} {tx.time ? `• ${tx.time}` : ''}
                            </span>
                            {tx.paymentMethod && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CreditCard size={13} />
                                {tx.paymentMethod}
                              </span>
                            )}
                            {itemsCount > 0 && (
                              <span style={{ color: 'var(--emerald-400)', fontWeight: '600' }}>
                                📑 {itemsCount} món hàng
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Expand Toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: '800',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-primary)'
                          }}>
                            {analyticsService.formatCurrency(tx.total)}
                          </div>
                          {tx.notes && (
                            <div style={{
                              fontSize: '11px',
                              color: 'var(--text-muted)',
                              maxWidth: '220px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {tx.notes}
                            </div>
                          )}
                        </div>

                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-secondary)'
                        }}>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Receipt Items Breakdown */}
                    {isExpanded && (
                      <div style={{
                        borderTop: '1px solid var(--border-subtle)',
                        background: 'rgba(0, 0, 0, 0.18)',
                        padding: '16px 20px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '10px'
                        }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                            Chi tiết các mặt hàng trong hóa đơn
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Mã chứng từ: {tx.invoiceNumber || tx.id}
                          </span>
                        </div>

                        {tx.items && tx.items.length > 0 ? (
                          <div style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1px solid var(--border-subtle)'
                          }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                              <thead>
                                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '11px' }}>
                                  <th style={{ textAlign: 'left', padding: '8px 12px' }}>Tên món / Hàng hóa</th>
                                  <th style={{ textAlign: 'center', padding: '8px 12px', width: '70px' }}>SL</th>
                                  <th style={{ textAlign: 'right', padding: '8px 12px', width: '120px' }}>Đơn giá</th>
                                  <th style={{ textAlign: 'right', padding: '8px 12px', width: '130px' }}>Thành tiền</th>
                                </tr>
                              </thead>
                              <tbody>
                                {tx.items.map((item, idx) => (
                                  <tr key={idx} style={{ borderBottom: idx < tx.items.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                                    <td style={{ padding: '8px 12px', fontWeight: '500' }}>
                                      {item.name}
                                    </td>
                                    <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                      {item.quantity || 1}
                                    </td>
                                    <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                      {analyticsService.formatCurrency(item.unitPrice || item.total)}
                                    </td>
                                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                                      {analyticsService.formatCurrency(item.total)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Giao dịch này được ghi chép tổng giá trị, không có danh sách mặt hàng bóc tách.
                          </p>
                        )}

                        {tx.notes && (
                          <div style={{
                            marginTop: '12px',
                            padding: '8px 12px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '12px',
                            color: 'var(--text-secondary)'
                          }}>
                            <strong>Ghi chú chi tiêu:</strong> {tx.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          background: 'var(--bg-elevated)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Đang hiển thị <strong>{filteredTransactions.length}</strong> / {monthTransactions.length} hóa đơn ({activeMonthLabel})
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              title={`In báo cáo chi tiêu ${activeMonthLabel}`}
            >
              <Printer size={15} />
              <span>In Báo Cáo</span>
            </button>
            <button
              onClick={onClose}
              className="btn btn-primary btn-sm"
            >
              <span>Đóng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
