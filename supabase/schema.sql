-- ==============================================================================
-- SPENDWISE AI - POSTGRESQL DATABASE SCHEMA (CHO SUPABASE)
-- ==============================================================================
-- Hướng dẫn: Mở Supabase Dashboard -> Vào mục SQL Editor -> Dán toàn bộ file này -> Nhấn RUN.

-- 1. BẢNG HỒ SƠ NGƯỜI DÙNG (PROFILES)
-- Liên kết 1-1 với bảng tài khoản auth.users của Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  persona TEXT DEFAULT 'student', -- 'student' (Sinh viên), 'office' (Văn phòng), 'family' (Gia đình)
  role TEXT DEFAULT 'user',        -- 'admin', 'user'
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG NGÂN SÁCH THÁNG (MONTHLY_BUDGETS)
CREATE TABLE IF NOT EXISTS public.monthly_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  month_key TEXT NOT NULL,         -- Ví dụ: '2026-09', '2026-10'
  monthly_budget BIGINT NOT NULL DEFAULT 10000000, -- Mặc định 10 triệu đ
  category_budgets JSONB DEFAULT '{}'::jsonb,      -- Ngân sách chi tiết từng nhóm
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_key)
);

-- 3. BẢNG GIAO DỊCH & HÓA ĐƠN (TRANSACTIONS)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  merchant TEXT NOT NULL,          -- Tên cửa hàng: 'VINMART+ VINCOM CENTER'
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Ngày phát sinh giao dịch
  transaction_time TIME DEFAULT '12:00:00',
  category TEXT NOT NULL DEFAULT 'other', -- 'food', 'living', 'shopping', 'transport', 'education', 'other'
  payment_method TEXT DEFAULT 'Tiền mặt', -- 'Chuyển khoản VietQR', 'MoMo', 'Thẻ'
  invoice_number TEXT,             -- Số hóa đơn
  total BIGINT NOT NULL DEFAULT 0, -- Tổng tiền thanh toán (VNĐ)
  vat BIGINT DEFAULT 0,            -- Tiền thuế GTGT
  discount BIGINT DEFAULT 0,       -- Giảm giá nếu có
  receipt_image_url TEXT,          -- Link ảnh hóa đơn lưu tại Supabase Storage
  items JSONB DEFAULT '[]'::jsonb, -- Danh sách các món hàng bóc tách từ ảnh AI
  notes TEXT,                      -- Ghi chú của người dùng
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG NHẬT KÝ HỆ THỐNG / AUDIT LOGS (CHO ADMIN QUẢN TRỊ)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  log_type TEXT DEFAULT 'user',    -- 'system', 'ocr', 'budget', 'ai'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- BẢO MẬT DỮ LIỆU: ROW LEVEL SECURITY (RLS)
-- Đảm bảo mỗi người dùng CHỈ CÓ THỂ xem và chỉnh sửa dữ liệu của chính mình!
-- ==============================================================================

-- Bật RLS cho các bảng
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Chính sách bảo mật cho PROFILES
CREATE POLICY "Người dùng tự xem hồ sơ của mình" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Người dùng tự cập nhật hồ sơ của mình" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Chính sách bảo mật cho MONTHLY_BUDGETS
CREATE POLICY "Người dùng quản lý ngân sách của mình" 
ON public.monthly_budgets FOR ALL USING (auth.uid() = user_id);

-- Chính sách bảo mật cho TRANSACTIONS
CREATE POLICY "Người dùng quản lý hóa đơn của mình" 
ON public.transactions FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- TỰ ĐỘNG KHỞI TẠO HỒ SƠ KHI ĐĂNG KÝ (TRIGGER FUNCTION)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, persona, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Người dùng SpendWise'),
    COALESCE(NEW.raw_user_meta_data->>'persona', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );

  -- Tự động tạo ngân sách mặc định tháng hiện tại cho người mới
  INSERT INTO public.monthly_budgets (user_id, month_key, monthly_budget)
  VALUES (NEW.id, to_char(CURRENT_DATE, 'YYYY-MM'), 10000000);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gắn trigger vào bảng auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- STORAGE BUCKET ĐỂ LƯU ẢNH HÓA ĐƠN (RECEIPTS)
-- Tạo bucket 'receipts' cho phép upload và đọc ảnh hóa đơn
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Cho phép người dùng upload ảnh hóa đơn"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');

CREATE POLICY "Cho phép mọi người xem ảnh hóa đơn công khai theo link"
ON storage.objects FOR SELECT 
USING (bucket_id = 'receipts');
