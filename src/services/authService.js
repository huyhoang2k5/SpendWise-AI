// Multi-tenancy Authentication & Account Service for Personal Finance
export const USER_PERSONAS = [];

const AUTH_KEY = 'spendwise_current_user_personal';
const USERS_LIST_KEY = 'spendwise_real_users_v1';

export const authService = {
  getUsersList: () => {
    try {
      const data = localStorage.getItem(USERS_LIST_KEY);
      if (data) return JSON.parse(data);
      return [];
    } catch {
      return [];
    }
  },

  saveUsersList: (users) => {
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
  },

  getCurrentUser: () => {
    try {
      const data = localStorage.getItem(AUTH_KEY);
      if (data) return JSON.parse(data);
      return null;
    } catch {
      return null;
    }
  },

  setCurrentUser: (user) => {
    if (!user) {
      localStorage.removeItem(AUTH_KEY);
    } else {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    }
  },

  // Login authentication check via Username (or optional Email fallback)
  login: (loginIdentifier, password) => {
    const users = authService.getUsersList();
    const query = (loginIdentifier || '').trim().toLowerCase();
    
    if (!query) {
      return { success: false, error: 'Vui lòng nhập tên đăng nhập của bạn!' };
    }

    const found = users.find(u => 
      (u.username && u.username.toLowerCase() === query) ||
      (u.email && u.email.toLowerCase() === query)
    );
    
    if (!found) {
      return { success: false, error: 'Tên đăng nhập không tồn tại trong hệ thống!' };
    }

    if (found.password && found.password !== password) {
      return { success: false, error: 'Mật khẩu không chính xác! Vui lòng thử lại.' };
    }

    authService.setCurrentUser(found);
    return { success: true, user: found };
  },

  logout: () => {
    authService.setCurrentUser(null);
  },

  // Register with unique Username, plus optional Gmail/email as profile info
  register: ({ username, name, email, password, role, defaultBudget, avatar }) => {
    const users = authService.getUsersList();
    const cleanUsername = (username || '').trim().toLowerCase();
    
    if (!cleanUsername) {
      return { success: false, error: 'Vui lòng nhập tên đăng nhập!' };
    }

    // Check if username has spaces or invalid format
    if (/\s/.test(cleanUsername)) {
      return { success: false, error: 'Tên đăng nhập không được chứa khoảng trắng!' };
    }

    const existingUser = users.find(u => u.username && u.username.toLowerCase() === cleanUsername);
    if (existingUser) {
      return { success: false, error: 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác!' };
    }

    const newUser = {
      id: 'user-' + Date.now(),
      username: cleanUsername,
      name: (name || cleanUsername).trim(),
      email: email ? email.trim().toLowerCase() : '',
      password: password || '123',
      role: role || 'Sinh viên',
      roleCode: 'custom',
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      description: 'Tài khoản người dùng cá nhân (Dữ liệu bảo mật riêng tư)',
      defaultBudget: Number(defaultBudget) || 10000000,
      monthlyBudget: Number(defaultBudget) || 10000000,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    const updated = [...users, newUser];
    authService.saveUsersList(updated);
    authService.setCurrentUser(newUser);
    return { success: true, user: newUser };
  },

  updateProfile: (userId, updatedFields) => {
    const users = authService.getUsersList();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) {
      return { success: false, error: 'Không tìm thấy tài khoản để cập nhật!' };
    }

    // Check username duplication if username changed
    if (updatedFields.username) {
      const cleanUser = updatedFields.username.trim().toLowerCase();
      if (cleanUser !== (users[idx].username || '').toLowerCase()) {
        const dup = users.find(u => u.id !== userId && u.username && u.username.toLowerCase() === cleanUser);
        if (dup) {
          return { success: false, error: 'Tên đăng nhập này đã trùng với một tài khoản khác!' };
        }
      }
    }

    const updatedUser = {
      ...users[idx],
      ...updatedFields,
      username: updatedFields.username !== undefined ? updatedFields.username.trim().toLowerCase() : users[idx].username,
      name: updatedFields.name !== undefined ? updatedFields.name.trim() : users[idx].name,
      email: updatedFields.email !== undefined ? updatedFields.email.trim().toLowerCase() : users[idx].email,
      role: updatedFields.role !== undefined ? updatedFields.role.trim() : users[idx].role,
      defaultBudget: updatedFields.defaultBudget !== undefined ? Number(updatedFields.defaultBudget) : (updatedFields.monthlyBudget !== undefined ? Number(updatedFields.monthlyBudget) : users[idx].defaultBudget),
      monthlyBudget: updatedFields.monthlyBudget !== undefined ? Number(updatedFields.monthlyBudget) : (updatedFields.defaultBudget !== undefined ? Number(updatedFields.defaultBudget) : users[idx].monthlyBudget || users[idx].defaultBudget),
      password: updatedFields.password !== undefined ? updatedFields.password : users[idx].password,
      avatar: updatedFields.avatar !== undefined ? updatedFields.avatar : users[idx].avatar
    };

    users[idx] = updatedUser;
    authService.saveUsersList(users);
    authService.setCurrentUser(updatedUser);
    return { success: true, user: updatedUser };
  }
};
