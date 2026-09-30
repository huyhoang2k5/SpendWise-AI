// Realistic Sample Receipts with SVG base64 thermal paper renderings
export const SAMPLE_RECEIPTS = [
  {
    id: 'sample-coopmart',
    name: 'Hóa đơn Siêu thị Co.opmart',
    merchant: 'Siêu Thị Co.opmart Cống Quỳnh',
    address: '189C Cống Quỳnh, P. Nguyễn Cư Trinh, Q.1, TP.HCM',
    date: '2026-09-28',
    time: '18:45',
    invoiceNumber: 'HD-COOP-88912',
    category: 'shopping',
    paymentMethod: 'Thẻ / VNPay',
    vat: 26000,
    discount: 15000,
    total: 348000,
    items: [
      { name: 'Sữa tươi Dalat Milk 950ml', quantity: 1, unitPrice: 42000, total: 42000, category: 'food' },
      { name: 'Thịt ba rọi heo Vissan 500g', quantity: 1, unitPrice: 115000, total: 115000, category: 'food' },
      { name: 'Rau mồng tơi VietGAP 300g', quantity: 2, unitPrice: 16000, total: 32000, category: 'food' },
      { name: 'Mì Hảo Hảo tôm chua cay (thùng)', quantity: 1, unitPrice: 125000, total: 125000, category: 'food' },
      { name: 'Nước rửa chén Sunlight 750ml', quantity: 1, unitPrice: 34000, total: 34000, category: 'living' },
      { name: 'Túi rác tự hủy sinh học 3 cuộn', quantity: 1, unitPrice: 15000, total: 15000, category: 'living' }
    ],
    svgPreview: `<svg viewBox="0 0 380 540" xmlns="http://www.w3.org/2000/svg" style="background:#fefbf3; font-family:'Courier New', monospace; font-size:12px; fill:#1c1917;">
      <rect width="380" height="540" fill="#fcfaf2" rx="6" />
      <text x="190" y="35" text-anchor="middle" font-weight="bold" font-size="16">CO.OPMART CỐNG QUỲNH</text>
      <text x="190" y="55" text-anchor="middle" font-size="11">189C Cống Quỳnh, P. NCT, Q.1, TP.HCM</text>
      <text x="190" y="70" text-anchor="middle" font-size="11">ĐT: 028 3832 5283 - MST: 0300827260</text>
      <line x1="20" y1="85" x2="360" y2="85" stroke="#a8a29e" stroke-dasharray="4" />
      <text x="25" y="105">HĐ: #HD-COOP-88912</text>
      <text x="250" y="105">28/09/2026 18:45</text>
      <text x="25" y="125">Thu ngân: ThuThuy01</text>
      <text x="250" y="125">Quầy: 04</text>
      <line x1="20" y1="140" x2="360" y2="140" stroke="#a8a29e" stroke-dasharray="4" />
      <text x="25" y="160" font-weight="bold">MẶT HÀNG</text>
      <text x="220" y="160" font-weight="bold">SL</text>
      <text x="310" y="160" font-weight="bold" text-anchor="end">T.TIỀN</text>
      
      <text x="25" y="185">Sữa tươi Dalat Milk 950ml</text>
      <text x="225" y="185">1</text>
      <text x="355" y="185" text-anchor="end">42.000</text>
      
      <text x="25" y="210">Thịt ba rọi heo Vissan 500g</text>
      <text x="225" y="210">1</text>
      <text x="355" y="210" text-anchor="end">115.000</text>
      
      <text x="25" y="235">Rau mồng tơi VietGAP</text>
      <text x="225" y="235">2</text>
      <text x="355" y="235" text-anchor="end">32.000</text>

      <text x="25" y="260">Mì Hảo Hảo tôm chua cay</text>
      <text x="225" y="260">1</text>
      <text x="355" y="260" text-anchor="end">125.000</text>

      <text x="25" y="285">Nước rửa chén Sunlight 750ml</text>
      <text x="225" y="285">1</text>
      <text x="355" y="285" text-anchor="end">34.000</text>

      <text x="25" y="310">Túi rác tự hủy sinh học</text>
      <text x="225" y="310">1</text>
      <text x="355" y="310" text-anchor="end">15.000</text>

      <line x1="20" y1="335" x2="360" y2="335" stroke="#a8a29e" stroke-dasharray="4" />
      <text x="25" y="360">Cộng tiền hàng:</text>
      <text x="355" y="360" text-anchor="end">337.000</text>
      <text x="25" y="380">Thuế GTGT (VAT 8%):</text>
      <text x="355" y="380" text-anchor="end">26.000</text>
      <text x="25" y="400">Chiết khấu thành viên:</text>
      <text x="355" y="400" text-anchor="end">-15.000</text>

      <line x1="20" y1="415" x2="360" y2="415" stroke="#1c1917" stroke-width="1.5" />
      <text x="25" y="445" font-size="16" font-weight="bold">TỔNG CỘNG:</text>
      <text x="355" y="445" font-size="18" font-weight="bold" text-anchor="end">348.000 đ</text>
      
      <text x="25" y="475" font-size="11">Thanh toán: Thẻ / VNPay</text>
      <text x="190" y="505" text-anchor="middle" font-style="italic">Cảm ơn Quý Khách - Hẹn Gặp Lại!</text>
      <!-- Barcode simulation -->
      <line x1="90" y1="520" x2="90" y2="535" stroke="#1c1917" stroke-width="2"/>
      <line x1="95" y1="520" x2="95" y2="535" stroke="#1c1917" stroke-width="3"/>
      <line x1="102" y1="520" x2="102" y2="535" stroke="#1c1917" stroke-width="1"/>
      <line x1="107" y1="520" x2="107" y2="535" stroke="#1c1917" stroke-width="4"/>
      <line x1="115" y1="520" x2="115" y2="535" stroke="#1c1917" stroke-width="2"/>
      <line x1="125" y1="520" x2="125" y2="535" stroke="#1c1917" stroke-width="3"/>
      <line x1="135" y1="520" x2="135" y2="535" stroke="#1c1917" stroke-width="1"/>
      <line x1="145" y1="520" x2="145" y2="535" stroke="#1c1917" stroke-width="4"/>
      <line x1="160" y1="520" x2="160" y2="535" stroke="#1c1917" stroke-width="2"/>
      <line x1="175" y1="520" x2="175" y2="535" stroke="#1c1917" stroke-width="3"/>
      <line x1="190" y1="520" x2="190" y2="535" stroke="#1c1917" stroke-width="4"/>
      <line x1="205" y1="520" x2="205" y2="535" stroke="#1c1917" stroke-width="2"/>
      <line x1="215" y1="520" x2="215" y2="535" stroke="#1c1917" stroke-width="3"/>
      <line x1="230" y1="520" x2="230" y2="535" stroke="#1c1917" stroke-width="2"/>
      <line x1="245" y1="520" x2="245" y2="535" stroke="#1c1917" stroke-width="4"/>
      <line x1="260" y1="520" x2="260" y2="535" stroke="#1c1917" stroke-width="1"/>
      <line x1="275" y1="520" x2="275" y2="535" stroke="#1c1917" stroke-width="3"/>
    </svg>`
  },
  {
    id: 'sample-highlands',
    name: 'Hóa đơn Highlands Coffee',
    merchant: 'Highlands Coffee - Landmark 81',
    address: 'Tầng B1, TTTM Vincom Center Landmark 81, P.22, Bình Thạnh',
    date: '2026-09-29',
    time: '14:20',
    invoiceNumber: 'HL-2026-9041',
    category: 'food',
    paymentMethod: 'MoMo',
    vat: 11000,
    discount: 0,
    total: 135000,
    items: [
      { name: 'Trà Sen Vàng (L)', quantity: 1, unitPrice: 59000, total: 59000, category: 'food' },
      { name: 'Phin Sữa Đá (M)', quantity: 1, unitPrice: 42000, total: 42000, category: 'food' },
      { name: 'Bánh Mì Que Gà Phô Mai', quantity: 1, unitPrice: 34000, total: 34000, category: 'food' }
    ],
    svgPreview: `<svg viewBox="0 0 380 480" xmlns="http://www.w3.org/2000/svg" style="background:#fefbf3; font-family:'Courier New', monospace; font-size:12px; fill:#1c1917;">
      <rect width="380" height="480" fill="#fcfaf2" rx="6" />
      <text x="190" y="35" text-anchor="middle" font-weight="bold" font-size="18">HIGHLANDS COFFEE</text>
      <text x="190" y="55" text-anchor="middle" font-size="11">Landmark 81, P.22, Q. Bình Thạnh, TP.HCM</text>
      <text x="190" y="70" text-anchor="middle" font-size="11">Hotline: 1900 1755</text>
      <line x1="20" y1="85" x2="360" y2="85" stroke="#a8a29e" stroke-dasharray="4" />
      <text x="25" y="105">Số HĐ: HL-2026-9041</text>
      <text x="250" y="105">29/09/2026 14:20</text>
      <text x="25" y="125">Nhân viên: HoangNam</text>
      <text x="250" y="125">Bàn: Mang về</text>
      <line x1="20" y1="140" x2="360" y2="140" stroke="#a8a29e" stroke-dasharray="4" />
      <text x="25" y="160" font-weight="bold">TÊN MÓN</text>
      <text x="220" y="160" font-weight="bold">SL</text>
      <text x="355" y="160" font-weight="bold" text-anchor="end">THÀNH TIỀN</text>
      
      <text x="25" y="190">1. Trà Sen Vàng (L)</text>
      <text x="225" y="190">1</text>
      <text x="355" y="190" text-anchor="end">59.000</text>
      
      <text x="25" y="215">2. Phin Sữa Đá (M)</text>
      <text x="225" y="215">1</text>
      <text x="355" y="215" text-anchor="end">42.000</text>
      
      <text x="25" y="240">3. Bánh Mì Que Gà Phô Mai</text>
      <text x="225" y="240">1</text>
      <text x="355" y="240" text-anchor="end">34.000</text>

      <line x1="20" y1="270" x2="360" y2="270" stroke="#a8a29e" stroke-dasharray="4" />
      <text x="25" y="295">Tiền trước thuế:</text>
      <text x="355" y="295" text-anchor="end">124.000</text>
      <text x="25" y="315">VAT (8%):</text>
      <text x="355" y="315" text-anchor="end">11.000</text>
      <line x1="20" y1="330" x2="360" y2="330" stroke="#1c1917" stroke-width="1.5" />
      <text x="25" y="360" font-size="16" font-weight="bold">TỔNG THANH TOÁN:</text>
      <text x="355" y="360" font-size="18" font-weight="bold" text-anchor="end">135.000 đ</text>
      
      <text x="25" y="390" font-size="11">Phương thức: Ví điện tử MoMo</text>
      <text x="190" y="430" text-anchor="middle" font-size="12">Pass Wifi: highlands123</text>
      <text x="190" y="450" text-anchor="middle" font-style="italic">Cảm ơn và hẹn gặp lại quý khách!</text>
    </svg>`
  },
  {
    id: 'sample-fahasa',
    name: 'Hóa đơn Nhà sách Fahasa',
    merchant: 'Nhà Sách FAHASA Nguyễn Huệ',
    address: '40 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM',
    date: '2026-09-25',
    time: '16:10',
    invoiceNumber: 'FHS-839211',
    category: 'education',
    paymentMethod: 'Chuyển khoản / VietQR',
    vat: 15000,
    discount: 20000,
    total: 285000,
    items: [
      { name: 'Sách Đắc Nhân Tâm (Khổ mới)', quantity: 1, unitPrice: 98000, total: 98000, category: 'education' },
      { name: 'Sổ tay bìa da A5 cao cấp', quantity: 1, unitPrice: 85000, total: 85000, category: 'education' },
      { name: 'Bút Gel Pilot G2 0.5mm', quantity: 3, unitPrice: 32000, total: 96000, category: 'education' },
      { name: 'Bộ ghi chú Post-it dạ quang', quantity: 1, unitPrice: 26000, total: 26000, category: 'education' }
    ],
    svgPreview: `<svg viewBox="0 0 380 480" xmlns="http://www.w3.org/2000/svg" style="background:#fefbf3; font-family:'Courier New', monospace; font-size:12px; fill:#1c1917;">
      <rect width="380" height="480" fill="#fcfaf2" rx="6" />
      <text x="190" y="35" text-anchor="middle" font-weight="bold" font-size="16">NHÀ SÁCH FAHASA NGUYỄN HUỆ</text>
      <text x="190" y="55" text-anchor="middle" font-size="11">40 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM</text>
      <line x1="20" y1="75" x2="360" y2="75" stroke="#a8a29e" stroke-dasharray="4" />
      <text x="25" y="95">Số HĐ: FHS-839211</text>
      <text x="240" y="95">25/09/2026 16:10</text>
      <line x1="20" y1="110" x2="360" y2="110" stroke="#a8a29e" stroke-dasharray="4" />
      <text x="25" y="130" font-weight="bold">SẢN PHẨM</text>
      <text x="220" y="130" font-weight="bold">SL</text>
      <text x="355" y="130" font-weight="bold" text-anchor="end">GIÁ BÁN</text>
      
      <text x="25" y="155">Sách Đắc Nhân Tâm (Khổ mới)</text>
      <text x="225" y="155">1</text>
      <text x="355" y="155" text-anchor="end">98.000</text>
      
      <text x="25" y="180">Sổ tay bìa da A5 cao cấp</text>
      <text x="225" y="180">1</text>
      <text x="355" y="180" text-anchor="end">85.000</text>
      
      <text x="25" y="205">Bút Gel Pilot G2 0.5mm</text>
      <text x="225" y="205">3</text>
      <text x="355" y="205" text-anchor="end">96.000</text>

      <text x="25" y="230">Bộ ghi chú Post-it</text>
      <text x="225" y="230">1</text>
      <text x="355" y="230" text-anchor="end">26.000</text>

      <line x1="20" y1="260" x2="360" y2="260" stroke="#a8a29e" stroke-dasharray="4" />
      <text x="25" y="285">Cộng tiền hàng:</text>
      <text x="355" y="285" text-anchor="end">305.000</text>
      <text x="25" y="305">Khuyến mãi tựu trường:</text>
      <text x="355" y="305" text-anchor="end">-20.000</text>
      
      <line x1="20" y1="325" x2="360" y2="325" stroke="#1c1917" stroke-width="1.5" />
      <text x="25" y="355" font-size="16" font-weight="bold">TỔNG TIỀN:</text>
      <text x="355" y="355" font-size="18" font-weight="bold" text-anchor="end">285.000 đ</text>
      
      <text x="25" y="390">Thanh toán: Chuyển khoản VietQR</text>
      <text x="190" y="430" text-anchor="middle" font-style="italic">FAHASA trân trọng cảm ơn quý khách!</text>
    </svg>`
  },
  {
    id: 'sample-grab',
    name: 'Hóa đơn GrabCar',
    merchant: 'Công ty TNHH Grab Việt Nam',
    address: 'Mapletree Business Centre, Q.7, TP.HCM',
    date: '2026-09-30',
    time: '08:15',
    invoiceNumber: 'GRB-2026-09301',
    category: 'transport',
    paymentMethod: 'Thẻ Visa **4821',
    vat: 7000,
    discount: 10000,
    total: 92000,
    items: [
      { name: 'Cước GrabCar 4 chỗ (9.2 km)', quantity: 1, unitPrice: 95000, total: 95000, category: 'transport' },
      { name: 'Phí cầu đường / Phí sân bay', quantity: 1, unitPrice: 7000, total: 7000, category: 'transport' }
    ],
    svgPreview: `<svg viewBox="0 0 380 440" xmlns="http://www.w3.org/2000/svg" style="background:#fefbf3; font-family:'Courier New', monospace; font-size:12px; fill:#1c1917;">
      <rect width="380" height="440" fill="#fcfaf2" rx="6" />
      <text x="190" y="35" text-anchor="middle" font-weight="bold" font-size="18">GRAB VIỆT NAM</text>
      <text x="190" y="55" text-anchor="middle" font-size="11">Biên lai điện tử dịch vụ GrabCar</text>
      <line x1="20" y1="75" x2="360" y2="75" stroke="#a8a29e" stroke-dasharray="4" />
      <text x="25" y="95">Mã chuyến: GRB-09301</text>
      <text x="240" y="95">30/09/2026 08:15</text>
      <text x="25" y="115">Tài xế: Nguyễn Văn Thành (51F-892.11)</text>
      <line x1="20" y1="135" x2="360" y2="135" stroke="#a8a29e" stroke-dasharray="4" />
      
      <text x="25" y="160" font-weight="bold">CHI TIẾT CHUYẾN ĐI</text>
      <text x="25" y="185">Đón: KTX Khu B ĐHQG, Dĩ An</text>
      <text x="25" y="205">Đến: Tòa nhà Bitexco, Q.1, TP.HCM</text>
      <line x1="20" y1="225" x2="360" y2="225" stroke="#a8a29e" stroke-dasharray="4" />
      
      <text x="25" y="250">Cước di chuyển (9.2 km):</text>
      <text x="355" y="250" text-anchor="end">95.000</text>
      <text x="25" y="270">Phí cầu đường:</text>
      <text x="355" y="270" text-anchor="end">7.000</text>
      <text x="25" y="290">Mã giảm giá GRABVIP:</text>
      <text x="355" y="290" text-anchor="end">-10.000</text>

      <line x1="20" y1="315" x2="360" y2="315" stroke="#1c1917" stroke-width="1.5" />
      <text x="25" y="345" font-size="16" font-weight="bold">TỔNG THANH TOÁN:</text>
      <text x="355" y="345" font-size="18" font-weight="bold" text-anchor="end">92.000 đ</text>
      <text x="25" y="375" font-size="11">Thanh toán tự động qua Thẻ Visa **4821</text>
      <text x="190" y="410" text-anchor="middle" font-style="italic">Cảm ơn bạn đã lựa chọn Grab!</text>
    </svg>`
  }
];

