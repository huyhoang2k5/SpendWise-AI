import { INITIAL_TRANSACTIONS } from '../constants/sampleData';
import { EXPENSE_CATEGORIES, DEFAULT_MONTHLY_BUDGET } from '../constants/categories';

const KEYS = {
  TRANSACTIONS_PREFIX: 'spendwise_tx_',
  BUDGET_PREFIX: 'spendwise_budget_',
  CAT_BUDGET_PREFIX: 'spendwise_cat_budgets_',
  API_KEY: 'spendwise_gemini_api_key',
  THEME: 'spendwise_theme',
  AUDIT_LOGS: 'spendwise_audit_logs'
};

// Historical 3-month (Month 8, 7, 6 / 2026) transactions tailored per persona
function getDefaultHistoricalMonthsTransactionsForUser(userId, roleCode) {
  if (roleCode === 'student' || userId === 'user-student') {
    return [
      // Tháng 08/2026
      {
        id: 'tx-stu-prev-1',
        merchant: 'Nhà Sách Fahasa Nguyễn Huệ',
        date: '2026-08-28',
        time: '16:30',
        total: 310000,
        category: 'education',
        paymentMethod: 'VietQR',
        invoiceNumber: 'FHS-082841',
        notes: 'Mua giáo trình chuyên ngành và tập vở kỳ mới',
        items: [
          { name: 'Giáo trình Lập Trình Cơ Bản', quantity: 1, unitPrice: 135000, total: 135000, category: 'education' },
          { name: 'Tập vở sinh viên 200 trang (lốc 5)', quantity: 1, unitPrice: 95000, total: 95000, category: 'education' },
          { name: 'Bút viết Zebra Sarasa Clip (x4)', quantity: 4, unitPrice: 20000, total: 80000, category: 'education' }
        ]
      },
      {
        id: 'tx-stu-prev-2',
        merchant: 'Tiền Trọ & Điện Nước KTX Dịch Vụ',
        date: '2026-08-05',
        time: '08:30',
        total: 2150000,
        category: 'living',
        paymentMethod: 'Chuyển khoản',
        invoiceNumber: 'TRO-082026',
        notes: 'Thanh toán tiền phòng trọ và điện nước tháng 8',
        items: [{ name: 'Tiền phòng trọ + điện nước tháng 8', quantity: 1, unitPrice: 2150000, total: 2150000, category: 'living' }]
      },
      {
        id: 'tx-stu-prev-3',
        merchant: 'Highlands Coffee Làng Đại Học',
        date: '2026-08-15',
        time: '14:20',
        total: 89000,
        category: 'food',
        paymentMethod: 'MoMo',
        invoiceNumber: 'HL-08159',
        notes: 'Cà phê học bài nhóm ôn thi chứng chỉ',
        items: [
          { name: 'Cà phê Phin Sữa Đá (L)', quantity: 1, unitPrice: 45000, total: 45000, category: 'food' },
          { name: 'Bánh mì que pate giòn', quantity: 2, unitPrice: 22000, total: 44000, category: 'food' }
        ]
      },
      {
        id: 'tx-stu-prev-4',
        merchant: 'Cây xăng Petrolimex Q.Thủ Đức',
        date: '2026-08-20',
        time: '17:30',
        total: 75000,
        category: 'transport',
        paymentMethod: 'Tiền mặt',
        invoiceNumber: 'PLX-0820',
        notes: 'Đổ xăng xe máy đi làm thêm',
        items: [{ name: 'Xăng RON 95-III', quantity: 1, unitPrice: 75000, total: 75000, category: 'transport' }]
      },
      {
        id: 'tx-stu-prev-5',
        merchant: 'Quán Cơm Bình Dân Làng ĐH',
        date: '2026-08-12',
        time: '11:45',
        total: 45000,
        category: 'food',
        paymentMethod: 'Tiền mặt',
        invoiceNumber: 'CB-0812',
        notes: 'Cơm trưa sinh viên sườn bì chả + canh chua',
        items: [{ name: 'Cơm sườn chả + trà đá', quantity: 1, unitPrice: 45000, total: 45000, category: 'food' }]
      },
      {
        id: 'tx-stu-prev-6',
        merchant: 'Sách Học Luyện Thi IELTS Collins',
        date: '2026-08-22',
        time: '19:15',
        total: 180000,
        category: 'education',
        paymentMethod: 'VietQR',
        invoiceNumber: 'IEL-0822',
        notes: 'Mua sách ôn từ vựng tiếng Anh',
        items: [{ name: 'Collins Vocabulary for IELTS', quantity: 1, unitPrice: 180000, total: 180000, category: 'education' }]
      },

      // Tháng 07/2026
      {
        id: 'tx-stu-m07-1',
        merchant: 'Nhà Sách Fahasa Tân Định',
        date: '2026-07-26',
        time: '15:30',
        total: 245000,
        category: 'education',
        paymentMethod: 'VietQR',
        invoiceNumber: 'FHS-0726',
        notes: 'Sách tự học tiếng Nhật N3 và sổ ghi chép',
        items: [
          { name: 'Sách Mimikara Oboeru N3', quantity: 1, unitPrice: 165000, total: 165000, category: 'education' },
          { name: 'Sổ lò xo kẻ ngang Campus B5', quantity: 2, unitPrice: 40000, total: 80000, category: 'education' }
        ]
      },
      {
        id: 'tx-stu-m07-2',
        merchant: 'Tiền Trọ & Điện Nước KTX Dịch Vụ',
        date: '2026-07-05',
        time: '08:00',
        total: 2100000,
        category: 'living',
        paymentMethod: 'Chuyển khoản',
        invoiceNumber: 'TRO-072026',
        notes: 'Tiền phòng trọ và nước sinh hoạt tháng 7',
        items: [{ name: 'Tiền trọ KTX dịch vụ sinh viên tháng 7', quantity: 1, unitPrice: 2100000, total: 2100000, category: 'living' }]
      },
      {
        id: 'tx-stu-m07-3',
        merchant: 'Phúc Long Coffee & Tea Đỗ Xuân Hợp',
        date: '2026-07-18',
        time: '14:40',
        total: 95000,
        category: 'food',
        paymentMethod: 'MoMo',
        invoiceNumber: 'PL-0718',
        notes: 'Trà sữa Phúc Long & Trà đào cam sả',
        items: [
          { name: 'Trà Sữa Phúc Long (L)', quantity: 1, unitPrice: 55000, total: 55000, category: 'food' },
          { name: 'Bánh croissant phô mai', quantity: 1, unitPrice: 40000, total: 40000, category: 'food' }
        ]
      },
      {
        id: 'tx-stu-m07-4',
        merchant: 'Cây xăng Petrolimex Q.9',
        date: '2026-07-20',
        time: '17:15',
        total: 70000,
        category: 'transport',
        paymentMethod: 'Tiền mặt',
        invoiceNumber: 'PLX-0720',
        notes: 'Đổ xăng xe máy',
        items: [{ name: 'Xăng RON 95-III', quantity: 1, unitPrice: 70000, total: 70000, category: 'transport' }]
      },
      {
        id: 'tx-stu-m07-5',
        merchant: 'Quán Cơm Tấm Đêm Sinh Viên',
        date: '2026-07-14',
        time: '20:30',
        total: 40000,
        category: 'food',
        paymentMethod: 'Tiền mặt',
        invoiceNumber: 'CT-0714',
        notes: 'Ăn tối cơm sườn ốp la',
        items: [{ name: 'Cơm sườn ốp la + canh rong biển', quantity: 1, unitPrice: 40000, total: 40000, category: 'food' }]
      },

      // Tháng 06/2026
      {
        id: 'tx-stu-m06-1',
        merchant: 'Nhà Sách Fahasa Nguyễn Huệ',
        date: '2026-06-25',
        time: '16:00',
        total: 195000,
        category: 'education',
        paymentMethod: 'VietQR',
        invoiceNumber: 'FHS-0625',
        notes: 'Sách kỹ năng mềm và bộ bút dạ quang',
        items: [
          { name: 'Sách Kỹ Năng Giao Tiếp Đỉnh Cao', quantity: 1, unitPrice: 125000, total: 125000, category: 'education' },
          { name: 'Bộ bút nhớ dòng pastel (bộ 4 cây)', quantity: 1, unitPrice: 70000, total: 70000, category: 'education' }
        ]
      },
      {
        id: 'tx-stu-m06-2',
        merchant: 'Tiền Trọ & Điện Nước KTX Dịch Vụ',
        date: '2026-06-05',
        time: '08:30',
        total: 2100000,
        category: 'living',
        paymentMethod: 'Chuyển khoản',
        invoiceNumber: 'TRO-062026',
        notes: 'Tiền phòng trọ và điện nước tháng 6',
        items: [{ name: 'Tiền phòng trọ KTX dịch vụ tháng 6', quantity: 1, unitPrice: 2100000, total: 2100000, category: 'living' }]
      },
      {
        id: 'tx-stu-m06-3',
        merchant: 'Quán Trà Sữa TocoToco Làng ĐH',
        date: '2026-06-19',
        time: '19:45',
        total: 55000,
        category: 'food',
        paymentMethod: 'MoMo',
        invoiceNumber: 'TC-0619',
        notes: 'Trà sữa trân châu hoàng gia giải khát mùa thi',
        items: [{ name: 'Trà Sữa Trân Châu Hoàng Gia (L)', quantity: 1, unitPrice: 55000, total: 55000, category: 'food' }]
      },
      {
        id: 'tx-stu-m06-4',
        merchant: 'Cây xăng Petrolimex Q.Thủ Đức',
        date: '2026-06-21',
        time: '16:50',
        total: 80000,
        category: 'transport',
        paymentMethod: 'Tiền mặt',
        invoiceNumber: 'PLX-0621',
        notes: 'Đổ đầy bình xăng xe máy',
        items: [{ name: 'Xăng RON 95-III', quantity: 1, unitPrice: 80000, total: 80000, category: 'transport' }]
      },
      {
        id: 'tx-stu-m06-5',
        merchant: 'Hủ Tiếu Nam Vang Sinh Viên',
        date: '2026-06-10',
        time: '12:00',
        total: 45000,
        category: 'food',
        paymentMethod: 'Tiền mặt',
        invoiceNumber: 'HT-0610',
        notes: 'Hủ tiếu khô sườn tôm thịt',
        items: [{ name: 'Tô hủ tiếu Nam Vang khô đặc biệt', quantity: 1, unitPrice: 45000, total: 45000, category: 'food' }]
      },
      {
        id: 'tx-stu-m06-6',
        merchant: 'Tiệm Sửa & Bảo Dưỡng Xe Máy Honda',
        date: '2026-06-15',
        time: '10:30',
        total: 90000,
        category: 'transport',
        paymentMethod: 'Tiền mặt',
        invoiceNumber: 'HD-0615',
        notes: 'Thay ruột xe máy và vá săm lốp',
        items: [{ name: 'Thay ruột xe máy Casumina + vá lốp', quantity: 1, unitPrice: 90000, total: 90000, category: 'transport' }]
      }
    ];
  } else if (roleCode === 'office_worker' || userId === 'user-worker') {
    return [
      // Tháng 08/2026
      {
        id: 'tx-wrk-prev-1',
        merchant: 'The Coffee House Trần Cao Vân',
        date: '2026-08-25',
        time: '15:10',
        total: 115000,
        category: 'food',
        paymentMethod: 'MoMo',
        invoiceNumber: 'TCH-0825',
        notes: 'Trà sữa mắc ca & Oolong kem cheese làm việc',
        items: [
          { name: 'Trà Oolong Kem Cheese (M)', quantity: 1, unitPrice: 60000, total: 60000, category: 'food' },
          { name: 'Bánh Mì Que Bơ Tỏi', quantity: 1, unitPrice: 55000, total: 55000, category: 'food' }
        ]
      },
      {
        id: 'tx-wrk-prev-2',
        merchant: 'Điện Lực EVN TP.HCM',
        date: '2026-08-08',
        time: '09:00',
        total: 720000,
        category: 'living',
        paymentMethod: 'Banking',
        invoiceNumber: 'EVN-082026',
        notes: 'Hóa đơn tiền điện chung cư tháng 8',
        items: [{ name: 'Tiền điện sinh hoạt căn hộ', quantity: 1, unitPrice: 720000, total: 720000, category: 'living' }]
      },
      {
        id: 'tx-wrk-prev-3',
        merchant: 'GrabCar Đi Sân Bay Tân Sơn Nhất',
        date: '2026-08-14',
        time: '06:30',
        total: 165000,
        category: 'transport',
        paymentMethod: 'Thẻ Visa',
        invoiceNumber: 'GRB-0814',
        notes: 'Di chuyển ra sân bay chuyến công tác Hà Nội',
        items: [{ name: 'Cước GrabCar 4 chỗ ra sân bay', quantity: 1, unitPrice: 165000, total: 165000, category: 'transport' }]
      },
      {
        id: 'tx-wrk-prev-4',
        merchant: 'Siêu Thị An Nam Gourmet Q.1',
        date: '2026-08-19',
        time: '18:50',
        total: 480000,
        category: 'shopping',
        paymentMethod: 'Thẻ Visa',
        invoiceNumber: 'AG-0819',
        notes: 'Mua thực phẩm hữu cơ & ngũ cốc dinh dưỡng',
        items: [
          { name: 'Ngũ cốc yến mạch Granola Úc 500g', quantity: 1, unitPrice: 220000, total: 220000, category: 'food' },
          { name: 'Nho đen không hạt Mỹ hộp 500g', quantity: 1, unitPrice: 160000, total: 160000, category: 'food' },
          { name: 'Sữa chua Hy Lạp Greek Style 450g', quantity: 1, unitPrice: 100000, total: 100000, category: 'food' }
        ]
      },
      {
        id: 'tx-wrk-prev-5',
        merchant: 'Nhà hàng Sushi Tei Pasteur',
        date: '2026-08-27',
        time: '12:30',
        total: 260000,
        category: 'food',
        paymentMethod: 'Thẻ Visa',
        invoiceNumber: 'ST-0827',
        notes: 'Set cơm trưa cá hồi nướng sốt teriyaki',
        items: [{ name: 'Lunch Set Salmon Teriyaki + Soup Miso', quantity: 1, unitPrice: 260000, total: 260000, category: 'food' }]
      },
      {
        id: 'tx-wrk-prev-6',
        merchant: 'Cước 4G Mobifone Trọn Gói 12T',
        date: '2026-08-03',
        time: '10:15',
        total: 890000,
        category: 'living',
        paymentMethod: 'Banking',
        invoiceNumber: 'MB-0803',
        notes: 'Gia hạn gói cước data 4G tốc độ cao 12 tháng',
        items: [{ name: 'Gói Mobi 12MAX Data không giới hạn', quantity: 1, unitPrice: 890000, total: 890000, category: 'living' }]
      },

      // Tháng 07/2026
      {
        id: 'tx-wrk-m07-1',
        merchant: 'Highlands Coffee Diamond Plaza',
        date: '2026-07-24',
        time: '14:15',
        total: 105000,
        category: 'food',
        paymentMethod: 'MoMo',
        invoiceNumber: 'HL-0724',
        notes: 'Cà phê phin sữa đá & trà sen vàng',
        items: [
          { name: 'Trà Sen Vàng (L)', quantity: 1, unitPrice: 59000, total: 59000, category: 'food' },
          { name: 'Cà phê Phin Sữa Đá (M)', quantity: 1, unitPrice: 46000, total: 46000, category: 'food' }
        ]
      },
      {
        id: 'tx-wrk-m07-2',
        merchant: 'Điện Lực EVN TP.HCM',
        date: '2026-07-06',
        time: '09:00',
        total: 690000,
        category: 'living',
        paymentMethod: 'Banking',
        invoiceNumber: 'EVN-072026',
        notes: 'Hóa đơn tiền điện căn hộ tháng 7',
        items: [{ name: 'Tiền điện điều hòa sinh hoạt tháng 7', quantity: 1, unitPrice: 690000, total: 690000, category: 'living' }]
      },
      {
        id: 'tx-wrk-m07-3',
        merchant: 'GrabCar Đi Gặp Khách Hàng Q.7',
        date: '2026-07-15',
        time: '09:30',
        total: 140000,
        category: 'transport',
        paymentMethod: 'Thẻ Visa',
        invoiceNumber: 'GRB-0715',
        notes: 'Cước GrabCar đi họp ký hợp đồng',
        items: [{ name: 'Cước GrabCar 4 chỗ', quantity: 1, unitPrice: 140000, total: 140000, category: 'transport' }]
      },
      {
        id: 'tx-wrk-m07-4',
        merchant: 'Zara Vincom Đồng Khởi',
        date: '2026-07-22',
        time: '19:40',
        total: 899000,
        category: 'shopping',
        paymentMethod: 'Thẻ Visa',
        invoiceNumber: 'ZR-0722',
        notes: 'Mua áo sơ mi công sở ngắn tay',
        items: [{ name: 'Áo sơ mi Slim Fit Oxford', quantity: 1, unitPrice: 899000, total: 899000, category: 'shopping' }]
      },
      {
        id: 'tx-wrk-m07-5',
        merchant: 'Nhà Hàng Gogi House Saigon Centre',
        date: '2026-07-29',
        time: '19:00',
        total: 520000,
        category: 'food',
        paymentMethod: 'Thẻ Visa',
        invoiceNumber: 'GG-0729',
        notes: 'Ăn tối thịt nướng Hàn Quốc cùng bạn bè',
        items: [{ name: 'Set Thịt Dẻ Sườn Bò Mỹ Nướng + Salad', quantity: 1, unitPrice: 520000, total: 520000, category: 'food' }]
      },
      {
        id: 'tx-wrk-m07-6',
        merchant: 'Phòng Tập Gym California Fitness',
        date: '2026-07-11',
        time: '18:00',
        total: 450000,
        category: 'other',
        paymentMethod: 'Banking',
        invoiceNumber: 'CF-0711',
        notes: 'Thẻ hội viên rèn luyện sức khỏe tháng 7',
        items: [{ name: 'Phí hội viên tập Gym 1 tháng', quantity: 1, unitPrice: 450000, total: 450000, category: 'other' }]
      },

      // Tháng 06/2026
      {
        id: 'tx-wrk-m06-1',
        merchant: 'Starbucks Coffee Vincom Center',
        date: '2026-06-28',
        time: '15:00',
        total: 145000,
        category: 'food',
        paymentMethod: 'MoMo',
        invoiceNumber: 'SB-0628',
        notes: 'Cà phê Latte & Bánh Croissant bơ',
        items: [
          { name: 'Caffè Latte Grande', quantity: 1, unitPrice: 90000, total: 90000, category: 'food' },
          { name: 'Butter Croissant nướng nóng', quantity: 1, unitPrice: 55000, total: 55000, category: 'food' }
        ]
      },
      {
        id: 'tx-wrk-m06-2',
        merchant: 'Điện Lực EVN TP.HCM',
        date: '2026-06-08',
        time: '08:45',
        total: 650000,
        category: 'living',
        paymentMethod: 'Banking',
        invoiceNumber: 'EVN-062026',
        notes: 'Hóa đơn tiền điện tháng 6',
        items: [{ name: 'Tiền điện căn hộ chung cư', quantity: 1, unitPrice: 650000, total: 650000, category: 'living' }]
      },
      {
        id: 'tx-wrk-m06-3',
        merchant: 'BeCar Di Chuyển Đi Công Tác',
        date: '2026-06-16',
        time: '07:30',
        total: 155000,
        category: 'transport',
        paymentMethod: 'Thẻ Visa',
        invoiceNumber: 'BE-0616',
        notes: 'Cước BeCar ra bến xe Miền Đông mới',
        items: [{ name: 'Cước BeCar 4 chỗ', quantity: 1, unitPrice: 155000, total: 155000, category: 'transport' }]
      },
      {
        id: 'tx-wrk-m06-4',
        merchant: 'Thời Trang Canifa Saigon Centre',
        date: '2026-06-20',
        time: '18:30',
        total: 650000,
        category: 'shopping',
        paymentMethod: 'Thẻ Visa',
        invoiceNumber: 'CNF-0620',
        notes: 'Quần âu nam công sở chống nhăn',
        items: [{ name: 'Quần tây nam Smart Casual', quantity: 1, unitPrice: 650000, total: 650000, category: 'shopping' }]
      },
      {
        id: 'tx-wrk-m06-5',
        merchant: 'Quán Cơm Niêu Sài Gòn Q.3',
        date: '2026-06-24',
        time: '12:15',
        total: 380000,
        category: 'food',
        paymentMethod: 'Banking',
        invoiceNumber: 'CN-0624',
        notes: 'Cơm niêu cá bống kho tộ tiếp đối tác',
        items: [{ name: 'Set cơm niêu cá bống kho + canh cua đồng', quantity: 1, unitPrice: 380000, total: 380000, category: 'food' }]
      },
      {
        id: 'tx-wrk-m06-6',
        merchant: 'Phòng Tập Gym California Fitness',
        date: '2026-06-12',
        time: '18:15',
        total: 450000,
        category: 'other',
        paymentMethod: 'Banking',
        invoiceNumber: 'CF-0612',
        notes: 'Thẻ tập Gym tháng 6',
        items: [{ name: 'Phí hội viên tập thể hình', quantity: 1, unitPrice: 450000, total: 450000, category: 'other' }]
      }
    ];
  } else if (roleCode === 'family' || userId === 'user-family') {
    return [
      // Tháng 08/2026
      {
        id: 'tx-fam-prev-1',
        merchant: 'Siêu Thị WinMart Landmark',
        date: '2026-08-27',
        time: '19:15',
        total: 1420000,
        category: 'shopping',
        paymentMethod: 'VNPay',
        invoiceNumber: 'WM-0827',
        notes: 'Thực phẩm sạch cho cả tuần và dầu ăn Simply',
        items: [
          { name: 'Thịt bò Úc phi lê 800g', quantity: 1, unitPrice: 380000, total: 380000, category: 'food' },
          { name: 'Cá hồi Nauy tươi phi lê 500g', quantity: 1, unitPrice: 340000, total: 340000, category: 'food' },
          { name: 'Sữa tươi tươi tiệt trùng Vinamilk thùng 48 hộp', quantity: 1, unitPrice: 360000, total: 360000, category: 'food' },
          { name: 'Dầu ăn Simply hạt hướng dương 2L', quantity: 1, unitPrice: 155000, total: 155000, category: 'food' },
          { name: 'Nước rửa chén và xịt phòng gia đình', quantity: 1, unitPrice: 185000, total: 185000, category: 'living' }
        ]
      },
      {
        id: 'tx-fam-prev-2',
        merchant: 'Điện Lực EVN TP.HCM',
        date: '2026-08-05',
        time: '09:00',
        total: 1960000,
        category: 'living',
        paymentMethod: 'Banking',
        invoiceNumber: 'EVN-082026',
        notes: 'Hóa đơn tiền điện sinh hoạt gia đình tháng 8',
        items: [{ name: 'Tiền điện 3 điều hòa và thiết bị gia đình', quantity: 1, unitPrice: 1960000, total: 1960000, category: 'living' }]
      },
      {
        id: 'tx-fam-prev-3',
        merchant: 'Trung Tâm Tiếng Anh ILA Cho Con',
        date: '2026-08-15',
        time: '15:00',
        total: 4500000,
        category: 'education',
        paymentMethod: 'Banking',
        invoiceNumber: 'ILA-0815',
        notes: 'Học phí khóa tiếng Anh hè Smart Teens cho 2 bé',
        items: [{ name: 'Học phí khóa tiếng Anh Cambridge hè', quantity: 1, unitPrice: 4500000, total: 4500000, category: 'education' }]
      },
      {
        id: 'tx-fam-prev-4',
        merchant: 'Cây xăng Petrolimex Q.2',
        date: '2026-08-20',
        time: '16:45',
        total: 950000,
        category: 'transport',
        paymentMethod: 'Thẻ ATM',
        invoiceNumber: 'PLX-0820F',
        notes: 'Đổ đầy bình xăng xe ô tô SUV 7 chỗ',
        items: [{ name: 'Xăng RON 95-V (45 lít)', quantity: 1, unitPrice: 950000, total: 950000, category: 'transport' }]
      },
      {
        id: 'tx-fam-prev-5',
        merchant: 'Nhà Thuốc Pharmacity An Phú',
        date: '2026-08-18',
        time: '20:10',
        total: 380000,
        category: 'other',
        paymentMethod: 'Tiền mặt',
        invoiceNumber: 'PMC-0818',
        notes: 'Vitamin tổng hợp, men tiêu hóa và thuốc cảm sốt',
        items: [
          { name: 'Kẹo dẻo vitamin Gummy cho bé', quantity: 1, unitPrice: 195000, total: 195000, category: 'other' },
          { name: 'Men vi sinh Enterogermina hộp 20 ống', quantity: 1, unitPrice: 140000, total: 140000, category: 'other' },
          { name: 'Nước muối xịt mũi Fysoline', quantity: 1, unitPrice: 45000, total: 45000, category: 'other' }
        ]
      },

      // Tháng 07/2026
      {
        id: 'tx-fam-m07-1',
        merchant: 'Siêu Thị Lotte Mart Q.7',
        date: '2026-07-25',
        time: '19:30',
        total: 1650000,
        category: 'shopping',
        paymentMethod: 'VNPay',
        invoiceNumber: 'LM-0725',
        notes: 'Thực phẩm sạch, sữa chua, thịt bò & rau hữu cơ',
        items: [
          { name: 'Thịt bò Úc nhập khẩu 1kg', quantity: 1, unitPrice: 420000, total: 420000, category: 'food' },
          { name: 'Sữa chua men sống Yakult 5 lốc', quantity: 5, unitPrice: 28000, total: 140000, category: 'food' },
          { name: 'Trái cây nhập khẩu cherry kiwi', quantity: 1, unitPrice: 450000, total: 450000, category: 'food' },
          { name: 'Dầu ô liu extra virgin 1L', quantity: 1, unitPrice: 280000, total: 280000, category: 'food' },
          { name: 'Nước lau sàn và sáp thơm Glade', quantity: 1, unitPrice: 360000, total: 360000, category: 'living' }
        ]
      },
      {
        id: 'tx-fam-m07-2',
        merchant: 'Điện Lực EVN TP.HCM',
        date: '2026-07-06',
        time: '09:00',
        total: 1880000,
        category: 'living',
        paymentMethod: 'Banking',
        invoiceNumber: 'EVN-072026',
        notes: 'Tiền điện sinh hoạt gia đình 4 người tháng 7',
        items: [{ name: 'Tiền điện 3 điều hòa và thiết bị gia đình', quantity: 1, unitPrice: 1880000, total: 1880000, category: 'living' }]
      },
      {
        id: 'tx-fam-m07-3',
        merchant: 'Khóa Học Bơi Lội Mùa Hè Cho 2 Bé',
        date: '2026-07-12',
        time: '10:00',
        total: 3200000,
        category: 'education',
        paymentMethod: 'Banking',
        invoiceNumber: 'SWIM-0712',
        notes: 'Khóa học bơi ếch và bơi sải cơ bản kèm huấn luyện viên',
        items: [{ name: 'Học phí bơi lội trọn gói 2 bé 12 buổi', quantity: 1, unitPrice: 3200000, total: 3200000, category: 'education' }]
      },
      {
        id: 'tx-fam-m07-4',
        merchant: 'Cây xăng Petrolimex Q.7',
        date: '2026-07-19',
        time: '17:00',
        total: 920000,
        category: 'transport',
        paymentMethod: 'Thẻ ATM',
        invoiceNumber: 'PLX-0719',
        notes: 'Đổ xăng ô tô gia đình 7 chỗ',
        items: [{ name: 'Xăng RON 95-V (42 lít)', quantity: 1, unitPrice: 920000, total: 920000, category: 'transport' }]
      },
      {
        id: 'tx-fam-m07-5',
        merchant: 'Nhà Hàng Dookki Buffet Lẩu Vincom',
        date: '2026-07-28',
        time: '18:45',
        total: 640000,
        category: 'food',
        paymentMethod: 'Thẻ Visa',
        invoiceNumber: 'DK-0728',
        notes: 'Ăn tối gia đình cuối tuần mừng hè cho 2 bé',
        items: [{ name: 'Buffet lẩu Tokbokki 4 người (2 người lớn + 2 trẻ em)', quantity: 1, unitPrice: 640000, total: 640000, category: 'food' }]
      },

      // Tháng 06/2026
      {
        id: 'tx-fam-m06-1',
        merchant: 'Siêu Thị Co.opXtra Thủ Đức',
        date: '2026-06-26',
        time: '19:15',
        total: 1580000,
        category: 'shopping',
        paymentMethod: 'VNPay',
        invoiceNumber: 'CX-0626',
        notes: 'Nhu yếu phẩm, gạo ST25, dầu ăn & nước giặt',
        items: [
          { name: 'Gạo ST25 Ông Cua 10kg', quantity: 1, unitPrice: 420000, total: 420000, category: 'food' },
          { name: 'Nước giặt xả Omo Matic lựu đỏ 3.6kg', quantity: 2, unitPrice: 285000, total: 570000, category: 'living' },
          { name: 'Thịt heo nạc dăm & ba chỉ bò 1.5kg', quantity: 1, unitPrice: 380000, total: 380000, category: 'food' },
          { name: 'Hạt nêm, nước mắm cá cơm Phú Quốc', quantity: 1, unitPrice: 210000, total: 210000, category: 'food' }
        ]
      },
      {
        id: 'tx-fam-m06-2',
        merchant: 'Điện Lực EVN TP.HCM',
        date: '2026-06-05',
        time: '09:00',
        total: 2100000,
        category: 'living',
        paymentMethod: 'Banking',
        invoiceNumber: 'EVN-062026',
        notes: 'Tiền điện sinh hoạt điều hòa mùa nóng tháng 6',
        items: [{ name: 'Tiền điện điều hòa và thiết bị gia đình', quantity: 1, unitPrice: 2100000, total: 2100000, category: 'living' }]
      },
      {
        id: 'tx-fam-m06-3',
        merchant: 'Vali Kéo Du Lịch Samsonite Vincom',
        date: '2026-06-15',
        time: '15:30',
        total: 3450000,
        category: 'shopping',
        paymentMethod: 'Thẻ Visa',
        invoiceNumber: 'SMN-0615',
        notes: 'Mua bộ vali kéo cao cấp phục vụ chuyến nghỉ mát hè gia đình',
        items: [{ name: 'Vali kéo du lịch size 24 chống va đập', quantity: 1, unitPrice: 3450000, total: 3450000, category: 'shopping' }]
      },
      {
        id: 'tx-fam-m06-4',
        merchant: 'Cây xăng Petrolimex Q.2',
        date: '2026-06-22',
        time: '06:00',
        total: 980000,
        category: 'transport',
        paymentMethod: 'Thẻ ATM',
        invoiceNumber: 'PLX-0622',
        notes: 'Đổ xăng ô tô đi nghỉ mát Vũng Tàu',
        items: [{ name: 'Xăng RON 95-V (46 lít)', quantity: 1, unitPrice: 980000, total: 980000, category: 'transport' }]
      },
      {
        id: 'tx-fam-m06-5',
        merchant: 'Nhà Hàng Hải Sản Gành Hào Vũng Tàu',
        date: '2026-06-30',
        time: '19:30',
        total: 1650000,
        category: 'food',
        paymentMethod: 'Thẻ Visa',
        invoiceNumber: 'GH-0630',
        notes: 'Tiệc hải sản gia đình mừng hè',
        items: [{ name: 'Set tôm tích cháy tỏi, mực một nắng nướng muối ớt & lẩu cá bớp', quantity: 1, unitPrice: 1650000, total: 1650000, category: 'food' }]
      }
    ];
  } else if (roleCode === 'small_business' || userId === 'user-business') {
    return [
      // Tháng 08/2026
      {
        id: 'tx-biz-prev-1',
        merchant: 'Công Ty Bột Mì Đại Phong',
        date: '2026-08-26',
        time: '10:00',
        total: 2200000,
        category: 'shopping',
        paymentMethod: 'Chuyển khoản',
        invoiceNumber: 'DP-0826',
        notes: 'Nhập bột mì chuyên dụng làm bánh số 8 & số 13',
        items: [
          { name: 'Bột mì bông hồng xanh (bao 25kg)', quantity: 2, unitPrice: 580000, total: 1160000, category: 'shopping' },
          { name: 'Bột mì đa dụng làm bánh gato (bao 25kg)', quantity: 2, unitPrice: 520000, total: 1040000, category: 'shopping' }
        ]
      },
      {
        id: 'tx-biz-prev-2',
        merchant: 'Cửa Hàng Hộp Giấy Hương Giang',
        date: '2026-08-22',
        time: '14:30',
        total: 850000,
        category: 'shopping',
        paymentMethod: 'Tiền mặt',
        invoiceNumber: 'HG-0822',
        notes: 'Mua hộp giấy kraft đựng bánh mì hoa cúc 500 cái',
        items: [{ name: 'Hộp giấy kraft kèm nắp trong 500 cái', quantity: 1, unitPrice: 850000, total: 850000, category: 'shopping' }]
      },
      {
        id: 'tx-biz-prev-3',
        merchant: 'Điện Lực EVN 3 Pha Xưởng Bánh',
        date: '2026-08-10',
        time: '08:30',
        total: 3450000,
        category: 'living',
        paymentMethod: 'Banking',
        invoiceNumber: 'EVN3P-0826',
        notes: 'Tiền điện 3 pha công nghiệp chạy lò nướng tháng 8',
        items: [{ name: 'Tiền điện sản xuất lò nướng bánh 3 pha', quantity: 1, unitPrice: 3450000, total: 3450000, category: 'living' }]
      },
      {
        id: 'tx-biz-prev-4',
        merchant: 'Dịch Vụ Ahamove Giao Hàng Bánh Sỉ',
        date: '2026-08-16',
        time: '07:00',
        total: 375000,
        category: 'transport',
        paymentMethod: 'Ví điện tử',
        invoiceNumber: 'AHA-0816',
        notes: '15 chuyến giao sỉ bánh mì sáng cho các quán cafe',
        items: [{ name: 'Cước vận chuyển 15 đơn giao sỉ', quantity: 15, unitPrice: 25000, total: 375000, category: 'transport' }]
      },

      // Tháng 07/2026
      {
        id: 'tx-biz-m07-1',
        merchant: 'Công Ty Bột Mì Đại Phong',
        date: '2026-07-25',
        time: '10:00',
        total: 2350000,
        category: 'shopping',
        paymentMethod: 'Chuyển khoản',
        invoiceNumber: 'DP-0725',
        notes: 'Bột mì làm bánh croissant & bánh mì hoa cúc',
        items: [
          { name: 'Bột mì chuyên dụng làm croissant (bao 25kg)', quantity: 2, unitPrice: 620000, total: 1240000, category: 'shopping' },
          { name: 'Bột mì số 13 dai giòn (bao 25kg)', quantity: 2, unitPrice: 555000, total: 1110000, category: 'shopping' }
        ]
      },
      {
        id: 'tx-biz-m07-2',
        merchant: 'Đại Lý Bơ Sữa Nhập Khẩu New Zealand',
        date: '2026-07-20',
        time: '14:00',
        total: 1950000,
        category: 'shopping',
        paymentMethod: 'Chuyển khoản',
        invoiceNumber: 'NZ-0720',
        notes: 'Bơ lạt Anchor và kem béo thực vật Elle & Vire',
        items: [
          { name: 'Bơ lạt Anchor tảng 5kg', quantity: 1, unitPrice: 1150000, total: 1150000, category: 'shopping' },
          { name: 'Whipping Cream Elle & Vire 1L (x4)', quantity: 4, unitPrice: 200000, total: 800000, category: 'shopping' }
        ]
      },
      {
        id: 'tx-biz-m07-3',
        merchant: 'Điện Lực EVN 3 Pha Xưởng Bánh Tháng 7',
        date: '2026-07-08',
        time: '08:30',
        total: 3250000,
        category: 'living',
        paymentMethod: 'Banking',
        invoiceNumber: 'EVN3P-0726',
        notes: 'Điện 3 pha vận hành lò nướng bánh tháng 7',
        items: [{ name: 'Tiền điện 3 pha sản xuất tháng 7', quantity: 1, unitPrice: 3250000, total: 3250000, category: 'living' }]
      },
      {
        id: 'tx-biz-m07-4',
        merchant: 'Dịch Vụ Giao Hàng Bánh Sỉ Lalamove',
        date: '2026-07-16',
        time: '07:15',
        total: 420000,
        category: 'transport',
        paymentMethod: 'Ví điện tử',
        invoiceNumber: 'LLM-0716',
        notes: '18 đơn giao bánh cho các chuỗi cafe',
        items: [{ name: 'Cước giao hàng sỉ 18 chuyến buổi sáng', quantity: 18, unitPrice: 23333, total: 420000, category: 'transport' }]
      },

      // Tháng 06/2026
      {
        id: 'tx-biz-m06-1',
        merchant: 'Công Ty Bao Bì Hộp Bánh Tân Tiến',
        date: '2026-06-27',
        time: '11:00',
        total: 1250000,
        category: 'shopping',
        paymentMethod: 'Tiền mặt',
        invoiceNumber: 'TT-0627',
        notes: 'Hộp đựng bánh sinh nhật & túi giấy kraft 1000 cái',
        items: [
          { name: 'Hộp mica trong đựng bánh kem sinh nhật (100 cái)', quantity: 1, unitPrice: 650000, total: 650000, category: 'shopping' },
          { name: 'Túi giấy kraft quai xoắn in logo tiệm bánh (1000 cái)', quantity: 1, unitPrice: 600000, total: 600000, category: 'shopping' }
        ]
      },
      {
        id: 'tx-biz-m06-2',
        merchant: 'Đại Lý Sữa & Phô Mai Nhất Hương',
        date: '2026-06-21',
        time: '15:20',
        total: 1850000,
        category: 'shopping',
        paymentMethod: 'Chuyển khoản',
        invoiceNumber: 'NH-0621',
        notes: 'Phô mai Mozzarella & Creamcheese Anchor',
        items: [
          { name: 'Creamcheese Anchor khối 1kg x3', quantity: 3, unitPrice: 280000, total: 840000, category: 'shopping' },
          { name: 'Phô mai bào sợi Mozzarella Úc 2kg', quantity: 1, unitPrice: 650000, total: 650000, category: 'shopping' },
          { name: 'Sữa đặc Ngôi Sao Phương Nam thùng 48 lon', quantity: 1, unitPrice: 360000, total: 360000, category: 'shopping' }
        ]
      },
      {
        id: 'tx-biz-m06-3',
        merchant: 'Điện Lực EVN 3 Pha Xưởng Bánh Tháng 6',
        date: '2026-06-09',
        time: '08:30',
        total: 3100000,
        category: 'living',
        paymentMethod: 'Banking',
        invoiceNumber: 'EVN3P-0626',
        notes: 'Điện sản xuất lò nướng bánh 3 pha tháng 6',
        items: [{ name: 'Tiền điện sản xuất lò nướng bánh', quantity: 1, unitPrice: 3100000, total: 3100000, category: 'living' }]
      },
      {
        id: 'tx-biz-m06-4',
        merchant: 'Dịch Vụ Giao Hàng Ahamove Giao Bánh',
        date: '2026-06-14',
        time: '07:00',
        total: 380000,
        category: 'transport',
        paymentMethod: 'Ví điện tử',
        invoiceNumber: 'AHA-0614',
        notes: 'Cước vận chuyển bánh sỉ giao hàng tháng 6',
        items: [{ name: 'Cước giao bánh sỉ 16 chuyến sáng', quantity: 16, unitPrice: 23750, total: 380000, category: 'transport' }]
      }
    ];
  }

  // Default historical transactions (from sampleData)
  return INITIAL_TRANSACTIONS.filter(t => t.date && (t.date.startsWith('2026-08') || t.date.startsWith('2026-07') || t.date.startsWith('2026-06')));
}

