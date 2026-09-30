export const EXPENSE_CATEGORIES = {
  food: {
    id: 'food',
    name: 'Ăn uống',
    englishName: 'Food & Dining',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    badgeClass: 'badge-food',
    icon: 'Utensils',
    defaultBudget: 4000000,
    keywords: ['cà phê', 'coffee', 'trà', 'tea', 'phở', 'bún', 'cơm', 'bánh', 'thịt', 'cá', 'rau', 'mì', 'highlands', 'phúc long', 'starbucks', 'kfc', 'lotteria', 'ăn', 'uống', 'bia', 'sữa', 'nước ngọt', 'snack', 'lẩu', 'buffet']
  },
  shopping: {
    id: 'shopping',
    name: 'Mua sắm',
    englishName: 'Shopping & Retail',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    badgeClass: 'badge-shopping',
    icon: 'ShoppingBag',
    defaultBudget: 2500000,
    keywords: ['quần', 'áo', 'giày', 'dép', 'mỹ phẩm', 'son', 'siêu thị', 'coopmart', 'winmart', 'shopee', 'lazada', 'tiki', 'điện thoại', 'tai nghe', 'balo', 'túi xách', 'đồ gia dụng', 'nồi', 'chảo']
  },
  transport: {
    id: 'transport',
    name: 'Đi lại',
    englishName: 'Transportation',
    color: '#0ea5e9',
    bgColor: 'rgba(14, 165, 233, 0.15)',
    borderColor: 'rgba(14, 165, 233, 0.3)',
    badgeClass: 'badge-transport',
    icon: 'Car',
    defaultBudget: 1500000,
    keywords: ['xăng', 'petrolimex', 'grab', 'be', 'gojek', 'taxi', 'vé xe', 'gửi xe', 'rửa xe', 'thay nhớt', 'vé máy bay', 'tàu hỏa', 'bảo dưỡng xe']
  },
  education: {
    id: 'education',
    name: 'Học tập',
    englishName: 'Education',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    badgeClass: 'badge-education',
    icon: 'GraduationCap',
    defaultBudget: 1200000,
    keywords: ['sách', 'vở', 'bút', 'nhà sách', 'fahasa', 'phương nam', 'học phí', 'khóa học', 'tiếng anh', 'ielts', 'udemy', 'coursera', 'giáo trình', 'photocopy', 'in ấn']
  },
  living: {
    id: 'living',
    name: 'Sinh hoạt',
    englishName: 'Living & Bills',
    color: '#f43f5e',
    bgColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: 'rgba(244, 63, 94, 0.3)',
    badgeClass: 'badge-living',
    icon: 'Home',
    defaultBudget: 3500000,
    keywords: ['tiền điện', 'evn', 'tiền nước', 'sawaco', 'tiền mạng', 'internet', 'fpt', 'viettel', 'vnpt', 'tiền phòng', 'tiền nhà', 'dầu gội', 'kem đánh răng', 'bột giặt', 'nước xả', 'khăn giấy']
  },
  other: {
    id: 'other',
    name: 'Khác',
    englishName: 'Other / Leisure',
    color: '#64748b',
    bgColor: 'rgba(100, 116, 139, 0.15)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
    badgeClass: 'badge-other',
    icon: 'MoreHorizontal',
    defaultBudget: 1000000,
    keywords: ['xem phim', 'cgv', 'lotte cinema', 'thuốc', 'nhà thuốc', 'long châu', 'khám bệnh', 'quà tặng', 'hiếu hỉ', 'du lịch', 'khách sạn', 'spa']
  }
};

export const DEFAULT_MONTHLY_BUDGET = 13700000;

export function categorizeItemOrMerchant(text) {
  if (!text) return 'other';
  const lower = text.toLowerCase();
  for (const [catKey, cat] of Object.entries(EXPENSE_CATEGORIES)) {
    if (cat.keywords.some(k => lower.includes(k))) {
      return catKey;
    }
  }
  return 'other';
}