// Rich set of initial transactions for realistic testing out-of-the-box
export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-01',
    merchant: 'Siêu Thị Co.opmart Cống Quỳnh',
    date: '2026-09-28',
    time: '18:45',
    total: 348000,
    category: 'shopping',
    paymentMethod: 'Thẻ / VNPay',
    invoiceNumber: 'HD-COOP-88912',
    notes: 'Mua đồ ăn cho cả tuần và nước rửa chén',
    items: [
      { name: 'Sữa tươi Dalat Milk 950ml', quantity: 1, unitPrice: 42000, total: 42000, category: 'food' },
      { name: 'Thịt ba rọi heo Vissan 500g', quantity: 1, unitPrice: 115000, total: 115000, category: 'food' },
      { name: 'Mì Hảo Hảo tôm chua cay', quantity: 1, unitPrice: 125000, total: 125000, category: 'food' },
      { name: 'Nước rửa chén Sunlight 750ml', quantity: 1, unitPrice: 34000, total: 34000, category: 'living' }
    ]
  },
  {
    id: 'tx-02',
    merchant: 'Highlands Coffee Landmark 81',
    date: '2026-09-29',
    time: '14:20',
    total: 135000,
    category: 'food',
    paymentMethod: 'MoMo',
    invoiceNumber: 'HL-2026-9041',
    notes: 'Đi làm việc buổi chiều với đồng nghiệp',
    items: [
      { name: 'Trà Sen Vàng (L)', quantity: 1, unitPrice: 59000, total: 59000, category: 'food' },
      { name: 'Phin Sữa Đá (M)', quantity: 1, unitPrice: 42000, total: 42000, category: 'food' },
      { name: 'Bánh Mì Que Gà Phô Mai', quantity: 1, unitPrice: 34000, total: 34000, category: 'food' }
    ]
  },
  {
    id: 'tx-03',
    merchant: 'GrabCar Di chuyển',
    date: '2026-09-30',
    time: '08:15',
    total: 92000,
    category: 'transport',
    paymentMethod: 'Thẻ Visa',
    invoiceNumber: 'GRB-2026-09301',
    notes: 'Đi họp khách hàng buổi sáng trời mưa',
    items: [
      { name: 'Cước GrabCar 4 chỗ', quantity: 1, unitPrice: 92000, total: 92000, category: 'transport' }
    ]
  },
  {
    id: 'tx-04',
    merchant: 'Nhà Sách Fahasa Nguyễn Huệ',
    date: '2026-09-25',
    time: '16:10',
    total: 285000,
    category: 'education',
    paymentMethod: 'VietQR',
    invoiceNumber: 'FHS-839211',
    notes: 'Mua sách phát triển bản thân và dụng cụ học tập',
    items: [
      { name: 'Sách Đắc Nhân Tâm', quantity: 1, unitPrice: 98000, total: 98000, category: 'education' },
      { name: 'Sổ tay bìa da A5', quantity: 1, unitPrice: 85000, total: 85000, category: 'education' },
      { name: 'Bút Gel Pilot G2 (x3)', quantity: 3, unitPrice: 32000, total: 96000, category: 'education' }
    ]
  },
  {
    id: 'tx-05',
    merchant: 'Điện Lực EVN TP.HCM',
    date: '2026-09-20',
    time: '10:00',
    total: 645000,
    category: 'living',
    paymentMethod: 'Banking',
    invoiceNumber: 'EVN-092026',
    notes: 'Tiền điện sinh hoạt căn hộ tháng 9',
    items: [
      { name: 'Tiền điện tiêu thụ bậc 1-3', quantity: 1, unitPrice: 645000, total: 645000, category: 'living' }
    ]
  },
  {
    id: 'tx-06',
    merchant: 'Cơm Tấm Ba Ghiền',
    date: '2026-09-27',
    time: '12:30',
    total: 85000,
    category: 'food',
    paymentMethod: 'Tiền mặt',
    invoiceNumber: 'BG-00214',
    notes: 'Ăn trưa cơm sườn bì chả đặc biệt',
    items: [
      { name: 'Cơm sườn bì chả', quantity: 1, unitPrice: 75000, total: 75000, category: 'food' },
      { name: 'Trà đá + Khăn lạnh', quantity: 1, unitPrice: 10000, total: 10000, category: 'food' }
    ]
  },
  {
    id: 'tx-07',
    merchant: 'Cây xăng Petrolimex Q.1',
    date: '2026-09-26',
    time: '17:30',
    total: 90000,
    category: 'transport',
    paymentMethod: 'Tiền mặt',
    invoiceNumber: 'PLX-5542',
    notes: 'Đổ đầy bình xăng xe máy Ron 95',
    items: [
      { name: 'Xăng RON 95-III', quantity: 1, unitPrice: 90000, total: 90000, category: 'transport' }
    ]
  },
  {
    id: 'tx-08',
    merchant: 'CGV Vincom Đồng Khởi',
    date: '2026-09-21',
    time: '19:40',
    total: 240000,
    category: 'other',
    paymentMethod: 'MoMo',
    invoiceNumber: 'CGV-99214',
    notes: 'Xem phim cuối tuần + bắp nước',
    items: [
      { name: 'Vé xem phim 2D x2', quantity: 2, unitPrice: 90000, total: 180000, category: 'other' },
      { name: 'Combo Bắp Nước Sweet', quantity: 1, unitPrice: 60000, total: 60000, category: 'other' }
    ]
  },
  {
    id: 'tx-09',
    merchant: 'Nhà Thuốc FPT Long Châu',
    date: '2026-09-18',
    time: '15:10',
    total: 165000,
    category: 'other',
    paymentMethod: 'Thẻ ATM',
    invoiceNumber: 'LC-77219',
    notes: 'Mua vitamin C, thuốc cảm và nước muối sinh lý',
    items: [
      { name: 'Vitamin C sủi Berocca', quantity: 1, unitPrice: 110000, total: 110000, category: 'other' },
      { name: 'Nước muối sinh lý 500ml', quantity: 3, unitPrice: 8000, total: 24000, category: 'other' },
      { name: 'Panadol Extra vỉ 10 viên', quantity: 1, unitPrice: 31000, total: 31000, category: 'other' }
    ]
  },
  {
    id: 'tx-10',
    merchant: 'Shopee - Thời trang Uniqlo',
    date: '2026-09-15',
    time: '11:20',
    total: 490000,
    category: 'shopping',
    paymentMethod: 'ShopeePay',
    invoiceNumber: 'SP-991244',
    notes: 'Mua áo thun trơn basic chống tia UV',
    items: [
      { name: 'Áo thun cổ tròn AIRism', quantity: 2, unitPrice: 245000, total: 490000, category: 'shopping' }
    ]
  },
  {
    id: 'tx-11',
    merchant: 'Internet Viettel Cáp Quang',
    date: '2026-09-10',
    time: '09:00',
    total: 220000,
    category: 'living',
    paymentMethod: 'Banking',
    invoiceNumber: 'VT-INT-09',
    notes: 'Cước Internet tốc độ cao gia đình',
    items: [
      { name: 'Gói cước NetPlus 150Mbps', quantity: 1, unitPrice: 220000, total: 220000, category: 'living' }
    ]
  },
  {
    id: 'tx-12',
    merchant: 'Khóa học Udemy - React & AI',
    date: '2026-09-05',
    time: '20:15',
    total: 279000,
    category: 'education',
    paymentMethod: 'Visa',
    invoiceNumber: 'UDM-8812',
    notes: 'Khóa học lập trình Full-Stack AI Engineer',
    items: [
      { name: 'Full-Stack Modern AI Web Dev Course', quantity: 1, unitPrice: 279000, total: 279000, category: 'education' }
    ]
  },
  {
    id: 'tx-13',
    merchant: 'Phở Hòa Pasteur',
    date: '2026-09-14',
    time: '07:45',
    total: 95000,
    category: 'food',
    paymentMethod: 'Tiền mặt',
    invoiceNumber: 'PH-4412',
    notes: 'Ăn sáng phở tái nạm gầu',
    items: [
      { name: 'Tô Phở Tái Nạm Gầu Lớn', quantity: 1, unitPrice: 90000, total: 90000, category: 'food' },
      { name: 'Trà nóng', quantity: 1, unitPrice: 5000, total: 5000, category: 'food' }
    ]
  },
  {
    id: 'tx-14',
    merchant: 'Bảo dưỡng xe máy Honda Head',
    date: '2026-09-08',
    time: '15:00',
    total: 310000,
    category: 'transport',
    paymentMethod: 'Thẻ ATM',
    invoiceNumber: 'HD-HND-102',
    notes: 'Thay dầu nhớt máy và nhớt hộp số định kỳ',
    items: [
      { name: 'Dầu nhớt Castrol Power1 1L', quantity: 1, unitPrice: 165000, total: 165000, category: 'transport' },
      { name: 'Dầu hộp số xe ga', quantity: 1, unitPrice: 45000, total: 45000, category: 'transport' },
      { name: 'Tiền công kiểm tra bảo dưỡng', quantity: 1, unitPrice: 100000, total: 100000, category: 'transport' }
    ]
  },
  // Giao dịch tháng trước (08/2026)
  {
    id: 'tx-prev-01',
    merchant: 'Siêu Thị Big C Miền Đông',
    date: '2026-08-28',
    time: '18:30',
    total: 780000,
    category: 'shopping',
    paymentMethod: 'VNPay',
    invoiceNumber: 'HD-BIGC-0828',
    notes: 'Mua thực phẩm tươi sống và đồ dùng gia đình cuối tháng 8',
    items: [
      { name: 'Gạo thơm lài sữa 5kg', quantity: 1, unitPrice: 165000, total: 165000, category: 'food' },
      { name: 'Dầu ăn Neptune Gold 2L', quantity: 1, unitPrice: 135000, total: 135000, category: 'food' },
      { name: 'Sữa chua TH true YOGURT lốc 4', quantity: 3, unitPrice: 32000, total: 96000, category: 'food' },
      { name: 'Nước xả vải Comfort túi 3.2L', quantity: 1, unitPrice: 224000, total: 224000, category: 'living' },
      { name: 'Trứng gà Ba Huân hộp 10 quả', quantity: 2, unitPrice: 35000, total: 70000, category: 'food' },
      { name: 'Bột giặt Ariel 3kg', quantity: 1, unitPrice: 90000, total: 90000, category: 'living' }
    ]
  },
  {
    id: 'tx-prev-02',
    merchant: 'Starbucks Coffee New World',
    date: '2026-08-25',
    time: '15:15',
    total: 165000,
    category: 'food',
    paymentMethod: 'MoMo',
    invoiceNumber: 'SB-882041',
    notes: 'Gặp bạn bè và làm việc cuối tuần',
    items: [
      { name: 'Cold Brew Venti', quantity: 1, unitPrice: 95000, total: 95000, category: 'food' },
      { name: 'Bánh Mousse Dâu Tây', quantity: 1, unitPrice: 70000, total: 70000, category: 'food' }
    ]
  },
  {
    id: 'tx-prev-03',
    merchant: 'Nhà Sách Cá Chép Võ Văn Tần',
    date: '2026-08-18',
    time: '17:20',
    total: 320000,
    category: 'education',
    paymentMethod: 'VietQR',
    invoiceNumber: 'CC-081822',
    notes: 'Mua sách kinh tế và sổ tay ghi chép',
    items: [
      { name: 'Sách Kinh Tế Học Hài Hước', quantity: 1, unitPrice: 145000, total: 145000, category: 'education' },
      { name: 'Sách Tâm Lý Học Về Tiền', quantity: 1, unitPrice: 125000, total: 125000, category: 'education' },
      { name: 'Bút dạ quang pastel Stabilo (bộ 4)', quantity: 1, unitPrice: 50000, total: 50000, category: 'education' }
    ]
  },
  {
    id: 'tx-prev-04',
    merchant: 'Điện Lực EVN TP.HCM',
    date: '2026-08-10',
    time: '09:30',
    total: 680000,
    category: 'living',
    paymentMethod: 'Banking',
    invoiceNumber: 'EVN-082026',
    notes: 'Hóa đơn tiền điện sinh hoạt tháng 8',
    items: [
      { name: 'Tiền điện bậc thang sinh hoạt tháng 8', quantity: 1, unitPrice: 680000, total: 680000, category: 'living' }
    ]
  },
  {
    id: 'tx-prev-05',
    merchant: 'GrabCar Di chuyển công việc',
    date: '2026-08-15',
    time: '08:45',
    total: 135000,
    category: 'transport',
    paymentMethod: 'Thẻ Visa',
    invoiceNumber: 'GRB-08151',
    notes: 'Cước GrabCar đi hội thảo Quận 7',
    items: [
      { name: 'Cước xe 4 chỗ GrabCar', quantity: 1, unitPrice: 135000, total: 135000, category: 'transport' }
    ]
  },
  {
    id: 'tx-prev-06',
    merchant: 'Shopee Mall - Gia Dụng Lock&Lock',
    date: '2026-08-22',
    time: '20:10',
    total: 399000,
    category: 'shopping',
    paymentMethod: 'ShopeePay',
    invoiceNumber: 'SP-LL-0822',
    notes: 'Mua bộ hộp cơm thủy tinh chịu nhiệt mang đi làm',
    items: [
      { name: 'Bộ 3 hộp thủy tinh Lock&Lock kèm túi giữ nhiệt', quantity: 1, unitPrice: 399000, total: 399000, category: 'shopping' }
    ]
  },
  {
    id: 'tx-prev-07',
    merchant: 'Cấp Nước Sawaco TP.HCM',
    date: '2026-08-04',
    time: '10:00',
    total: 145000,
    category: 'living',
    paymentMethod: 'Banking',
    invoiceNumber: 'WAT-082026',
    notes: 'Tiền nước máy sinh hoạt tháng 8',
    items: [
      { name: 'Tiền nước máy tiêu thụ 14m3', quantity: 1, unitPrice: 145000, total: 145000, category: 'living' }
    ]
  },
  {
    id: 'tx-prev-08',
    merchant: 'Nhà Thuốc An Khang',
    date: '2026-08-12',
    time: '11:15',
    total: 185000,
    category: 'other',
    paymentMethod: 'Tiền mặt',
    invoiceNumber: 'AK-08129',
    notes: 'Mua thuốc nhỏ mắt, khẩu trang y tế và bông băng',
    items: [
      { name: 'Thuốc nhỏ mắt Rohto Extra', quantity: 2, unitPrice: 55000, total: 110000, category: 'other' },
      { name: 'Hộp khẩu trang 4D kháng khuẩn (50 cái)', quantity: 1, unitPrice: 45000, total: 45000, category: 'other' },
      { name: 'Bông gòn y tế & cồn đỏ sát trùng', quantity: 1, unitPrice: 30000, total: 30000, category: 'other' }
    ]
  },

  // Giao dịch Tháng 07/2026 (2 tháng trước)
  {
    id: 'tx-m07-01',
    merchant: 'Siêu Thị Lotte Mart Nam Sài Gòn',
    date: '2026-07-26',
    time: '18:15',
    total: 820000,
    category: 'shopping',
    paymentMethod: 'VNPay',
    invoiceNumber: 'HD-LOTTE-0726',
    notes: 'Mua thực phẩm tươi sống, sữa chua và đồ dùng gia đình tháng 7',
    items: [
      { name: 'Sữa tươi tiệt trùng nguyên kem 1L x3', quantity: 3, unitPrice: 38000, total: 114000, category: 'food' },
      { name: 'Thịt đùi heo VietGAP 1kg', quantity: 1, unitPrice: 125000, total: 125000, category: 'food' },
      { name: 'Dầu mè tinh luyện thơm Meizan', quantity: 1, unitPrice: 85000, total: 85000, category: 'food' },
      { name: 'Nước rửa sàn nhà Sunlight 3.8kg', quantity: 1, unitPrice: 125000, total: 125000, category: 'living' },
      { name: 'Trái cây nhiệt đới táo lê dưa hấu', quantity: 1, unitPrice: 165000, total: 165000, category: 'food' },
      { name: 'Túi đựng thực phẩm tự hủy', quantity: 2, unitPrice: 28000, total: 56000, category: 'living' },
      { name: 'Gia vị hạt nêm Knorr 900g', quantity: 1, unitPrice: 75000, total: 75000, category: 'food' },
      { name: 'Bánh quy bơ Danisa 454g', quantity: 1, unitPrice: 75000, total: 75000, category: 'food' }
    ]
  },
  {
    id: 'tx-m07-02',
    merchant: 'Phúc Long Coffee & Tea Crescent Mall',
    date: '2026-07-19',
    time: '15:20',
    total: 130000,
    category: 'food',
    paymentMethod: 'MoMo',
    invoiceNumber: 'PL-0719',
    notes: 'Trà sữa Phúc Long & Trà đào cam sả',
    items: [
      { name: 'Trà Sữa Phúc Long (L)', quantity: 1, unitPrice: 65000, total: 65000, category: 'food' },
      { name: 'Trà Đào Cam Sả (L)', quantity: 1, unitPrice: 65000, total: 65000, category: 'food' }
    ]
  },
  {
    id: 'tx-m07-03',
    merchant: 'Điện Lực EVN TP.HCM',
    date: '2026-07-08',
    time: '09:00',
    total: 710000,
    category: 'living',
    paymentMethod: 'Banking',
    invoiceNumber: 'EVN-072026',
    notes: 'Hóa đơn tiền điện sinh hoạt tháng 7',
    items: [{ name: 'Tiền điện sinh hoạt gia đình tháng 7', quantity: 1, unitPrice: 710000, total: 710000, category: 'living' }]
  },
  {
    id: 'tx-m07-04',
    merchant: 'Nhà Sách Fahasa Tân Định',
    date: '2026-07-14',
    time: '16:45',
    total: 260000,
    category: 'education',
    paymentMethod: 'VietQR',
    invoiceNumber: 'FHS-0714',
    notes: 'Mua sách kỹ năng và văn phòng phẩm',
    items: [
      { name: 'Sách Nghĩ Giàu Làm Giàu', quantity: 1, unitPrice: 110000, total: 110000, category: 'education' },
      { name: 'Sổ còng đa năng B5', quantity: 1, unitPrice: 90000, total: 90000, category: 'education' },
      { name: 'Bút ký mực gel', quantity: 2, unitPrice: 30000, total: 60000, category: 'education' }
    ]
  },
  {
    id: 'tx-m07-05',
    merchant: 'Cây xăng Petrolimex Q.1',
    date: '2026-07-22',
    time: '17:00',
    total: 85000,
    category: 'transport',
    paymentMethod: 'Tiền mặt',
    invoiceNumber: 'PLX-0722',
    notes: 'Đổ xăng RON 95',
    items: [{ name: 'Xăng RON 95-III', quantity: 1, unitPrice: 85000, total: 85000, category: 'transport' }]
  },

  // Giao dịch Tháng 06/2026 (3 tháng trước)
  {
    id: 'tx-m06-01',
    merchant: 'Siêu Thị Co.opXtra Vạn Hạnh Mall',
    date: '2026-06-25',
    time: '19:00',
    total: 750000,
    category: 'shopping',
    paymentMethod: 'VNPay',
    invoiceNumber: 'HD-COOP-0625',
    notes: 'Nhu yếu phẩm đầu hè tháng 6',
    items: [
      { name: 'Gạo thơm Jasmine 5kg', quantity: 1, unitPrice: 140000, total: 140000, category: 'food' },
      { name: 'Dầu ăn đậu nành Simply 2L', quantity: 1, unitPrice: 135000, total: 135000, category: 'food' },
      { name: 'Nước giặt Downy túi 3L', quantity: 1, unitPrice: 195000, total: 195000, category: 'living' },
      { name: 'Thịt heo xay tươi 500g', quantity: 1, unitPrice: 75000, total: 75000, category: 'food' },
      { name: 'Sữa chua men sống Probi lốc 5', quantity: 2, unitPrice: 28000, total: 56000, category: 'food' },
      { name: 'Bánh mì sandwich bơ sữa', quantity: 2, unitPrice: 22000, total: 44000, category: 'food' },
      { name: 'Rau xanh tổng hợp VietGAP', quantity: 1, unitPrice: 35000, total: 35000, category: 'food' },
      { name: 'Giấy vệ sinh cuộn cao cấp', quantity: 1, unitPrice: 70000, total: 70000, category: 'living' }
    ]
  },
  {
    id: 'tx-m06-02',
    merchant: 'The Coffee House Hai Bà Trưng',
    date: '2026-06-20',
    time: '14:30',
    total: 110000,
    category: 'food',
    paymentMethod: 'MoMo',
    invoiceNumber: 'TCH-0620',
    notes: 'Trà sữa Oolong & Bánh mì que bơ tỏi',
    items: [
      { name: 'Trà Oolong nướng kem phô mai', quantity: 1, unitPrice: 65000, total: 65000, category: 'food' },
      { name: 'Bánh mì que bơ tỏi giòn', quantity: 1, unitPrice: 45000, total: 45000, category: 'food' }
    ]
  },
  {
    id: 'tx-m06-03',
    merchant: 'Điện Lực EVN TP.HCM',
    date: '2026-06-08',
    time: '09:15',
    total: 670000,
    category: 'living',
    paymentMethod: 'Banking',
    invoiceNumber: 'EVN-062026',
    notes: 'Tiền điện sinh hoạt điều hòa tháng 6',
    items: [{ name: 'Tiền điện sinh hoạt tháng 6', quantity: 1, unitPrice: 670000, total: 670000, category: 'living' }]
  },
  {
    id: 'tx-m06-04',
    merchant: 'Cước GrabCar Đi Hội Nghị Khách Hàng',
    date: '2026-06-16',
    time: '08:00',
    total: 125000,
    category: 'transport',
    paymentMethod: 'Thẻ Visa',
    invoiceNumber: 'GRB-0616',
    notes: 'Di chuyển công tác Quận 1',
    items: [{ name: 'Cước xe GrabCar 4 chỗ', quantity: 1, unitPrice: 125000, total: 125000, category: 'transport' }]
  },
  {
    id: 'tx-m06-05',
    merchant: 'Nhà Thuốc Pharmacity Hai Bà Trưng',
    date: '2026-06-12',
    time: '18:40',
    total: 175000,
    category: 'other',
    paymentMethod: 'Tiền mặt',
    invoiceNumber: 'PMC-0612',
    notes: 'Mua thực phẩm chức năng vitamin C và khẩu trang',
    items: [
      { name: 'Vitamin C sủi hộp 10 viên', quantity: 2, unitPrice: 45000, total: 90000, category: 'other' },
      { name: 'Khẩu trang y tế 4 lớp hộp 50 cái', quantity: 1, unitPrice: 45000, total: 45000, category: 'other' },
      { name: 'Nước rửa tay khô sát khuẩn', quantity: 1, unitPrice: 40000, total: 40000, category: 'other' }
    ]
  }
];
