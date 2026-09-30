import { supabase, isSupabaseConfigured } from './supabaseClient';
import { storageService } from './storageService';

/**
 * Service trung gian: Nếu đã cấu hình Supabase thì lưu trên Cloud Database,
 * nếu chưa thì tự động đồng bộ mượt mà với LocalStorage để app luôn chạy tốt!
 */
export const supabaseService = {
  // ==========================================
  // 1. QUẢN LÝ TÀI KHOẢN (AUTHENTICATION)
  // ==========================================

  async signUp({ email, password, username, fullName, persona = 'student' }) {
    if (!isSupabaseConfigured()) {
      throw new Error('Chưa cấu hình Supabase URL và Key');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
          persona,
          role: 'user'
        }
      }
    });

    if (error) throw error;
    return data.user;
  },

  async signIn({ email, password }) {
    if (!isSupabaseConfigured()) {
      throw new Error('Chưa cấu hình Supabase URL và Key');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Lấy thông tin profile kèm theo
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      ...data.user,
      profile: profile || {}
    };
  },

  async signOut() {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
  },

  async getCurrentSessionUser() {
    if (!isSupabaseConfigured()) return null;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return {
      ...session.user,
      profile: profile || {}
    };
  },

  // ==========================================
  // 2. LƯU ẢNH HÓA ĐƠN LÊN CLOUD STORAGE
  // ==========================================

  async uploadReceiptImage(fileOrBase64, userId = 'guest') {
    if (!isSupabaseConfigured()) {
      // Nếu chưa có cloud thì lưu dạng data URL local
      return typeof fileOrBase64 === 'string' ? fileOrBase64 : null;
    }

    try {
      let fileBlob = fileOrBase64;
      let fileExt = 'jpg';

      // Chuyển base64 sang Blob nếu người dùng truyền chuỗi base64
      if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:')) {
        const parts = fileOrBase64.split(';base64,');
        const mimeType = parts[0].replace('data:', '');
        fileExt = mimeType.split('/')[1] || 'jpg';
        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        fileBlob = new Blob([byteArray], { type: mimeType });
      } else if (fileOrBase64?.name) {
        fileExt = fileOrBase64.name.split('.').pop() || 'jpg';
      }

      const fileName = `${userId}/${Date.now()}_receipt.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, fileBlob, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.warn('Lỗi upload ảnh lên Supabase Storage:', error);
        return typeof fileOrBase64 === 'string' ? fileOrBase64 : null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.warn('Lỗi xử lý upload ảnh:', err);
      return typeof fileOrBase64 === 'string' ? fileOrBase64 : null;
    }
  },

  // ==========================================
  // 3. QUẢN LÝ GIAO DỊCH & HÓA ĐƠN
  // ==========================================

  async getTransactions(userId, monthKey = null) {
    if (!isSupabaseConfigured()) {
      return storageService.getTransactions(userId);
    }

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false });

    if (monthKey) {
      const startDate = `${monthKey}-01`;
      const endDate = `${monthKey}-31`;
      query = query.gte('transaction_date', startDate).lte('transaction_date', endDate);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Lỗi lấy transactions từ Supabase, fallback local:', error);
      return storageService.getTransactions(userId);
    }

    // Map chuẩn hóa cấu trúc cho giao diện
    return (data || []).map(tx => ({
      id: tx.id,
      merchant: tx.merchant,
      date: tx.transaction_date,
      time: tx.transaction_time || '12:00',
      total: Number(tx.total),
      category: tx.category,
      paymentMethod: tx.payment_method,
      invoiceNumber: tx.invoice_number,
      receiptImageUrl: tx.receipt_image_url,
      vat: Number(tx.vat) || 0,
      discount: Number(tx.discount) || 0,
      notes: tx.notes || '',
      items: tx.items || []
    }));
  },

  async addTransaction(userId, tx) {
    if (!isSupabaseConfigured()) {
      return storageService.addTransaction(userId, tx);
    }

    const record = {
      user_id: userId,
      merchant: tx.merchant || 'Hóa đơn mua sắm',
      transaction_date: tx.date || new Date().toISOString().split('T')[0],
      transaction_time: tx.time || '12:00',
      category: tx.category || 'other',
      payment_method: tx.paymentMethod || 'Tiền mặt',
      invoice_number: tx.invoiceNumber || '',
      total: Number(tx.total) || 0,
      vat: Number(tx.vat) || 0,
      discount: Number(tx.discount) || 0,
      receipt_image_url: tx.receiptImageUrl || null,
      items: tx.items || [],
      notes: tx.notes || ''
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([record])
      .select();

    if (error) {
      console.warn('Lỗi lưu vào Supabase, lưu tạm vào LocalStorage:', error);
      return storageService.addTransaction(userId, tx);
    }

    return data[0];
  },

  async deleteTransaction(userId, txId) {
    if (!isSupabaseConfigured()) {
      return storageService.deleteTransaction(userId, txId);
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', txId)
      .eq('user_id', userId);

    if (error) {
      console.warn('Lỗi xóa Supabase:', error);
      return storageService.deleteTransaction(userId, txId);
    }
  },

  // ==========================================
  // 4. QUẢN LÝ NGÂN SÁCH (BUDGETS)
  // ==========================================

  async getMonthlyBudget(userId, monthKey = '2026-09') {
    if (!isSupabaseConfigured()) {
      return storageService.getMonthlyBudget(userId);
    }

    const { data, error } = await supabase
      .from('monthly_budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month_key', monthKey)
      .maybeSingle();

    if (error || !data) {
      return storageService.getMonthlyBudget(userId);
    }

    return Number(data.monthly_budget);
  },

  async saveMonthlyBudget(userId, monthKey, budgetAmount, categoryBudgets = {}) {
    if (!isSupabaseConfigured()) {
      return storageService.saveMonthlyBudget(userId, budgetAmount);
    }

    const { data, error } = await supabase
      .from('monthly_budgets')
      .upsert({
        user_id: userId,
        month_key: monthKey,
        monthly_budget: Number(budgetAmount),
        category_budgets: categoryBudgets,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, month_key' });

    if (error) {
      console.warn('Lỗi lưu budget Supabase:', error);
      storageService.saveMonthlyBudget(userId, budgetAmount);
    }
  }
};