// Tailored initial data generators for each persona (includes current month 2026-09 and 3 recent months 08, 07, 06)
function getDefaultTransactionsForUser(userId, roleCode) {
  const historyTxs = getDefaultHistoricalMonthsTransactionsForUser(userId, roleCode);
  let currentMonthTxs = [];

  if (roleCode === 'student' || userId === 'user-student') {
    currentMonthTxs = [
      {
        id: 'tx-stu-1',
        merchant: 'Nhà Sách Fahasa Nguyễn Huệ',
        date: '2026-09-25',
        time: '16:10',
        total: 285000,
        category: 'education',
        paymentMethod: 'VietQR',
        invoiceNumber: 'FHS-839211',
        notes: 'Mua giáo trình và dụng cụ học tập kỳ 1',
        items: [
          { name: 'Sách Đắc Nhân Tâm', quantity: 1, unitPrice: 98000, total: 98000, category: 'education' },
          { name: 'Sổ tay bìa da A5', quantity: 1, unitPrice: 85000, total: 85000, category: 'education' },
          { name: 'Bút Gel Pilot G2 (x3)', quantity: 3, unitPrice: 32000, total: 96000, category: 'education' }
        ]
      },
      {
        id: 'tx-stu-2',
        merchant: 'Cơm Tấm Sinh Viên Làng Đại Học',
        date: '2026-09-28',
        time: '12:15',
        total: 35000,
        category: 'food',
        paymentMethod: 'Tiền mặt',
        invoiceNumber: 'STU-0012',
        notes: 'Ăn trưa cơm sườn trứng',
        items: [{ name: 'Cơm sườn trứng + trà đá', quantity: 1, unitPrice: 35000, total: 35000, category: 'food' }]
      },
      {
        id: 'tx-stu-3',
        merchant: 'Tiền Trọ & Điện Nước Tháng 9',
        date: '2026-09-05',
        time: '08:00',
        total: 2100000,
        category: 'living',
        paymentMethod: 'Chuyển khoản',
        invoiceNumber: 'TRO-092026',
        notes: 'Tiền phòng trọ ký túc xá dịch vụ',
        items: [{ name: 'Tiền phòng trọ + wifi + nước', quantity: 1, unitPrice: 2100000, total: 2100000, category: 'living' }]
      },
      {
        id: 'tx-stu-4',
        merchant: 'Cây xăng Petrolimex Q.Thủ Đức',
        date: '2026-09-20',
        time: '17:00',
        total: 70000,
        category: 'transport',
        paymentMethod: 'Tiền mặt',
        invoiceNumber: 'PLX-7711',
        notes: 'Đổ xăng đi học',
        items: [{ name: 'Xăng RON 95', quantity: 1, unitPrice: 70000, total: 70000, category: 'transport' }]
      }
    ];
  } else if (roleCode === 'office_worker' || userId === 'user-worker') {
    currentMonthTxs = [
      {
        id: 'tx-wrk-1',
        merchant: 'Highlands Coffee Landmark 81',
        date: '2026-09-29',
        time: '14:20',
        total: 135000,
        category: 'food',
        paymentMethod: 'MoMo',
        invoiceNumber: 'HL-2026-9041',
        notes: 'Làm việc và gặp đối tác buổi chiều',
        items: [
          { name: 'Trà Sen Vàng (L)', quantity: 1, unitPrice: 59000, total: 59000, category: 'food' },
          { name: 'Phin Sữa Đá (M)', quantity: 1, unitPrice: 42000, total: 42000, category: 'food' },
          { name: 'Bánh Mì Que Gà Phô Mai', quantity: 1, unitPrice: 34000, total: 34000, category: 'food' }
        ]
      },
      {
        id: 'tx-wrk-2',
        merchant: 'GrabCar Di chuyển đi họp',
        date: '2026-09-30',
        time: '08:15',
        total: 92000,
        category: 'transport',
        paymentMethod: 'Thẻ Visa',
        invoiceNumber: 'GRB-09301',
        notes: 'Đi họp khách hàng Quận 1',
        items: [{ name: 'Cước GrabCar 4 chỗ', quantity: 1, unitPrice: 92000, total: 92000, category: 'transport' }]
      },
      {
        id: 'tx-wrk-3',
        merchant: 'Uniqlo Vincom Đồng Khởi',
        date: '2026-09-18',
        time: '19:30',
        total: 790000,
        category: 'shopping',
        paymentMethod: 'Thẻ Visa',
        invoiceNumber: 'UNQ-8821',
        notes: 'Mua áo sơ mi công sở',
        items: [{ name: 'Áo sơ mi Oxford dài tay', quantity: 1, unitPrice: 790000, total: 790000, category: 'shopping' }]
      }
    ];
  } else if (roleCode === 'family' || userId === 'user-family') {
    currentMonthTxs = [
      {
        id: 'tx-fam-1',
        merchant: 'Siêu Thị Co.opmart Cống Quỳnh',
        date: '2026-09-28',
        time: '18:45',
        total: 1250000,
        category: 'shopping',
        paymentMethod: 'Thẻ / VNPay',
        invoiceNumber: 'HD-COOP-88912',
        notes: 'Mua đồ ăn cho cả gia đình và nhu yếu phẩm',
        items: [
          { name: 'Sữa tươi Dalat Milk 950ml x4', quantity: 4, unitPrice: 42000, total: 168000, category: 'food' },
          { name: 'Thịt ba rọi heo Vissan 1.5kg', quantity: 1, unitPrice: 345000, total: 345000, category: 'food' },
          { name: 'Gạo ST25 Ông Cua 5kg', quantity: 2, unitPrice: 220000, total: 440000, category: 'food' },
          { name: 'Nước giặt OMO Matic 3.6kg', quantity: 1, unitPrice: 297000, total: 297000, category: 'living' }
        ]
      },
      {
        id: 'tx-fam-2',
        merchant: 'Điện Lực EVN TP.HCM',
        date: '2026-09-20',
        time: '10:00',
        total: 1850000,
        category: 'living',
        paymentMethod: 'Banking',
        invoiceNumber: 'EVN-092026',
        notes: 'Hóa đơn tiền điện sinh hoạt gia đình 4 người',
        items: [{ name: 'Tiền điện tiêu thụ tháng 9', quantity: 1, unitPrice: 1850000, total: 1850000, category: 'living' }]
      }
    ];
  } else if (roleCode === 'small_business' || userId === 'user-business') {
    currentMonthTxs = [
      {
        id: 'tx-biz-1',
        merchant: 'Đại Lý Nguyên Liệu Bánh Nhất Hương',
        date: '2026-09-26',
        time: '10:30',
        total: 3850000,
        category: 'shopping',
        paymentMethod: 'Chuyển khoản',
        invoiceNumber: 'NH-9941',
        notes: 'Nhập bột mì, bơ Pháp và kem tươi Anchor',
        items: [
          { name: 'Bột mì Baker Choice số 11 (25kg)', quantity: 2, unitPrice: 480000, total: 960000, category: 'shopping' },
          { name: 'Bơ lạt Anchor 5kg', quantity: 1, unitPrice: 1150000, total: 1150000, category: 'shopping' },
          { name: 'Whipping Cream Tatua 1L (thùng)', quantity: 1, unitPrice: 1740000, total: 1740000, category: 'shopping' }
        ]
      },
      {
        id: 'tx-biz-2',
        merchant: 'Bảo Dưỡng Máy Pha Cà Phê Nuova Simonelli',
        date: '2026-09-15',
        time: '14:00',
        total: 1200000,
        category: 'living',
        paymentMethod: 'Tiền mặt',
        invoiceNumber: 'NS-8812',
        notes: 'Thay ron cao su và vệ sinh nồi hơi máy pha',
        items: [{ name: 'Bảo dưỡng định kỳ máy pha cà phê', quantity: 1, unitPrice: 1200000, total: 1200000, category: 'living' }]
      }
    ];
  } else {
    currentMonthTxs = INITIAL_TRANSACTIONS;
  }

  return [...currentMonthTxs, ...historyTxs];
}

