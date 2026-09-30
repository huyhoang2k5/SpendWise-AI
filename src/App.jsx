import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import InvoiceScannerView from './components/InvoiceScannerView';
import TransactionsView from './components/TransactionsView';
import BudgetView from './components/BudgetView';
import AiAdvisorView from './components/AiAdvisorView';
import LoginScreen from './components/LoginScreen';
import ApiKeyModal from './components/ApiKeyModal';
import ManualExpenseModal from './components/ManualExpenseModal';
import UserProfileModal from './components/UserProfileModal';
import ClearDataModal from './components/ClearDataModal';
import { storageService } from './services/storageService';
import { authApi, transactionsApi, checkServerHealth } from './services/apiService';
import { CheckCircle2, AlertCircle, Trash2, WifiOff, Loader2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);     // Đang khởi tạo
  const [serverOnline, setServerOnline] = useState(true); // Trạng thái server

  // Data state
  const [transactions, setTransactions] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(10000000);
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [apiKey, setApiKey] = useState('');
  const [theme, setTheme] = useState('dark');

  // Modal state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // ─── Toast helper ───────────────────────────────────────────────────────
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // ─── Tải transactions từ MongoDB Cloud ───────────────────────────────────
  const loadTransactions = useCallback(async () => {
    try {
      const data = await transactionsApi.getAll();
      const raw = data.transactions || [];
      const normalized = raw.map(t => {
        const id = (t._id ? t._id.toString() : t.id) || '';
        return {
          ...t,
          id,
          _id: id
        };
      });
      setTransactions(normalized);
    } catch (err) {
      console.error('Lỗi tải giao dịch:', err);
      addToast('Không thể tải danh sách giao dịch từ Cloud. Vui lòng kiểm tra kết nối.', 'error');
    }
  }, []);

  // ─── Khởi tạo app khi mount ─────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      // Lấy settings local (Gemini API key, theme theo từng máy)
      const savedKey = storageService.getApiKey();
      const savedTheme = storageService.getTheme();
      setApiKey(savedKey);
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);

      // Kiểm tra server online
      const online = await checkServerHealth();
      setServerOnline(online);

      if (!online) {
        setIsLoading(false);
        return;
      }

      // Kiểm tra token còn hợp lệ không
      if (authApi.hasToken()) {
        try {
          const { user } = await authApi.getMe();
          setCurrentUser(user);
          setMonthlyBudget(user.monthlyBudget || 10000000);
          setCategoryBudgets(user.categoryBudgets || {});
          await loadTransactions();
        } catch {
          authApi.logout();
        }
      }

      setIsLoading(false);
    };

    init();
  }, [loadTransactions]);

  // ─── Đăng nhập thành công ───────────────────────────────────────────────
  const handleLoginSuccess = async (user) => {
    setCurrentUser(user);
    setMonthlyBudget(user.monthlyBudget || 10000000);
    setCategoryBudgets(user.categoryBudgets || {});
    await loadTransactions();
    addToast(`Chào mừng ${user.name}! Đã kết nối cơ sở dữ liệu đám mây.`);
  };

  // ─── Đăng xuất ────────────────────────────────────────────────────────
  const handleLogout = () => {
    authApi.logout();
    setCurrentUser(null);
    setTransactions([]);
    setCurrentTab('dashboard');
    addToast('Đã đăng xuất an toàn.', 'info');
  };

  // ─── Theme ────────────────────────────────────────────────────────────
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    storageService.saveTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  // ─── CRUD giao dịch (Cloud API MongoDB) ─────────────────────────────────
  const handleAddTransaction = async (newTx) => {
    if (!currentUser) return;
    try {
      const { transaction } = await transactionsApi.add(newTx);
      const id = (transaction._id ? transaction._id.toString() : transaction.id) || '';
      const normalized = { ...transaction, id, _id: id };
      setTransactions(prev => [normalized, ...prev]);
      addToast(`Đã lưu hóa đơn "${newTx.merchant}" lên MongoDB!`);
      setCurrentTab('dashboard');
    } catch (err) {
      addToast(`Lỗi lưu giao dịch: ${err.message}`, 'error');
    }
  };

  const handleUpdateTransaction = async (id, updatedTx) => {
    if (!currentUser) return;
    const targetId = id || updatedTx._id || updatedTx.id;
    try {
      const { transaction } = await transactionsApi.update(targetId, updatedTx);
      const resId = (transaction._id ? transaction._id.toString() : transaction.id) || targetId;
      const normalized = { ...transaction, id: resId, _id: resId };
      setTransactions(prev => prev.map(t => ((t._id || t.id) === targetId ? normalized : t)));
      addToast(`Đã cập nhật "${updatedTx.merchant}" trên MongoDB!`);
    } catch (err) {
      addToast(`Lỗi cập nhật: ${err.message}`, 'error');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!currentUser) return;
    const targetId = id ? id.toString() : '';
    if (!targetId) {
      addToast('Không xác định được ID giao dịch để xóa.', 'error');
      return;
    }
    try {
      await transactionsApi.delete(targetId);
      setTransactions(prev => prev.filter(t => (t._id !== targetId && t.id !== targetId)));
      addToast('Đã xóa giao dịch khỏi MongoDB.', 'info');
    } catch (err) {
      addToast(`Lỗi xóa giao dịch: ${err.message}`, 'error');
    }
  };

  // ─── Ngân sách (lưu vào MongoDB profile) ────────────────────────────────
  const handleUpdateMonthlyBudget = async (amount) => {
    if (!currentUser) return;
    try {
      await authApi.updateProfile({ monthlyBudget: amount });
      setMonthlyBudget(amount);
      addToast('Đã cập nhật hạn mức ngân sách tháng trên Cloud!');
    } catch (err) {
      addToast(`Lỗi cập nhật ngân sách: ${err.message}`, 'error');
    }
  };

  const handleUpdateCategoryBudgets = async (budgets) => {
    if (!currentUser) return;
    try {
      await authApi.updateProfile({ categoryBudgets: budgets });
      setCategoryBudgets(budgets);
      addToast('Đã cập nhật ngân sách danh mục trên Cloud!');
    } catch (err) {
      addToast(`Lỗi: ${err.message}`, 'error');
    }
  };

  // ─── API Key (luôn local theo thiết kế device-scoped) ───────────────────
  const handleSaveApiKey = (key) => {
    storageService.saveApiKey(key);
    setApiKey(key);
    addToast(key ? 'Đã kích hoạt Gemini API Key!' : 'Đã xóa API Key.');
  };

  // ─── Xóa toàn bộ dữ liệu (yêu cầu xác thực mật khẩu qua Modal) ─────────
  const handleClearData = () => {
    if (!currentUser) return;
    if (transactions.length === 0) {
      addToast('Sổ chi tiêu hiện tại đang trống, không có giao dịch nào để xóa.', 'info');
      return;
    }
    setIsClearModalOpen(true);
  };

  const handleConfirmClear = async (password) => {
    if (!currentUser) return;
    const result = await transactionsApi.deleteAll(password);
    setTransactions([]);
    addToast(result.message || 'Đã làm trống sổ chi tiêu thành công!', 'info');
  };

  // ─── Cập nhật hồ sơ cá nhân ─────────────────────────────────────────────
  const handleUpdateProfile = async (updatedFields) => {
    if (!currentUser) return { success: false, error: 'Chưa đăng nhập!' };
    try {
      const { user } = await authApi.updateProfile(updatedFields);
      setCurrentUser(user);
      if (updatedFields.monthlyBudget) setMonthlyBudget(updatedFields.monthlyBudget);
      addToast('Đã cập nhật hồ sơ cá nhân!');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ─── Loading screen ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Loader2 size={40} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Đang kết nối MongoDB...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── Server offline warning ────────────────────────────────────────────
  if (!serverOnline) {
    const rawUrl = import.meta.env.VITE_API_URL || 'https://spendwise-ai-production.up.railway.app';
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <WifiOff size={48} color="#f43f5e" />
        <div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Đang chờ máy chủ Cloud phản hồi</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '460px', lineHeight: '1.6' }}>
            Ứng dụng cần kết nối trực tiếp đến backend tại <code style={{ color: '#34d399', wordBreak: 'break-all' }}>{rawUrl}</code> để xử lý AI và đồng bộ dữ liệu MongoDB Atlas.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '12px' }}>
            Nếu bạn vừa khởi động hoặc deploy lại trên Railway, vui lòng đợi vài giây rồi bấm <strong>Thử lại kết nối</strong>.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          🔄 Thử lại kết nối
        </button>
      </div>
    );
  }

  // ─── Login screen ──────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className="toast">
              {t.type === 'success' ? <CheckCircle2 size={18} color="#34d399" /> : <AlertCircle size={18} color="#38bdf8" />}
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Main App ──────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        theme={theme}
        toggleTheme={toggleTheme}
        openApiKeyModal={() => setIsApiKeyModalOpen(true)}
        openManualModal={() => setIsManualModalOpen(true)}
        openProfileModal={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
        hasApiKey={Boolean(apiKey && apiKey.length > 5)}
      />

      <main className="main-content-area" style={{ flex: 1 }}>
        <div className="container">
          {currentTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              monthlyBudget={monthlyBudget}
              categoryBudgets={categoryBudgets}
              onNavigateToTab={setCurrentTab}
              openManualModal={() => setIsManualModalOpen(true)}
            />
          )}
          {currentTab === 'scanner' && (
            <InvoiceScannerView
              onAddTransaction={handleAddTransaction}
              apiKey={apiKey}
              onNavigateToDashboard={() => setCurrentTab('dashboard')}
            />
          )}
          {currentTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
              onUpdateTransaction={handleUpdateTransaction}
              onNavigateToScanner={() => setCurrentTab('scanner')}
              openManualModal={() => setIsManualModalOpen(true)}
            />
          )}
          {currentTab === 'budget' && (
            <BudgetView
              transactions={transactions}
              monthlyBudget={monthlyBudget}
              categoryBudgets={categoryBudgets}
              onUpdateMonthlyBudget={handleUpdateMonthlyBudget}
              onUpdateCategoryBudgets={handleUpdateCategoryBudgets}
            />
          )}
          {currentTab === 'advisor' && (
            <AiAdvisorView
              transactions={transactions}
              monthlyBudget={monthlyBudget}
              categoryBudgets={categoryBudgets}
              apiKey={apiKey}
              openApiKeyModal={() => setIsApiKeyModalOpen(true)}
            />
          )}
        </div>
      </main>

      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--surface-card)',
        padding: '28px 0',
        marginTop: 'auto'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '13px',
          color: 'var(--text-muted)'
        }}>
          <div>
            <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>SpendWise AI</span>
            <span> – AI Đọc Hóa Đơn & Quản Lý Chi Tiêu Cá Nhân</span>
            <div style={{ fontSize: '11px', marginTop: '2px', color: 'var(--emerald-400)' }}>
              Dữ liệu lưu trên MongoDB Atlas • Bảo mật JWT • Device-scoped API Key
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={handleClearData}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '12px', color: '#fb7185' }}
              title="Xóa toàn bộ giao dịch trong sổ"
            >
              <Trash2 size={13} />
              <span>Làm trống sổ chi tiêu</span>
            </button>
            <span>SpendWise AI © 2026 • MongoDB + Express</span>
          </div>
        </div>
      </footer>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
      />
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        currentKey={apiKey}
        onSaveKey={handleSaveApiKey}
      />
      <ManualExpenseModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />
      <ClearDataModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClear}
        transactionCount={transactions.length}
        userName={currentUser?.name || currentUser?.username}
      />

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            {t.type === 'success' ? <CheckCircle2 size={18} color="#34d399" /> : <AlertCircle size={18} color="#38bdf8" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
