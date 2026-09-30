import { EXPENSE_CATEGORIES } from '../constants/categories';

export const analyticsService = {
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount || 0)) + ' đ';
  },

  // Extract transactions for a specific YYYY-MM
  getTransactionsByMonth: (transactions = [], monthPrefix = '2026-08') => {
    return transactions.filter(t => t.date && t.date.startsWith(monthPrefix));
  },

  // Calculate detailed summary for any specific month
  getMonthStats: (transactions = [], monthPrefix = '2026-08') => {
    const monthTx = transactions.filter(t => t.date && t.date.startsWith(monthPrefix));
    const total = monthTx.reduce((sum, t) => sum + (Number(t.total) || 0), 0);
    const count = monthTx.length;

    // Category breakdown
    const categoryTotals = {};
    Object.keys(EXPENSE_CATEGORIES).forEach(k => { categoryTotals[k] = 0; });
    monthTx.forEach(t => {
      const cat = t.category || 'other';
      if (categoryTotals[cat] !== undefined) {
        categoryTotals[cat] += Number(t.total) || 0;
      } else {
        categoryTotals['other'] = (categoryTotals['other'] || 0) + (Number(t.total) || 0);
      }
    });

    const categoryBreakdown = Object.entries(categoryTotals)
      .filter(([_, amt]) => amt > 0)
      .map(([key, amount]) => {
        const meta = EXPENSE_CATEGORIES[key] || EXPENSE_CATEGORIES.other;
        const percent = total > 0 ? (amount / total) * 100 : 0;
        return {
          key,
          name: meta.name,
          amount,
          color: meta.color,
          badgeClass: meta.badgeClass,
          percent
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // Payment methods breakdown
    const paymentMap = {};
    monthTx.forEach(t => {
      const m = t.paymentMethod || 'Khác';
      paymentMap[m] = (paymentMap[m] || 0) + (Number(t.total) || 0);
    });

    return {
      monthPrefix,
      transactions: monthTx,
      totalSpent: total,
      totalTransactions: count,
      categoryBreakdown,
      topCategory: categoryBreakdown[0] || null,
      paymentMap
    };
  },

  /**
   * Generates a dynamic rolling window of N months immediately prior to a given month.
   * If current month is 2026-09 -> returns [2026-08, 2026-07, 2026-06].
   * If moving to 2026-10 -> dynamically returns [2026-09, 2026-08, 2026-07], dropping 2026-06!
   */
  // Get real-time current month key YYYY-MM
  getCurrentMonthKey: () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  },

  getCurrentMonthDisplay: (monthKey) => {
    const key = monthKey || analyticsService.getCurrentMonthKey();
    const [y, m] = key.split('-');
    return `${m}/${y}`;
  },

  getCurrentMonthLabel: (monthKey) => {
    const key = monthKey || analyticsService.getCurrentMonthKey();
    const [y, m] = key.split('-');
    return `Tháng ${m}/${y}`;
  },

  /**
   * Generates a dynamic rolling window of N months immediately prior to a given month.
   */
  getRollingRecentMonths: (currentMonthKey, count = 3) => {
    const keyToUse = currentMonthKey || analyticsService.getCurrentMonthKey();
    let currentYear = 2026;
    let currentMonth = 10;
    if (keyToUse && keyToUse.includes('-')) {
      const parts = keyToUse.split('-');
      currentYear = parseInt(parts[0], 10) || 2026;
      currentMonth = parseInt(parts[1], 10) || 10;
    }
    
    const months = [];
    for (let i = 1; i <= count; i++) {
      const targetDate = new Date(currentYear, currentMonth - 1 - i, 1);
      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, '0');
      const key = `${y}-${m}`;
      
      let tag = `${i} tháng trước`;
      if (i === 1) tag = 'Tháng trước';
      
      months.push({
        key,
        label: `Tháng ${m}/${y}`,
        shortLabel: `T${m}/${y}`,
        tag
      });
    }
    return months;
  },

  calculateStats: (transactions = [], monthlyBudget = 12000000, categoryBudgets = {}) => {
    // Real-time current month (e.g. 2026-10)
    const realTimeMonthKey = analyticsService.getCurrentMonthKey();

    const allMonthsWithTx = Array.from(new Set(
      transactions
        .map(t => (t.date && t.date.length >= 7) ? t.date.substring(0, 7) : null)
        .filter(Boolean)
    )).sort().reverse();

    // Active month is real-time month (or latest transaction month if user added in future)
    const currentMonthPrefix = (allMonthsWithTx[0] && allMonthsWithTx[0] > realTimeMonthKey)
      ? allMonthsWithTx[0]
      : realTimeMonthKey;

    const [curYear, curMonth] = currentMonthPrefix.split('-');
    const currentMonthDisplay = `${curMonth}/${curYear}`;
    const currentMonthLabel = `Tháng ${curMonth}/${curYear}`;

    // Dynamic Rolling Window: generate 3 months prior to current active month
    const rollingTemplates = analyticsService.getRollingRecentMonths(currentMonthPrefix, 3);
    const prevMonthPrefix = rollingTemplates[0]?.key;
    const prevMonthLabel = rollingTemplates[0]?.label || 'Tháng trước';

    const currentMonthTxs = transactions.filter(t => t.date && t.date.startsWith(currentMonthPrefix));
    // If no transactions in currentMonthPrefix, fallback to non-historical
    const activeCurrentTxs = currentMonthTxs.length > 0 
      ? currentMonthTxs 
      : transactions.filter(t => {
          if (!t.date) return true;
          return !rollingTemplates.some(m => t.date.startsWith(m.key));
        });

    const prevMonthTransactions = transactions.filter(t => t.date && t.date.startsWith(prevMonthPrefix));
    const prevMonthTotal = prevMonthTransactions.reduce((sum, t) => sum + (Number(t.total) || 0), 0);
    const prevMonthCount = prevMonthTransactions.length;

    // 3 Most Recent Months data calculated dynamically
    const recentMonths = rollingTemplates.map(m => {
      const txs = transactions.filter(t => t.date && t.date.startsWith(m.key));
      const total = txs.reduce((sum, t) => sum + (Number(t.total) || 0), 0);
      return {
        ...m,
        total,
        count: txs.length,
        transactions: txs
      };
    });

    const totalTransactions = activeCurrentTxs.length;
    const totalSpent = activeCurrentTxs.reduce((sum, t) => sum + (Number(t.total) || 0), 0);
    
    // MoM comparison (vs Month 8)
    const momDiff = totalSpent - prevMonthTotal;
    const momPercent = prevMonthTotal > 0 ? ((totalSpent - prevMonthTotal) / prevMonthTotal) * 100 : 0;

    // Group current month by category
    const categoryTotals = {};
    Object.keys(EXPENSE_CATEGORIES).forEach(k => { categoryTotals[k] = 0; });

    activeCurrentTxs.forEach(t => {
      const cat = t.category || 'other';
      if (categoryTotals[cat] !== undefined) {
        categoryTotals[cat] += Number(t.total) || 0;
      } else {
        categoryTotals['other'] = (categoryTotals['other'] || 0) + (Number(t.total) || 0);
      }
    });

    const categoryBreakdown = Object.entries(categoryTotals).map(([key, amount]) => {
      const meta = EXPENSE_CATEGORIES[key] || EXPENSE_CATEGORIES.other;
      const budget = categoryBudgets[key] || meta.defaultBudget;
      const percentOfTotal = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
      const percentOfBudget = budget > 0 ? (amount / budget) * 100 : 0;
      
      return {
        key,
        name: meta.name,
        amount,
        budget,
        color: meta.color,
        badgeClass: meta.badgeClass,
        percentOfTotal,
        percentOfBudget,
        isOverBudget: amount > budget
      };
    }).sort((a, b) => b.amount - a.amount);

    // Top Category
    const topCategory = categoryBreakdown[0] || null;

    // Daily breakdown for timeline/bar chart (current month)
    const dailyMap = {};
    activeCurrentTxs.forEach(t => {
      if (!t.date) return;
      dailyMap[t.date] = (dailyMap[t.date] || 0) + (Number(t.total) || 0);
    });

    const sortedDates = Object.keys(dailyMap).sort();
    const dailyTimeline = sortedDates.map(date => ({
      date,
      displayDate: date.split('-').slice(1).reverse().join('/'),
      amount: dailyMap[date]
    }));

    // Find highest spending day
    let peakDay = null;
    if (dailyTimeline.length > 0) {
      peakDay = [...dailyTimeline].sort((a, b) => b.amount - a.amount)[0];
    }

    // Daily average (over distinct days with transactions, or days in current month)
    const activeDaysCount = Math.max(1, sortedDates.length);
    const dailyAverage = totalSpent / activeDaysCount;

    // Budget health metrics
    const remainingBudget = Math.max(0, monthlyBudget - totalSpent);
    const percentSpent = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
    const isOverBudget = totalSpent > monthlyBudget;

    // Forecast / Burn rate: If in month with 30 days, project total end-of-month spending
    const daysInMonth = 30;
    const currentDayEstimated = Math.min(30, Math.max(15, activeDaysCount + 10));
    const projectedMonthEnd = (totalSpent / currentDayEstimated) * daysInMonth;

    // Health Score (0 - 100)
    let healthScore = 100;
    if (percentSpent > 100) {
      healthScore = Math.max(30, 100 - (percentSpent - 100) * 1.5);
    } else if (percentSpent > 80) {
      healthScore = Math.max(65, 100 - (percentSpent - 80) * 1.2);
    }

    return {
      totalSpent,
      totalTransactions,
      monthlyBudget,
      remainingBudget,
      percentSpent,
      isOverBudget,
      dailyAverage,
      categoryBreakdown,
      topCategory,
      dailyTimeline,
      peakDay,
      projectedMonthEnd,
      healthScore: Math.round(healthScore),
      // Previous month metrics
      prevMonthTotal,
      prevMonthTransactions,
      prevMonthCount,
      momDiff,
      momPercent,
      // Current & Previous Month Metadata
      currentMonthPrefix,
      currentMonthDisplay,
      currentMonthLabel,
      prevMonthPrefix,
      prevMonthLabel,
      // 3 Most Recent Months
      recentMonths
    };
  }
};
