import { createClient } from '@supabase/supabase-js';

// Cấu hình URL và Anon Key của Supabase từ biến môi trường .env hoặc localStorage
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('spendwise_supabase_url') || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('spendwise_supabase_anon_key') || '';

// Khởi tạo Supabase client nếu đã có thông tin cấu hình
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

/**
 * Kiểm tra xem ứng dụng đã kết nối với Supabase Cloud hay chưa
 */
export function isSupabaseConfigured() {
  return Boolean(supabase);
}

/**
 * Cập nhật cấu hình Supabase trực tiếp từ giao diện (nếu không dùng file .env)
 */
export function configureSupabaseCredentials(url, anonKey) {
  if (url && anonKey) {
    localStorage.setItem('spendwise_supabase_url', url.trim());
    localStorage.setItem('spendwise_supabase_anon_key', anonKey.trim());
    window.location.reload();
  }
}