export const storageService = {
  // Multi-tenant: get transactions isolated per user ID
  getTransactions: (userId = 'default') => {
    try {
      const key = `${KEYS.TRANSACTIONS_PREFIX}${userId}`;
      const data = localStorage.getItem(key);
      if (!data) {
        localStorage.setItem(key, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data) || [];
    } catch (e) {
      console.error('Error loading transactions:', e);
      return [];
    }
  },

  saveTransactions: (userId = 'default', transactions = []) => {
    try {
      const key = `${KEYS.TRANSACTIONS_PREFIX}${userId}`;
      localStorage.setItem(key, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions:', e);
    }
  },

  addTransaction: (userId = 'default', tx, roleCode = 'student') => {
    const list = storageService.getTransactions(userId, roleCode);
    const updated = [tx, ...list];
    storageService.saveTransactions(userId, updated);
    storageService.addAuditLog(`Người dùng [${userId}] đã quét & lưu hóa đơn "${tx.merchant}" (${tx.total}đ)`);
    return updated;
  },

  updateTransaction: (userId = 'default', id, newTx, roleCode = 'student') => {
    const list = storageService.getTransactions(userId, roleCode);
    const updated = list.map(t => (t.id === id ? { ...t, ...newTx } : t));
    storageService.saveTransactions(userId, updated);
    storageService.addAuditLog(`Người dùng [${userId}] đã cập nhật giao dịch "${newTx.merchant}"`);
    return updated;
  },

  deleteTransaction: (userId = 'default', id, roleCode = 'student') => {
    const list = storageService.getTransactions(userId, roleCode);
    const target = list.find(t => t.id === id);
    const updated = list.filter(t => t.id !== id);
    storageService.saveTransactions(userId, updated);
    storageService.addAuditLog(`Người dùng [${userId}] đã xóa giao dịch "${target?.merchant || id}"`);
    return updated;
  },

  // Multi-tenant: Budget per user
  getMonthlyBudget: (userId = 'default', defaultVal = DEFAULT_MONTHLY_BUDGET) => {
    try {
      const key = `${KEYS.BUDGET_PREFIX}${userId}`;
      const val = localStorage.getItem(key);
      return val ? Number(val) : defaultVal;
    } catch {
      return defaultVal;
    }
  },

  saveMonthlyBudget: (userId = 'default', amount = DEFAULT_MONTHLY_BUDGET) => {
    const key = `${KEYS.BUDGET_PREFIX}${userId}`;
    const safeAmount = Number(amount) || DEFAULT_MONTHLY_BUDGET;
    localStorage.setItem(key, safeAmount.toString());
    storageService.addAuditLog(`Người dùng [${userId}] đã điều chỉnh hạn mức ngân sách tháng thành ${safeAmount}đ`);
  },

  getCategoryBudgets: (userId = 'default') => {
    try {
      const key = `${KEYS.CAT_BUDGET_PREFIX}${userId}`;
      const data = localStorage.getItem(key);
      if (!data) {
        const defaults = {};
        Object.entries(EXPENSE_CATEGORIES).forEach(([k, cat]) => {
          defaults[k] = cat.defaultBudget;
        });
        localStorage.setItem(key, JSON.stringify(defaults));
        return defaults;
      }
      return JSON.parse(data);
    } catch {
      const defaults = {};
      Object.entries(EXPENSE_CATEGORIES).forEach(([k, cat]) => {
        defaults[k] = cat.defaultBudget;
      });
      return defaults;
    }
  },

  saveCategoryBudgets: (userId = 'default', budgets) => {
    const key = `${KEYS.CAT_BUDGET_PREFIX}${userId}`;
    localStorage.setItem(key, JSON.stringify(budgets));
  },

  // System Audit Logs (For Admin)
  getAuditLogs: () => {
    try {
      const data = localStorage.getItem(KEYS.AUDIT_LOGS);
      if (data) return JSON.parse(data);
      const initialLogs = [
        { id: 1, action: 'Hệ thống AI SpendWise khởi động thành công', time: new Date().toLocaleString('vi-VN'), type: 'system' }
      ];
      localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(initialLogs));
      return initialLogs;
    } catch {
      return [];
    }
  },

  addAuditLog: (action, type = 'user') => {
    const logs = storageService.getAuditLogs();
    const newLog = {
      id: Date.now(),
      action,
      time: new Date().toLocaleString('vi-VN'),
      type
    };
    const updated = [newLog, ...logs.slice(0, 50)];
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(updated));
  },

  getApiKey: () => localStorage.getItem(KEYS.API_KEY) || '',
  saveApiKey: (key) => localStorage.setItem(KEYS.API_KEY, key.trim()),
  getTheme: () => localStorage.getItem(KEYS.THEME) || 'dark',
  saveTheme: (theme) => localStorage.setItem(KEYS.THEME, theme),

  resetToDefault: (userId = 'default') => {
    const key = `${KEYS.TRANSACTIONS_PREFIX}${userId}`;
    localStorage.setItem(key, JSON.stringify([]));
    return [];
  }
};
