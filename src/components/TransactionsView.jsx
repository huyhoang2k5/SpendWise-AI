import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit3,
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Calendar, 
  Tag, 
  Plus, 
  Store,
  CreditCard,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { analyticsService } from '../services/analyticsService';
import EditTransactionModal from './EditTransactionModal';

export default function TransactionsView({ 
  transactions, 
  onDeleteTransaction, 
  onUpdateTransaction,
  onNavigateToScanner, 
  openManualModal 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' | '2026-09' | '2026-08'
  const [selectedSort, setSelectedSort] = useState('newest');
  const [expandedId, setExpandedId] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Month filter
        if (selectedMonth !== 'all' && (!t.date || !t.date.startsWith(selectedMonth))) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && t.category !== selectedCategory) {
          return false;
        }

        // Search term filter
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
  }, [transactions, searchTerm, selectedCategory, selectedMonth, selectedSort]);

  // Total amount of filtered list
  const filteredTotal = filteredTransactions.reduce((acc, t) => acc + (t.total || 0), 0);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Mã Giao Dịch', 'Cửa Hàng', 'Danh Mục', 'Ngày', 'Giờ', 'Số HĐ', 'Hình Thức', 'Tổng Tiền (VNĐ)', 'Ghi Chú'];
    const rows = filteredTransactions.map(t => [
      t.id,
      `"${t.merchant || ''}"`,
      EXPENSE_CATEGORIES[t.category]?.name || t.category,
      t.date,
      t.time || '',
      t.invoiceNumber || '',
      t.paymentMethod || '',
      t.total,
      `"${t.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `spendwise_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle itemized breakdown
  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div style={{ padding: '28px 0 60px' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '26px', marginBottom: '4px' }}>Lịch Sử Chi Tiêu & Hóa Đơn</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Xem lại, tìm kiếm, chỉnh sửa và xuất báo cáo toàn bộ các hóa đơn đã được AI ghi nhận (Mục 4.3.4)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportToCSV} className="btn btn-secondary">
            <Download size={16} />
            <span>Xuất CSV (Excel)</span>
          </button>
          <button onClick={onNavigateToScanner} className="btn btn-primary">
            <Plus size={16} />
            <span>Quét Hóa Đơn Mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          alignItems: 'center'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Tìm theo quán, sản phẩm, mã HĐ..."
              className="input"
              style={{ paddingLeft: '36px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={16} color="var(--text-muted)" />
            <select
              className="select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Tất cả danh mục ({transactions.length})</option>
              {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="var(--text-muted)" />
            {(() => {
              const curKey = analyticsService.getCurrentMonthKey();
              const rolling = analyticsService.getRollingRecentMonths(curKey, 4);
              const dynamicOptions = [
                { key: curKey, label: `${analyticsService.getCurrentMonthLabel(curKey)} (Hiện tại)` },
                ...rolling.map(r => ({ key: r.key, label: `${r.label} (${r.tag})` }))
              ];

              return (
                <select
                  className="select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="all">Tất cả thời gian</option>
                  {dynamicOptions.map(opt => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              );
            })()}
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpDown size={16} color="var(--text-muted)" />
            <select
              className="select"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
            >
              <option value="newest">Ngày: Mới nhất trước</option>
              <option value="oldest">Ngày: Cũ nhất trước</option>
              <option value="highest">Số tiền: Cao nhất trước</option>
              <option value="lowest">Số tiền: Thấp nhất trước</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '13px'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>
            Đang hiển thị <strong>{filteredTransactions.length}</strong> / {transactions.length} giao dịch
          </span>
          <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>
            Tổng lọc: <span style={{ color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)' }}>{analyticsService.formatCurrency(filteredTotal)}</span>
          </span>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Không tìm thấy giao dịch nào phù hợp</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
            Thử thay đổi từ khóa tìm kiếm hoặc lọc theo danh mục khác.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
            className="btn btn-secondary btn-sm"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTransactions.map((tx) => {
            const cat = EXPENSE_CATEGORIES[tx.category] || EXPENSE_CATEGORIES.other;
            const isExpanded = expandedId === tx.id;

            return (
              <div 
                key={tx.id} 
                className="card"
                style={{
                  padding: '16px 20px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  transition: 'border-color 0.2s ease'
                }}
              >
                {/* Main Card Row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  {/* Left: Merchant & Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: cat.bgColor,
                      border: `1px solid ${cat.borderColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cat.color
                    }}>
                      <Store size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{tx.merchant}</h4>
                        <span className={`badge ${cat.badgeClass}`}>
                          {cat.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '3px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} /> {tx.date} {tx.time ? `• ${tx.time}` : ''}
                        </span>
                        {tx.invoiceNumber && (
                          <span style={{ fontFamily: 'var(--font-mono)' }}>
                            HĐ: {tx.invoiceNumber}
                          </span>
                        )}
                        {tx.paymentMethod && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CreditCard size={13} /> {tx.paymentMethod}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '800',
                        color: 'var(--emerald-400)',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {analyticsService.formatCurrency(tx.total)}
                      </div>
                      {tx.items?.length > 0 && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {tx.items.length} món hàng
                        </div>
                      )}
                    </div>

                    {/* Toggle Items */}
                    {tx.items?.length > 0 && (
                      <button
                        onClick={() => toggleExpand(tx.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                        title="Xem chi tiết món hàng"
                      >
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        <span>{isExpanded ? 'Ẩn món' : 'Chi tiết'}</span>
                      </button>
                    )}

                    {/* Edit button */}
                    <button
                      onClick={() => setEditingTransaction(tx)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      title="Chỉnh sửa giao dịch này"
                    >
                      <Edit3 size={14} color="#38bdf8" />
                      <span>Sửa</span>
                    </button>

                    {/* Delete action */}
                    <button
                      onClick={() => {
                        if (window.confirm(`Bạn có chắc muốn xóa khoản chi "${tx.merchant}" (${analyticsService.formatCurrency(tx.total)})?`)) {
                          onDeleteTransaction(tx.id);
                        }
                      }}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '6px' }}
                      title="Xóa giao dịch này"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Expanded Itemized Breakdown Table */}
                {isExpanded && tx.items?.length > 0 && (
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-subtle)',
                    animation: 'fadeIn 0.2s ease-out'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      <Layers size={14} color="var(--emerald-400)" />
                      <span>CÁC MẶT HÀNG TRÊN HÓA ĐƠN ({tx.items.length})</span>
                    </div>

                    <div style={{ background: 'var(--bg-tertiary)', borderRadius: '8px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                            <th style={{ padding: '8px 12px' }}>Sản phẩm</th>
                            <th style={{ padding: '8px 12px', width: '60px', textAlign: 'center' }}>SL</th>
                            <th style={{ padding: '8px 12px', width: '110px', textAlign: 'right' }}>Đơn giá</th>
                            <th style={{ padding: '8px 12px', width: '120px', textAlign: 'right' }}>Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tx.items.map((it, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                              <td style={{ padding: '8px 12px', fontWeight: '500' }}>{it.name}</td>
                              <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{it.quantity}</td>
                              <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                                {analyticsService.formatCurrency(it.unitPrice)}
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                                {analyticsService.formatCurrency(it.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {tx.notes && (
                      <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Ghi chú: {tx.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      <EditTransactionModal
        isOpen={Boolean(editingTransaction)}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
        onUpdateTransaction={(id, updated) => {
          onUpdateTransaction(id, updated);
          setEditingTransaction(null);
        }}
      />
    </div>
  );
}
