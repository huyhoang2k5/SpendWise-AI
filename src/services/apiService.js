/**
 * apiService.js
 * Lớp giao tiếp HTTP giữa React frontend và Express/MongoDB backend.
 * Tất cả request đều gắn JWT token từ localStorage.
 */

// Dùng biến env VITE_API_URL khi deploy production (Railway URL)
// Khi dev local: dùng '/api' (Vite proxy → localhost:5000)
const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
const BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/+$/, '')}/api`;


// ─── Helper: lấy token từ localStorage ──────────────────────────────────
const getToken = () => localStorage.getItem('spendwise_token');

// ─── Helper: tạo headers chuẩn ──────────────────────────────────────────
const buildHeaders = (withAuth = true) => {
  const headers = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// ─── Helper: xử lý response ─────────────────────────────────────────────
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
};

// ════════════════════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════════════════════

export const authApi = {
  /**
   * Đăng ký tài khoản mới
   * @returns {{ success, token, user }}
   */
  register: async (userData) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: buildHeaders(false),
      body: JSON.stringify(userData)
    });
    const data = await handleResponse(res);
    // Lưu token
    if (data.token) localStorage.setItem('spendwise_token', data.token);
    return data;
  },

  /**
   * Đăng nhập (hỗ trợ cả dạng tham số (username, password) và dạng object ({ username, password }))
   * @returns {{ success, token, user }}
   */
  login: async (usernameOrObj, maybePassword) => {
    let username, password;
    if (typeof usernameOrObj === 'object' && usernameOrObj !== null) {
      username = usernameOrObj.username;
      password = usernameOrObj.password;
    } else {
      username = usernameOrObj;
      password = maybePassword;
    }
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: buildHeaders(false),
      body: JSON.stringify({ username, password })
    });
    const data = await handleResponse(res);
    if (data.token) localStorage.setItem('spendwise_token', data.token);
    return data;
  },

  /**
   * Đăng ký hoặc đăng nhập thông qua Google (Gmail)
   * @param {{ email, name, avatar, googleId }} googleData
   * @returns {{ success, token, user }}
   */
  googleAuth: async (googleData) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/google`, {
        method: 'POST',
        headers: buildHeaders(false),
        body: JSON.stringify(googleData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) localStorage.setItem('spendwise_token', data.token);
        return data;
      }
    } catch (e) {
      console.warn('POST /auth/google unavailable, falling back to standard auth:', e);
    }

    // Fallback tự động: nếu /auth/google chưa có trên máy chủ backend cũ,
    // tự động đăng ký hoặc đăng nhập thông qua /auth/register và /auth/login sẵn có
    const cleanEmail = (googleData.email || '').toLowerCase().trim();
    let baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    if (baseUsername.length < 3) baseUsername = `${baseUsername}_gg`;
    if (baseUsername.length > 24) baseUsername = baseUsername.slice(0, 24);

    const fallbackPassword = `Gg#${baseUsername}!2026`;

    // 1. Thử login trước
    try {
      const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: buildHeaders(false),
        body: JSON.stringify({ username: baseUsername, password: fallbackPassword })
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        if (loginData.token) localStorage.setItem('spendwise_token', loginData.token);
        return loginData;
      }
    } catch {
      // Tiếp tục xuống bước register nếu chưa có tài khoản
    }

    // 2. Tự động tạo tài khoản qua /auth/register
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: buildHeaders(false),
      body: JSON.stringify({
        username: baseUsername,
        password: fallbackPassword,
        name: googleData.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'Sinh viên',
        roleCode: 'student',
        monthlyBudget: 10000000,
        avatar: googleData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`
      })
    });
    const regData = await regRes.json();
    if (!regRes.ok) {
      if (regData.error && (regData.error.includes('tồn tại') || regData.error.includes('đã được'))) {
        throw new Error(`Email ${cleanEmail} đã được tạo tài khoản trong hệ thống. Vui lòng đăng nhập bằng Tên đăng nhập và Mật khẩu ở tab Đăng Nhập.`);
      }
      throw new Error(regData.error || `HTTP ${regRes.status}`);
    }
    if (regData.token) localStorage.setItem('spendwise_token', regData.token);
    return regData;
  },

  /**
   * Xác thực mật khẩu người dùng
   * @returns {{ success, token, user }}
   */
  verifyPassword: async (username, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: buildHeaders(false),
      body: JSON.stringify({ username, password })
    });
    return handleResponse(res);
  },

  /**
   * Lấy thông tin user hiện tại từ token
   */
  getMe: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: buildHeaders()
    });
    return handleResponse(res);
  },

  /**
   * Cập nhật hồ sơ cá nhân
   */
  updateProfile: async (profileData) => {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(res);
  },

  /**
   * Đăng xuất - xóa token local
   */
  logout: () => {
    localStorage.removeItem('spendwise_token');
    localStorage.removeItem('spendwise_current_user_personal');
  },

  /**
   * Kiểm tra có token hợp lệ không
   */
  hasToken: () => {
    return Boolean(getToken());
  }
};

// ════════════════════════════════════════════════════════════════════════════
// TRANSACTIONS
// ════════════════════════════════════════════════════════════════════════════

export const transactionsApi = {
  /**
   * Lấy tất cả giao dịch, tùy chọn lọc theo tháng
   * @param {string} [month] - 'YYYY-MM' (tùy chọn)
   * @returns {{ success, transactions: [] }}
   */
  getAll: async (month = null) => {
    const url = month
      ? `${BASE_URL}/transactions?month=${month}`
      : `${BASE_URL}/transactions`;
    const res = await fetch(url, { headers: buildHeaders() });
    return handleResponse(res);
  },

  /**
   * Thêm giao dịch mới
   * @param {Object} txData
   * @returns {{ success, transaction }}
   */
  add: async (txData) => {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(txData)
    });
    return handleResponse(res);
  },

  /**
   * Cập nhật giao dịch
   * @param {string} id - MongoDB _id
   * @param {Object} updates
   * @returns {{ success, transaction }}
   */
  update: async (id, updates) => {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse(res);
  },

  /**
   * Xóa một giao dịch
   * @param {string} id - MongoDB _id
   */
  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: buildHeaders()
    });
    return handleResponse(res);
  },

  /**
   * Xóa toàn bộ giao dịch của user (yêu cầu mật khẩu xác nhận)
   * @param {string} password
   */
  deleteAll: async (password) => {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: 'DELETE',
      headers: buildHeaders(),
      body: JSON.stringify({ password })
    });
    return handleResponse(res);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ════════════════════════════════════════════════════════════════════════════
export const checkServerHealth = async () => {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
};


