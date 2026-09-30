import React, { useState, useEffect, useMemo } from 'react';
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
  Percent,
  Plus,
  Trash2,
  X,
  FolderPlus,
  Utensils,
  ShoppingBag,
  Car,
  GraduationCap,
  Home,
  MoreHorizontal,
  Check
} from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { analyticsService } from '../services/analyticsService';

const CATEGORY_ICONS = {
  food: Utensils,
  shopping: ShoppingBag,
  transport: Car,
  education: GraduationCap,
  living: Home,
  other: MoreHorizontal
};

export default function BudgetView({ 
  transactions, 
  monthlyBudget, 
  categoryBudgets, 
  categoryCustomNames = {},
  onUpdateMonthlyBudget, 
  onUpdateCategoryBudgets,
  onUpdateCategoryCustomNames 
}) {
  const stats = analyticsService.calculateStats(transactions, monthlyBudget, categoryBudgets);
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempMonthlyBudget, setTempMonthlyBudget] = useState(monthlyBudget);
  const [tempCatBudgets, setTempCatBudgets] = useState({ ...(categoryBudgets || {}) });
  const [customNames, setCustomNames] = useState({ ...(categoryCustomNames || {}) });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inputBudgets, setInputBudgets] = useState({});
  const [customNameInputs, setCustomNameInputs] = useState({});
  
  // Inline rename state on card
  const [editingNameKey, setEditingNameKey] = useState(null);
  const [editingNameVal, setEditingNameVal] = useState('');

  // Sync with prop updates
  useEffect(() => {
    setTempCatBudgets({ ...(categoryBudgets || {}) });
  }, [categoryBudgets]);

  useEffect(() => {
    setCustomNames({ ...(categoryCustomNames || {}) });
  }, [categoryCustomNames]);

  useEffect(() => {
    setTempMonthlyBudget(monthlyBudget);
  }, [monthlyBudget]);

  // Keys currently tracked by user with budget > 0
  const trackedKeys = useMemo(() => {
    return Object.keys(tempCatBudgets || {}).filter(
      key => tempCatBudgets[key] !== undefined && tempCatBudgets[key] !== null && Number(tempCatBudgets[key]) > 0 && EXPENSE_CATEGORIES[key]
    );
  }, [tempCatBudgets]);

  // Categories available to be added
  const availableCategories = useMemo(() => {
    return Object.entries(EXPENSE_CATEGORIES).filter(
      ([key]) => !trackedKeys.includes(key)
    );
  }, [trackedKeys]);

  // Tracked category objects with spending & budget metrics
  const trackedCategories = useMemo(() => {
    return trackedKeys.map(key => {
      const meta = EXPENSE_CATEGORIES[key] || EXPENSE_CATEGORIES.other;
      const catStat = stats.categoryBreakdown.find(c => c.key === key);
      const amount = catStat?.amount || 0;
      const currentCatBudget = Number(tempCatBudgets[key]) || 0;
      const percent = currentCatBudget > 0 ? (amount / currentCatBudget) * 100 : 0;
      const isOver = amount > currentCatBudget;
      const isNear = percent >= 80 && !isOver;
      const displayName = customNames[key] || meta.name;

      return {
        key,
        name: meta.name,
        displayName,
        hasCustomName: Boolean(customNames[key]),
        color: meta.color,
        bgColor: meta.bgColor,
        borderColor: meta.borderColor,
        badgeClass: meta.badgeClass,
        amount,
        budget: currentCatBudget,
        percent,
        isOver,
        isNear
      };
    });
  }, [trackedKeys, tempCatBudgets, customNames, stats.categoryBreakdown]);

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

  // Add category handler
  const handleAddCategory = (catKey) => {
    const meta = EXPENSE_CATEGORIES[catKey];
    if (!meta) return;
    const customVal = inputBudgets[catKey];
    const budgetVal = (customVal !== undefined && customVal !== '' && Number(customVal) >= 0)
      ? Number(customVal)
      : (meta.defaultBudget || 2000000);

    const updated = { ...tempCatBudgets, [catKey]: budgetVal };
    setTempCatBudgets(updated);
    onUpdateCategoryBudgets(updated);

    // Save custom name if specified
    const customName = (customNameInputs[catKey] || '').trim();
    if (customName && customName !== meta.name) {
      const updatedNames = { ...customNames, [catKey]: customName };
      setCustomNames(updatedNames);
      if (onUpdateCategoryCustomNames) {
        onUpdateCategoryCustomNames(updatedNames);
      }
    }

    if (availableCategories.length <= 1) {
      setIsAddModalOpen(false);
    }
  };

  // Remove category handler
  const handleRemoveCategory = (catKey) => {
    const updated = { ...tempCatBudgets };
    delete updated[catKey];
    setTempCatBudgets(updated);
    onUpdateCategoryBudgets(updated);

    if (customNames[catKey]) {
      const updatedNames = { ...customNames };
      delete updatedNames[catKey];
      setCustomNames(updatedNames);
      if (onUpdateCategoryCustomNames) {
        onUpdateCategoryCustomNames(updatedNames);
      }
    }
  };

  // Save inline custom name
  const handleSaveCatName = (catKey) => {
    const meta = EXPENSE_CATEGORIES[catKey];
    const trimmed = editingNameVal.trim();
    const updatedNames = { ...customNames };
    
    if (trimmed && trimmed !== meta?.name) {
      updatedNames[catKey] = trimmed;
    } else {
      delete updatedNames[catKey];
    }

    setCustomNames(updatedNames);
    if (onUpdateCategoryCustomNames) {
      onUpdateCategoryCustomNames(updatedNames);
    }
    setEditingNameKey(null);
  };

  // Add all remaining categories
  const handleAddAllCategories = () => {
    const updated = { ...tempCatBudgets };
    const updatedNames = { ...customNames };

    availableCategories.forEach(([key, meta]) => {
      const customVal = inputBudgets[key];
      updated[key] = (customVal !== undefined && customVal !== '' && Number(customVal) >= 0)
        ? Number(customVal)
        : (meta.defaultBudget || 2000000);

      const customName = (customNameInputs[key] || '').trim();
      if (customName && customName !== meta.name) {
        updatedNames[key] = customName;
      }
    });

    setTempCatBudgets(updated);
    onUpdateCategoryBudgets(updated);
    setCustomNames(updatedNames);
    if (onUpdateCategoryCustomNames) {
      onUpdateCategoryCustomNames(updatedNames);
    }
    setIsAddModalOpen(false);
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

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={apply503020Rule}
            className="btn btn-secondary"
            title="Tự động phân bổ theo quy tắc 50/30/20"
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
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Hạn mức tháng:</span>
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

            {/* Progress bar */}
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

      {/* Category Budgets Section */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
              Theo danh mục
            </h3>
            <span className="badge" style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '12px',
              color: 'var(--text-secondary)'
            }}>
              {trackedKeys.length} danh mục
            </span>
          </div>

          {/* "+ Thêm danh mục" Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '10px',
              border: availableCategories.length > 0 ? '1px dashed var(--emerald-500)' : '1px solid var(--border-subtle)',
              color: availableCategories.length > 0 ? 'var(--emerald-400)' : 'var(--text-muted)',
              background: availableCategories.length > 0 ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
              cursor: availableCategories.length > 0 ? 'pointer' : 'default'
            }}
            disabled={availableCategories.length === 0}
            title={availableCategories.length === 0 ? 'Đã thêm đầy đủ danh mục' : 'Thêm danh mục chi tiêu muốn kiểm soát'}
          >
            <Plus size={16} />
            <span>{availableCategories.length === 0 ? 'Đã thêm tất cả' : 'Thêm danh mục'}</span>
          </button>
        </div>

        {/* Empty State when no categories are tracked */}
        {trackedCategories.length === 0 ? (
          <div style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            border: '1px dashed var(--border-subtle)',
            color: 'var(--text-muted)'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--emerald-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px'
            }}>
              <FolderPlus size={28} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Chưa có danh mục nào được theo dõi
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 18px', lineHeight: 1.5 }}>
              Bạn có thể chỉ theo dõi những khoản chi mình quan tâm (Ăn uống, Đi lại, Mua sắm...). Nhấn nút bên dưới để chọn thêm danh mục.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 18px' }}
            >
              <Plus size={16} />
              <span>Thêm danh mục đầu tiên</span>
            </button>
          </div>
        ) : (
          /* Category Cards Grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '18px'
          }}>
            {trackedCategories.map((cat) => {
              const currentCatBudget = cat.budget;
              const percent = cat.percent;
              const isOver = cat.isOver;
              const isNear = cat.isNear;
              const CatIcon = CATEGORY_ICONS[cat.key] || MoreHorizontal;
              const isEditingThisName = editingNameKey === cat.key;

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
                    overflow: 'hidden',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: 0 }}>
                      <span style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: cat.bgColor || 'rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: cat.color,
                        flexShrink: 0
                      }}>
                        <CatIcon size={16} />
                      </span>

                      {/* Title & Rename */}
                      {isEditingThisName ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: '1' }}>
                          <input
                            type="text"
                            className="input"
                            style={{
                              padding: '2px 8px',
                              fontSize: '13.5px',
                              fontWeight: '700',
                              height: '28px',
                              borderRadius: '6px',
                              maxWidth: '150px'
                            }}
                            value={editingNameVal}
                            onChange={(e) => setEditingNameVal(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveCatName(cat.key);
                              if (e.key === 'Escape') setEditingNameKey(null);
                            }}
                            placeholder="Tên danh mục..."
                          />
                          <button
                            onClick={() => handleSaveCatName(cat.key)}
                            className="btn-ghost"
                            style={{ padding: '4px', color: 'var(--emerald-400)' }}
                            title="Lưu tên"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingNameKey(null)}
                            className="btn-ghost"
                            style={{ padding: '4px', color: 'var(--text-muted)' }}
                            title="Hủy"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                          <h4 
                            style={{ 
                              fontSize: '15px', 
                              fontWeight: '700', 
                              margin: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={cat.hasCustomName ? `${cat.displayName} (${cat.name})` : cat.displayName}
                          >
                            {cat.displayName}
                          </h4>
                          {/* Edit button for custom name (especially helpful for 'Khác') */}
                          <button
                            onClick={() => {
                              setEditingNameKey(cat.key);
                              setEditingNameVal(cat.displayName);
                            }}
                            className="btn-ghost"
                            style={{
                              padding: '2px 4px',
                              borderRadius: '4px',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Đổi tên danh mục"
                          >
                            <Edit3 size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span className={`badge ${cat.badgeClass}`}>
                        {isOver ? 'Vượt' : isNear ? 'Cảnh báo' : 'Tốt'}
                      </span>
                      <button
                        onClick={() => handleRemoveCategory(cat.key)}
                        className="btn-ghost"
                        title={`Bỏ theo dõi ${cat.displayName}`}
                        style={{
                          padding: '4px',
                          borderRadius: '6px',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          background: 'transparent',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#fb7185';
                          e.currentTarget.style.background = 'rgba(244, 63, 94, 0.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-muted)';
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <X size={15} />
                      </button>
                    </div>
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
        )}
      </div>

      {/* Modal: Thêm danh mục ngân sách */}
      {isAddModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div 
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Thêm danh mục ngân sách</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Chọn danh mục và thiết lập hạn mức chi tiêu
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="btn-ghost"
                style={{ padding: '6px', borderRadius: '8px', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* List of Available Categories */}
            {availableCategories.length === 0 ? (
              <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle size={36} color="var(--emerald-400)" style={{ margin: '0 auto 10px' }} />
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Đã thêm tất cả danh mục!
                </p>
                <p style={{ fontSize: '12px' }}>Bạn đang theo dõi toàn bộ các nhóm chi tiêu.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {availableCategories.map(([key, cat]) => {
                  const CatIcon = CATEGORY_ICONS[key] || MoreHorizontal;
                  const currentInput = inputBudgets[key] !== undefined ? inputBudgets[key] : cat.defaultBudget;
                  const currentNameInput = customNameInputs[key] !== undefined ? customNameInputs[key] : (customNames[key] || '');

                  return (
                    <div
                      key={key}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}>
                        {/* Left: Icon & Name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '130px' }}>
                          <span style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            background: cat.bgColor || 'rgba(255,255,255,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: cat.color
                          }}>
                            <CatIcon size={18} />
                          </span>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700' }}>{cat.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              Gợi ý: {analyticsService.formatCurrency(cat.defaultBudget)}
                            </div>
                          </div>
                        </div>

                        {/* Right: Budget input & Add button */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', justifyContent: 'flex-end' }}>
                          <div style={{ position: 'relative', width: '130px' }}>
                            <input
                              type="number"
                              className="input"
                              style={{
                                padding: '5px 8px',
                                height: '32px',
                                fontSize: '13px',
                                textAlign: 'right',
                                fontFamily: 'var(--font-mono)'
                              }}
                              value={currentInput}
                              onChange={(e) => {
                                const val = e.target.value;
                                setInputBudgets(prev => ({ ...prev, [key]: val }));
                              }}
                              placeholder={cat.defaultBudget.toString()}
                            />
                          </div>

                          <button
                            onClick={() => handleAddCategory(key)}
                            className="btn btn-primary"
                            style={{
                              padding: '6px 12px',
                              height: '32px',
                              fontSize: '12.5px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Plus size={14} />
                            <span>Thêm</span>
                          </button>
                        </div>
                      </div>

                      {/* If category is 'other' (Khác), allow typing custom name */}
                      {key === 'other' && (
                        <div style={{
                          borderTop: '1px dashed var(--border-subtle)',
                          paddingTop: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            Tùy chỉnh tên:
                          </span>
                          <input
                            type="text"
                            className="input"
                            style={{
                              padding: '4px 8px',
                              height: '28px',
                              fontSize: '12px',
                              flex: 1,
                              borderRadius: '6px'
                            }}
                            placeholder="Ghi tên bạn muốn (ví dụ: Nuôi mèo, Gym, Tiền trọ...)"
                            value={currentNameInput}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomNameInputs(prev => ({ ...prev, [key]: val }));
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              {availableCategories.length > 1 ? (
                <button
                  onClick={handleAddAllCategories}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  Thêm tất cả ({availableCategories.length})
                </button>
              ) : <div />}

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="btn btn-secondary"
                style={{ padding: '6px 16px', fontSize: '13px' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
