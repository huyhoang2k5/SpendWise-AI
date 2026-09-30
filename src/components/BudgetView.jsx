import React, { useState } from 'react';
import { 
  PieChart, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Edit3, 
  Save, 
  Sparkles, 
  DollarSign, 
  ArrowUpRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { analyticsService } from '../services/analyticsService';

export default function BudgetView({ 
  transactions, 
  monthlyBudget, 
  categoryBudgets, 
  onUpdateMonthlyBudget, 
  onUpdateCategoryBudgets 
}) {
  const stats = analyticsService.calculateStats(transactions, monthlyBudget, categoryBudgets);
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempMonthlyBudget, setTempMonthlyBudget] = useState(monthlyBudget);
  const [tempCatBudgets, setTempCatBudgets] = useState({ ...categoryBudgets });

  // Save changes
  const handleSaveBudgets = () => {
    onUpdateMonthlyBudget(Number(tempMonthlyBudget) || 10000000);
    onUpdateCategoryBudgets(tempCatBudgets);
    setEditingBudget(false);
  };

  // 50/30/20 Auto Allocator
  const apply503020Rule = () => {
    const total = Number(tempMonthlyBudget) || monthlyBudget;
    const essential = total * 0.50; // Food + Living + Transport
    const wants = total * 0.30; // Shopping + Other
    const personal = total * 0.20; // Education / Development

    const newBudgets = {
      food: Math.round(essential * 0.55),
      living: Math.round(essential * 0.30),
      transport: Math.round(essential * 0.15),
      shopping: Math.round(wants * 0.65),
      other: Math.round(wants * 0.35),
      education: Math.round(personal)
    };

    setTempCatBudgets(newBudgets);
    if (!editingBudget) {
      onUpdateCategoryBudgets(newBudgets);
    }
  };

  return (
    <div style={{ padding: '28px 0 60px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '26px' }}>Ngân Sách</h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={apply503020Rule}
            className="btn btn-secondary"
            title="Quy tắc 50/30/20"
          >
            <Sparkles size={16} color="var(--emerald-400)" />
            <span>50/30/20</span>
          </button>

          {editingBudget ? (
            <button onClick={handleSaveBudgets} className="btn btn-primary">
              <Save size={16} />
              <span>Lưu</span>
            </button>
          ) : (
            <button onClick={() => setEditingBudget(true)} className="btn btn-primary">
              <Edit3 size={16} />
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Monthly Budget Overview Card */}
      <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'center'
        }}>
          {/* Left: Overall numbers */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className="badge" style={{
                background: stats.isOverBudget ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: stats.isOverBudget ? '#fb7185' : '#34d399',
                border: stats.isOverBudget ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                padding: '4px 10px'
              }}>
                {stats.isOverBudget ? '🚨 VƯỢT NGÂN SÁCH' : stats.percentSpent > 80 ? '⚠️ CẬN HẠN MỨC' : '✓ AN TOÀN'}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stats.currentMonthDisplay || 'Tháng này'}</span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Hạn mức:</span>
              {editingBudget ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <input
                    type="number"
                    className="input"
                    style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'var(--font-mono)' }}
                    value={tempMonthlyBudget}
                    onChange={(e) => setTempMonthlyBudget(Number(e.target.value) || 0)}
                  />
                  <span style={{ fontSize: '16px', fontWeight: '700' }}>VNĐ</span>
                </div>
              ) : (
                <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {analyticsService.formatCurrency(monthlyBudget)}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Đã chi:</span>
                <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: stats.isOverBudget ? '#fb7185' : 'var(--text-primary)' }}>
                  {analyticsService.formatCurrency(stats.totalSpent)}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Còn lại:</span>
                <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>
                  {analyticsService.formatCurrency(stats.remainingBudget)}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Large Visual Gauge & Progress Bar */}
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Đã dùng</span>
              <span style={{
                fontSize: '20px',
                fontWeight: '800',
                fontFamily: 'var(--font-mono)',
                color: stats.percentSpent > 100 ? '#fb7185' : stats.percentSpent > 80 ? '#fbbf24' : 'var(--emerald-400)'
              }}>
                {Math.round(stats.percentSpent)}%
              </span>
            </div>

            {/* Progress bar with danger zone markers */}
            <div style={{
              width: '100%',
              height: '14px',
              background: 'var(--bg-primary)',
              borderRadius: '9999px',
              overflow: 'hidden',
              position: 'relative',
              marginBottom: '14px'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, stats.percentSpent)}%`,
                background: stats.percentSpent > 100 
                  ? 'linear-gradient(90deg, #f59e0b, #f43f5e)' 
                  : stats.percentSpent > 80 
                    ? 'linear-gradient(90deg, #10b981, #f59e0b)' 
                    : 'linear-gradient(90deg, #10b981, #06b6d4)',
                borderRadius: '9999px',
                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {stats.isOverBudget ? (
                <span style={{ color: '#fb7185', fontWeight: '600' }}>
                  ⚠️ Đã tiêu vượt {analyticsService.formatCurrency(stats.totalSpent - monthlyBudget)}
                </span>
              ) : stats.percentSpent > 80 ? (
                <span style={{ color: '#fbbf24', fontWeight: '600' }}>
                  ⚠️ Đã dùng {Math.round(stats.percentSpent)}% ngân sách
                </span>
              ) : (
                <span style={{ color: '#34d399', fontWeight: '600' }}>
                  ✓ Đang trong hạn mức an toàn
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
          Theo danh mục
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '18px'
        }}>
          {stats.categoryBreakdown.map((cat) => {
            const currentCatBudget = editingBudget 
              ? (tempCatBudgets[cat.key] || cat.budget) 
              : cat.budget;
            const percent = currentCatBudget > 0 ? (cat.amount / currentCatBudget) * 100 : 0;
            const isOver = cat.amount > currentCatBudget;
            const isNear = percent >= 80 && !isOver;

            return (
              <div
                key={cat.key}
                className="card"
                style={{
                  padding: '20px',
                  border: isOver 
                    ? '1px solid rgba(244, 63, 94, 0.5)' 
                    : isNear 
                      ? '1px solid rgba(245, 158, 11, 0.5)' 
                      : '1px solid var(--border-subtle)',
                  background: isOver 
                    ? 'rgba(244, 63, 94, 0.05)' 
                    : 'var(--bg-secondary)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color }} />
                    <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{cat.name}</h4>
                  </div>
                  <span className={`badge ${cat.badgeClass}`}>
                    {isOver ? 'Vượt' : isNear ? 'Cảnh báo' : 'Tốt'}
                  </span>
                </div>

                {/* Amount vs Budget */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Đã chi: </span>
                    <span style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
                      {analyticsService.formatCurrency(cat.amount)}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Hạn mức: </span>
                    {editingBudget ? (
                      <input
                        type="number"
                        className="input"
                        style={{ width: '120px', padding: '3px 8px', height: '28px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}
                        value={currentCatBudget}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setTempCatBudgets(prev => ({ ...prev, [cat.key]: val }));
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {analyticsService.formatCurrency(currentCatBudget)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, percent)}%`,
                    background: isOver ? '#f43f5e' : isNear ? '#f59e0b' : cat.color,
                    borderRadius: '9999px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>

                {/* Status line */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>{Math.round(percent)}%</span>
                  <span style={{ color: isOver ? '#fb7185' : 'var(--emerald-400)', fontWeight: '600' }}>
                    {isOver 
                      ? `Vượt ${analyticsService.formatCurrency(cat.amount - currentCatBudget)}`
                      : `Còn ${analyticsService.formatCurrency(currentCatBudget - cat.amount)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
