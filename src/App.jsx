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
import { storageService } from './services/storageService';
import { authApi, transactionsApi, checkServerHealth } from './services/apiService';
import { CheckCircle2, AlertCircle, Trash2, WifiOff, Loader2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);     // Đang khởi tạo
  const [serverOnline, setServerOnline] = useState(true); // Trạng thái server
  const [isOfflineMode, setIsOfflineMode] = useState(() => {
    return localStorage.getItem('spendwise_offline_mode') === 'true';
  });

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
  const [toasts, setToasts] = useState([]);

  // ─── Toast helper ───────────────────────────────────────────────────────
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // ─── Tải transactions từ MongoDB / LocalStorage ──────────────────────────
  const loadTransactions = useCallback(async (offline = isOfflineMode) => {
    if (offline) {
      const localTxs = storageService.getTransactions('offline_user');
      setTransactions(localTxs || []);
      return;
    }
    try {
      const data = await transactionsApi.getAll();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Lỗi tải giao dịch:', err);
      addToast('Không thể tải danh sách giao dịch từ Cloud. Bạn có thể dùng chế độ Offline.', 'error');
    }
  }, [isOfflineMode]);

  // ─── Kích hoạt chế độ Offline ───────────────────────────────────────────
  const enableOfflineMode = () => {
    localStorage.setItem('spendwise_offline_mode', 'true');
    setIsOfflineMode(true);
    setServerOnline(true);
    const offlineUser = {
      _id: 'offline_user',
      id: 'offline_user',
      username: 'offline_user',
      name: 'Người dùng Thiết bị',
      role: 'Sinh viên'
    };
    setCurrentUser(offlineUser);
    const savedBudget = storageService.getMonthlyBudget('offline_user');
    setMonthlyBudget(savedBudget || 10000000);
    const savedCatBudgets = storageService.getCategoryBudgets('offline_user');
    setCategoryBudgets(savedCatBudgets || {});
    loadTransactions(true);
    addToast('Đã chuyển sang chế độ Ngoại tuyến (Lưu dữ liệu trên máy).', 'info');
  };

  const switchBackToCloudMode = async () => {
    localStorage.removeItem('spendwise_offline_mode');
    setIsOfflineMode(false);
    setIsLoading(true);
    const online = await checkServerHealth();
    setServerOnline(online);
    if (!online) {
      setIsLoading(false);
      addToast('Máy chủ Cloud vẫn chưa phản hồi. Vui lòng thử lại sau.', 'error');
      return;
    }
    setCurrentUser(null);
    setTransactions([]);
    setIsLoading(false);
    addToast('Đã kết nối lại Cloud. Vui lòng đăng nhập.', 'success');
  };

  // ─── Khởi tạo app khi mount ─────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      // Lấy settings local (API key, theme)
      const savedKey = storageService.getApiKey();
      const savedTheme = storageService.getTheme();
      setApiKey(savedKey);
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);

      // Nếu đang bật chế độ offline
      if (localStorage.getItem('spendwise_offline_mode') === 'true') {
        const offlineUser = {
          _id: 'offline_user',
          id: 'offline_user',
          username: 'offline_user',
          name: 'Người dùng Thiết bị',
          role: 'Sinh viên'
        };
        setCurrentUser(offlineUser);
        setMonthlyBudget(storageService.getMonthlyBudget('offline_user') || 10000000);
        setCategoryBudgets(storageService.getCategoryBudgets('offline_user') || {});
        loadTransactions(true);
        setIsLoading(false);
        return;
      }

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
          await loadTransactions(false);
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
    addToast(`Chào mừng ${user.name}! Đã vào sổ chi tiêu cá nhân.`);
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

  // ─── CRUD giao dịch (Cloud API hoặc Offline LocalStorage) ──────────────
  const handleAddTransaction = async (newTx) => {
    if (!currentUser) return;
    if (isOfflineMode) {
      const saved = storageService.saveTransaction('offline_user', newTx);
      setTransactions(prev => [saved, ...prev]);
      addToast(`Đã lưu hóa đơn "${newTx.merchant}" vào máy!`);
      setCurrentTab('dashboard');
      return;
    }
    try {
      const { transaction } = await transactionsApi.add(newTx);
      setTransactions(prev => [transaction, ...prev]);
      addToast(`Đã lưu hóa đơn "${newTx.merchant}" lên MongoDB!`);
      setCurrentTab('dashboard');
    } catch (err) {
      addToast(`Lỗi lưu giao dịch: ${err.message}`, 'error');
    }
  };

  const handleUpdateTransaction = async (id, updatedTx) => {
    if (!currentUser) return;
    if (isOfflineMode) {
      const updated = storageService.updateTransaction('offline_user', id, updatedTx);
      setTransactions(prev => prev.map(t => (t.id === id || t._id === id ? updated : t)));
      addToast(`Đã cập nhật "${updatedTx.merchant}"!`);
      return;
    }
    try {
      const { transaction } = await transactionsApi.update(id, updatedTx);
      setTransactions(prev => prev.map(t => (t._id === id ? transaction : t)));
      addToast(`Đã cập nhật "${updatedTx.merchant}"!`);
    } catch (err) {
      addToast(`Lỗi cập nhật: ${err.message}`, 'error');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!currentUser) return;
    if (isOfflineMode) {
      storageService.deleteTransaction('offline_user', id);
      setTransactions(prev => prev.filter(t => t.id !== id && t._id !== id));
      addToast('Đã xóa giao dịch.', 'info');
      return;
    }
    try {
      await transactionsApi.delete(id);
      setTransactions(prev => prev.filter(t => t._id !== id));
      addToast('Đã xóa giao dịch.', 'info');
    } catch (err) {
      addToast(`Lỗi xóa giao dịch: ${err.message}`, 'error');
    }
  };

  // ─── Ngân sách (lưu vào MongoDB hoặc LocalStorage) ──────────────────────
  const handleUpdateMonthlyBudget = async (amount) => {
    if (!currentUser) return;
    if (isOfflineMode) {
      storageService.saveMonthlyBudget('offline_user', amount);
      setMonthlyBudget(amount);
      addToast('Đã cập nhật hạn mức ngân sách tháng!');
      return;
    }
    try {
      await authApi.updateProfile({ monthlyBudget: amount });
      setMonthlyBudget(amount);
      addToast('Đã cập nhật hạn mức ngân sách tháng!');
    } catch (err) {
      addToast(`Lỗi cập nhật ngân sách: ${err.message}`, 'error');
    }
  };

  const handleUpdateCategoryBudgets = async (budgets) => {
    if (!currentUser) return;
    if (isOfflineMode) {
      storageService.saveCategoryBudgets('offline_user', budgets);
      setCategoryBudgets(budgets);
      addToast('Đã cập nhật ngân sách danh mục!');
      return;
    }
    try {
      await authApi.updateProfile({ categoryBudgets: budgets });
      setCategoryBudgets(budgets);
      addToast('Đã cập nhật ngân sách danh mục!');
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

  // ─── Xóa toàn bộ dữ liệu ────────────────────────────────────────────────
  const handleClearData = async () => {
    if (!currentUser) return;
    if (!window.confirm(`Xóa toàn bộ giao dịch của [${currentUser.name}] trên MongoDB?\nHành động này KHÔNG THỂ hoàn tác!`)) return;
    try {
      await transactionsApi.deleteAll();
      setTransactions([]);
      addToast('Đã xóa sạch sổ chi tiêu. Bắt đầu ghi nhận dữ liệu thực tế!');
    } catch (err) {
      addToast(`Lỗi xóa dữ liệu: ${err.message}`, 'error');
    }
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
  if (!serverOnline && !isOfflineMode) {
    const rawUrl = import.meta.env.VITE_API_URL || 'localhost:5000';
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
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Máy chủ Cloud chưa phản hồi</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '440px', lineHeight: '1.6' }}>
            Không thể kết nối đến máy chủ tại <code style={{ color: '#34d399', wordBreak: 'break-all' }}>{rawUrl}</code>.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '10px' }}>
            Bạn có thể thử lại hoặc bấm <strong>Dùng Chế độ Ngoại tuyến</strong> để vào app trải nghiệm ngay mà không cần chờ server!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => window.location.reload()}
          >
            Thử lại kết nối
          </button>
          <button
            className="btn btn-primary"
            onClick={enableOfflineMode}
          >
            ⚡ Dùng Chế độ Ngoại tuyến (Vào app ngay)
          </button>
        </div>
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
