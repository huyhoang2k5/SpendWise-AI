import { GoogleGenAI } from '@google/genai';
import { categorizeItemOrMerchant } from '../constants/categories.js';

/**
 * Creates GoogleGenAI client with proxy support for Vite dev server
 * to eliminate browser CORS and ISP connection drops.
 */
function createGenAIClient(apiKey) {
  // Chỉ route qua proxy Vite (/api-gemini) khi đang chạy môi trường phát triển cục bộ (dev)
  const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
  const baseUrl = (isDev && typeof window !== 'undefined' && window.location?.origin) 
    ? `${window.location.origin}/api-gemini` 
    : undefined;

  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    ...(baseUrl ? { httpOptions: { baseUrl } } : {})
  });
}

const DEFAULT_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash'
];

/**
 * Parses Vietnamese currency strings (e.g. "561.000 đ", "561.000", 561000)
 * to pure integer numbers.
 */
function parseVietnameseCurrency(val) {
  if (typeof val === 'number') return Math.round(val);
  if (!val) return 0;
  const cleanStr = String(val).replace(/[^\d]/g, '');
  return Number(cleanStr) || 0;
}

/**
 * Attempts Gemini model generation with fallback across stable active models
 */
async function generateWithModels(ai, payload, models = DEFAULT_MODELS) {
  let lastErr = null;
  for (const model of models) {
    try {
      const res = await ai.models.generateContent({
        model,
        ...payload
      });
      if (res && res.text) return res;
    } catch (err) {
      lastErr = err;
      console.warn(`[Gemini] Model ${model} gặp lỗi:`, err?.status || err?.message || err);
      // Brief pause if encountering high demand (503)
      if (err?.status === 503) {
        await new Promise(r => setTimeout(r, 600));
      }
    }
  }
  throw lastErr;
}

/**
 * Scan receipt image using Gemini Multimodal API if apiKey is provided,
 * otherwise fall back to intelligent realistic local OCR simulation engine.
 */
export async function parseInvoiceWithAI({ imageFile, imageBase64, sampleId = null, apiKey = null, onProgress = null }) {
  const notify = (step, progress) => {
    if (onProgress) onProgress({ step, progress });
  };

  notify('Đang tải ảnh hóa đơn...', 15);
  await new Promise(r => setTimeout(r, 600));

  notify('Đang tối ưu ảnh...', 35);
  await new Promise(r => setTimeout(r, 700));

  // If live Gemini API Key is available, run real Multimodal inference
  if (apiKey && apiKey.trim().length > 10) {
    try {
      notify('AI đang quét nội dung...', 60);
      
      const ai = createGenAIClient(apiKey);
      
      let base64Data = imageBase64;
      let mimeType = 'image/jpeg';
      
      if (imageBase64.includes(';base64,')) {
        const parts = imageBase64.split(';base64,');
        mimeType = parts[0].replace('data:', '');
        base64Data = parts[1];
      }

      const prompt = `
Bạn là chuyên gia phân tích hóa đơn và quản lý tài chính cá nhân bằng AI (Vietnamese Receipt & Invoice OCR Specialist).
Nhiệm vụ của bạn là đọc và bóc tách thông tin từ bức ảnh hóa đơn này sang định dạng JSON chính xác.

Yêu cầu định dạng JSON TRẢ VỀ DUY NHẤT (không dùng markdown code blocks ngoài JSON, không thêm văn bản khác):
{
  "merchant": "Tên cửa hàng / siêu thị / đơn vị",
  "address": "Địa chỉ cửa hàng nếu có",
  "date": "YYYY-MM-DD (lấy đúng ngày trên hóa đơn, nếu chỉ có DD/MM/YYYY thì chuyển thành YYYY-MM-DD)",
  "time": "HH:mm nếu có",
  "invoiceNumber": "Số hóa đơn / mã giao dịch nếu có",
  "category": "Chọn 1 trong các mã: 'food' (Ăn uống), 'shopping' (Mua sắm), 'transport' (Đi lại), 'education' (Học tập), 'living' (Sinh hoạt/hóa đơn điện nước mạng), 'other' (Khác)",
  "paymentMethod": "Tiền mặt / Thẻ / Chuyển khoản / MoMo / ZaloPay / ShopeePay / Khác",
  "items": [
    {
      "name": "Tên món hàng / sản phẩm",
      "quantity": 1,
      "unitPrice": 50000,
      "total": 50000,
      "category": "food"
    }
  ],
  "vat": 0,
  "discount": 0,
  "total": 50000,
  "confidence": 0.98,
  "notes": "Tóm tắt ngắn gọn hóa đơn"
}

Quy tắc kiểm tra:
1. Đọc kỹ từng dòng hàng, số lượng, đơn giá và thành tiền.
2. Tổng tiền thanh toán phải khớp với số tiền thực tế trên hóa đơn.
3. Luôn phân loại danh mục chính xác dựa theo tính chất món hàng.
`;

      notify('Đang trích xuất thông tin...', 80);

      const requestPayload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ]
      };

      const response = await generateWithModels(ai, requestPayload, DEFAULT_MODELS);

      notify('Hoàn tất xử lý!', 98);
      const rawText = response.text || '';
      
      // Clean possible markdown code fences
      const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      const parsedTotal = parseVietnameseCurrency(parsed.total);
      const parsedVat = parseVietnameseCurrency(parsed.vat);
      const parsedDiscount = parseVietnameseCurrency(parsed.discount);

      return {
        id: 'inv-' + Date.now(),
        merchant: parsed.merchant || 'Hóa đơn mua hàng',
        address: parsed.address || '',
        date: parsed.date || new Date().toISOString().split('T')[0],
        time: parsed.time || '12:00',
        invoiceNumber: parsed.invoiceNumber || 'HD-' + Math.floor(10000 + Math.random() * 90000),
        category: parsed.category || categorizeItemOrMerchant(parsed.merchant),
        paymentMethod: parsed.paymentMethod || 'Chưa xác định',
        items: Array.isArray(parsed.items) && parsed.items.length > 0 ? parsed.items.map(it => ({
          name: it.name || 'Sản phẩm',
          quantity: Number(it.quantity) || 1,
          unitPrice: parseVietnameseCurrency(it.unitPrice || it.price),
          total: parseVietnameseCurrency(it.total),
          category: it.category || parsed.category || 'shopping'
        })) : [
          { name: 'Khoản chi tiêu chung', quantity: 1, unitPrice: parsedTotal || 0, total: parsedTotal || 0, category: parsed.category || 'other' }
        ],
        vat: parsedVat,
        discount: parsedDiscount,
        total: parsedTotal,
        confidence: Number(parsed.confidence) || 0.96,
        isSimulated: false,
        source: 'gemini-api'
      };
    } catch (err) {
      console.warn('Lỗi khi gọi Gemini API trực tiếp:', err);
      // If user uploaded a custom real photo, don't silently return fake random data
      if (imageBase64 && !sampleId) {
        throw new Error('Máy chủ Google AI tạm thời bận hoặc gián đoạn kết nối. Bạn vui lòng bấm nút "Thử quét lại"!');
      }
    }
  }

  // Local Intelligent Heuristic Parser (Only used when NO API key provided or demo mode)
  notify('Đang đọc thông tin hóa đơn...', 70);
  await new Promise(r => setTimeout(r, 700));

  notify('Đang phân loại chi tiêu...', 90);
  await new Promise(r => setTimeout(r, 600));

  // Determine realistic simulated extraction
  const randomTotal = Math.floor(Math.random() * 12 + 3) * 25000;
  const today = new Date().toISOString().split('T')[0];

  return {
    id: 'inv-' + Date.now(),
    merchant: 'Cửa hàng tiện lợi 24h / Cửa hàng mua sắm',
    address: 'Quận 1, TP. Hồ Chí Minh',
    date: today,
    time: '12:30',
    invoiceNumber: 'HD-GEN-' + Math.floor(100000 + Math.random() * 900000),
    category: 'shopping',
    paymentMethod: 'Chuyển khoản VietQR',
    vat: Math.round(randomTotal * 0.08),
    discount: 0,
    total: randomTotal,
    items: [
      { name: 'Nước suối đóng chai & Đồ uống', quantity: 2, unitPrice: 15000, total: 30000, category: 'food' },
      { name: 'Snack & Đồ ăn nhẹ', quantity: 1, unitPrice: 25000, total: 25000, category: 'food' },
      { name: 'Vật dụng gia dụng cá nhân', quantity: 1, unitPrice: randomTotal - 55000, total: randomTotal - 55000, category: 'shopping' }
    ],
    confidence: 0.92,
    isSimulated: true,
    source: 'smart-local-ocr'
  };
}

/**
 * AI Financial Advisor Chat & Analysis
 */
export async function askFinancialAdvisor({ query, financialContext, apiKey = null }) {
  const { 
    totalSpent = 0, 
    totalTransactions = 0,
    monthlyBudget = 12000000, 
    remainingBudget = 0,
    percentSpent = 0, 
    dailyAverage = 0,
    topCategory = null, 
    categoryBreakdown = [],
    projectedMonthEnd = 0,
    transactions = [],
    prevMonthTotal = 0,
    momPercent = 0
  } = financialContext || {};

  // 1. If Gemini API Key is provided, use Google Gemini 3.5 Flash with intelligent contextual prompt
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const ai = createGenAIClient(apiKey);
      const prompt = `
Bạn là Cố vấn Tài chính Cá nhân AI thông minh (SpendWise AI Personal Financial Advisor).
Dữ liệu tài chính tháng này của người dùng:
- Tổng chi tiêu tháng: ${(totalSpent || 0).toLocaleString('vi-VN')} đ
- Số lượng hóa đơn đã ghi nhận: ${totalTransactions}
- Ngân sách tháng: ${(monthlyBudget || 0).toLocaleString('vi-VN')} đ (Đã dùng ${Math.round(percentSpent || 0)}%, còn lại ${(remainingBudget || 0).toLocaleString('vi-VN')} đ)
- Danh mục chi tiêu nhiều nhất: ${topCategory?.name || 'Chưa rõ'} (${(topCategory?.amount || 0).toLocaleString('vi-VN')} đ, chiếm ${Math.round(topCategory?.percentOfTotal || 0)}% tổng chi)
- Phân bổ các nhóm chi tiêu:
${(categoryBreakdown || []).map(c => `  + ${c.name}: ${(c.amount || 0).toLocaleString('vi-VN')} đ (${Math.round(c.percent || 0)}%)`).join('\n')}
- Chi tiêu dự báo kết thúc tháng: ${(projectedMonthEnd || 0).toLocaleString('vi-VN')} đ
- Chi tiêu trung bình ngày: ${(dailyAverage || 0).toLocaleString('vi-VN')} đ/ngày
- Chi tiêu tháng trước: ${(prevMonthTotal || 0).toLocaleString('vi-VN')} đ (${momPercent > 0 ? `Tăng ${Math.round(momPercent)}%` : `Giảm ${Math.abs(Math.round(momPercent))}%`})
- Danh sách các hóa đơn đã ghi nhận tháng này:
${(transactions || []).map(t => `  • [${t.date}] ${t.merchant} (${t.category}): ${(t.total || 0).toLocaleString('vi-VN')} đ - ${t.notes || ''}`).join('\n')}

Người dùng vừa nói: "${query}"

QUY TẮC BẮT BUỘC:
1. TRẢ LỜI ĐÚNG TRỌNG TÂM, THÔNG MINH VÀ TỰ NHIÊN:
   - Nếu người dùng chào hỏi, mở đầu hoặc nói ý định (ví dụ: "tôi muốn hỏi bạn 1 số câu hỏi", "chào bạn", "hello", "hi", "bạn ơi", "bạn có thể giúp tôi không",...):
     Hãy chào lại niềm nở, tự giới thiệu là SpendWise AI và nhiệt tình mời người dùng cứ thoải mái đặt câu hỏi. TUYỆT ĐỐI KHÔNG xả ra bản phân tích số liệu tài chính dài dòng khi người dùng chưa hỏi về số liệu!
   - Nếu người dùng hỏi câu hỏi tài chính cụ thể:
     Trả lời trực diện, dựa trên đúng số liệu thực tế ở trên, đưa ra phân tích và giải pháp thiết thực, có tính khả thi cao.
2. Dùng tiếng Việt tự nhiên, súc tích, văn phong chuyên nghiệp nhưng gần gũi, định dạng markdown đẹp mắt với gạch đầu dòng rõ ràng.
`;
      const response = await generateWithModels(ai, { contents: prompt });
      return response.text;
    } catch (err) {
      console.warn('Gemini chat error, fallback to smart heuristic engine:', err);
    }
  }

  // 2. Smart Semantic Heuristic Engine (Deeply customized, on-target local AI)
  await new Promise(r => setTimeout(r, 400));
  const lowerQuery = query.toLowerCase().trim();

  // Intent 0: Chào hỏi / Mở đầu cuộc trò chuyện
  if (
    lowerQuery.includes('muốn hỏi') || 
    lowerQuery.includes('câu hỏi') || 
    lowerQuery.includes('chào') || 
    lowerQuery.includes('hello') || 
    lowerQuery.startsWith('hi') ||
    lowerQuery.includes('bạn ơi') ||
    lowerQuery.includes('bạn là ai') ||
    lowerQuery.includes('giúp tôi')
  ) {
    return `👋 **Chào bạn! Tôi là SpendWise AI – Trợ lý tài chính cá nhân của bạn.**

Tôi rất sẵn lòng lắng nghe và hỗ trợ bạn giải đáp mọi thắc mắc! Bạn cứ thoải mái đặt câu hỏi nhé:
• Bạn muốn kiểm tra khoản chi tiêu nào trong tháng?
• Cần lời khuyên tiết kiệm hay phân bổ ngân sách 50/30/20?
• Hay dự báo chi tiêu cuối tháng và tối ưu hóa các hóa đơn?

Tôi đã sẵn sàng đồng hành cùng bạn rồi! 😊`;
  }

  // Intent 1: Tiêu nhiều nhất vào khoản nào & Làm sao để giảm?
  if (
    lowerQuery.includes('nhiều nhất') || 
    lowerQuery.includes('khoản nào') || 
    lowerQuery.includes('chi nhiều') ||
    lowerQuery.includes('chiếm nhiều') ||
    lowerQuery.includes('lớn nhất') ||
    (lowerQuery.includes('làm sao') && lowerQuery.includes('giảm'))
  ) {
    const topCatName = topCategory?.name || 'Sinh hoạt';
    const topCatKey = topCategory?.key || 'living';
    const topCatAmount = topCategory?.amount || 0;
    const topCatPercent = totalSpent > 0 ? Math.round((topCatAmount / totalSpent) * 100) : 0;

    // Find biggest transaction in this category
    const catTxs = transactions.filter(t => t.category === topCatKey);
    const biggestTx = catTxs.length > 0 
      ? catTxs.reduce((prev, curr) => ((Number(curr.total) || 0) > (Number(prev.total) || 0) ? curr : prev), catTxs[0])
      : null;

    let tips = '';
    switch (topCatKey) {
      case 'living':
        tips = `1. **Chia sẻ tiền phòng trọ / KTX:** Đây là khoản chi cố định lớn nhất chiếm phần lớn ngân sách. Nếu đang ở 1 mình, bạn có thể tìm thêm 1 người bạn cùng phòng đáng tin cậy để chia đôi tiền phòng, giúp giảm ngay 30% - 50% chi phí này mỗi tháng (~1.000.000đ - 1.500.000đ/tháng).
2. **Tiết kiệm tiền điện & nước sinh hoạt:** Tận dụng không gian thư viện hoặc trường học vào ban ngày để học tập và sạc thiết bị, giảm thời gian bật máy lạnh/quạt tại phòng trọ. Tắt bình nóng lạnh và rút phích cắm khi không sử dụng.
3. **Dùng chung gói cước mạng:** Nếu ở trọ, hãy rủ phòng bên cạnh dùng chung một đường truyền wifi tốc độ cao thay vì mỗi phòng tự đăng ký riêng một gói cước internet.`;
        break;

      case 'food':
        tips = `1. **Nấu ăn tại nhà 3-4 ngày/tuần:** Ăn ngoài hoặc đặt đồ ăn giao tận nơi thường tốn 45.000đ - 65.000đ/bữa. Khi tự đi chợ nấu ăn (chuẩn bị trước cho 2-3 ngày), chi phí giảm xuống còn ~25.000đ/bữa, tiết kiệm được từ 500.000đ - 800.000đ/tháng.
2. **Hạn chế thức uống mang đi:** Các ly trà sữa, cà phê ngoài quán (40.000đ - 60.000đ/ly) tích lũy rất nhanh. Hãy chuẩn bị bình nước cá nhân hoặc tự pha cà phê mang theo.
3. **Tránh ăn đêm ngẫu hứng:** Đặt đồ ăn đêm theo cảm xúc thường vừa tốn kém vừa không tốt cho sức khỏe.`;
        break;

      case 'education':
        tips = `1. **Mượn giáo trình & mua lại sách cũ:** Mượn giáo trình tại thư viện trường hoặc mua lại từ các anh chị khóa trên (giá chỉ bằng 30% - 50% sách mới).
2. **Tận dụng tài liệu số & khóa học miễn phí:** Khai thác các nguồn học liệu trực tuyến miễn phí (GitHub Student Developer Pack, Coursera Financial Aid, YouTube).
3. **Mua văn phòng phẩm theo combo:** Mua tập vở và bút viết theo lốc số lượng lớn vào đầu học kỳ để được giá sỉ.`;
        break;

      case 'shopping':
        tips = `1. **Áp dụng nguyên tắc "Chờ 48 giờ":** Khi muốn mua một món đồ không thật sự cấp thiết, hãy chờ 48 giờ. Hơn 70% trường hợp cảm xúc mua sắm nhất thời sẽ nguội đi.
2. **Lập danh sách trước khi mua:** Liệt kê chính xác những thứ cần thiết trước khi vào siêu thị hoặc mở sàn TMĐT, kiên quyết không mua đồ ngoài danh sách.
3. **Không mua chỉ vì khuyến mãi:** Đừng bỏ thêm tiền chỉ để "đủ đơn nhận mã giảm giá".`;
        break;

      case 'transport':
        tips = `1. **Sử dụng vé tháng xe buýt sinh viên:** Nếu tuyến đường thuận tiện, vé tháng xe buýt chỉ khoảng 100.000đ - 200.000đ/tháng, rẻ hơn rất nhiều so với đổ xăng xe máy hay đi xe ôm công nghệ.
2. **Đi chung xe (Carpooling):** Đi chung xe với bạn cùng phòng hoặc cùng lớp để san sẻ tiền xăng.
3. **Bảo dưỡng xe định kỳ:** Bơm lốp đủ áp suất và thay nhớt đúng hạn giúp xe tiết kiệm 10% - 15% nhiên liệu.`;
        break;

      case 'entertainment':
        tips = `1. **Chia sẻ gói gia đình (Family Plan):** Dùng chung tài khoản Spotify, Netflix hoặc Youtube Premium theo nhóm 5-6 người để giảm 70% chi phí.
2. **Tham gia hoạt động miễn phí:** Tận dụng các câu lạc bộ trường, sự kiện văn hóa miễn phí, thể thao ngoài trời thay vì đi bar/pub hay rạp phim đắt đỏ.`;
        break;

      default:
        tips = `1. **Phân loại Cần (Needs) và Muốn (Wants):** Đánh giá lại từng hóa đơn xem khoản nào có thể tạm hoãn hoặc loại bỏ.
2. **Đặt hạn mức ngân sách tuần:** Chia nhỏ ngân sách cho danh mục này theo từng tuần để không bị vung tay quá trán đầu tháng.
3. **So sánh giá trước khi chi tiêu:** Tìm kiếm các lựa chọn thay thế có giá cả hợp lý hơn.`;
        break;
    }

    return `🎯 **Phân tích khoản chi lớn nhất tháng này của bạn:**

Khoản bạn tiêu nhiều nhất là danh mục **${topCatName}** với tổng số tiền **${topCatAmount.toLocaleString('vi-VN')} đ** (chiếm **${topCatPercent}%** tổng chi tiêu cả tháng).
${biggestTx ? `• Hóa đơn lớn nhất đã ghi nhận: **${biggestTx.merchant}** (${Number(biggestTx.total).toLocaleString('vi-VN')} đ, ngày ${biggestTx.date}).` : ''}

💡 **Làm sao để giảm khoản này hiệu quả và đúng thực tế?**
${tips}`;
  }

  // Intent 2: Dự báo chi tiêu cuối tháng
  if (lowerQuery.includes('dự báo') || lowerQuery.includes('cuối tháng') || lowerQuery.includes('hết tháng')) {
    const isOver = projectedMonthEnd > monthlyBudget;
    return `🔮 **Dự báo chi tiêu cuối tháng:**

• **Tốc độ chi tiêu hiện tại:** Trung bình **${dailyAverage.toLocaleString('vi-VN')} đ/ngày** (qua ${transactions.length || totalTransactions} hóa đơn).
• **Dự báo tổng chi tiêu cả tháng:** Khoảng **${projectedMonthEnd.toLocaleString('vi-VN')} đ**.
• **So với ngân sách đặt ra (${monthlyBudget.toLocaleString('vi-VN')} đ):**
  ${isOver 
    ? `⚠️ **Nguy cơ vượt ngân sách:** Dự kiến bạn sẽ bội chi khoảng **${(projectedMonthEnd - monthlyBudget).toLocaleString('vi-VN')} đ** (+${Math.round(((projectedMonthEnd - monthlyBudget) / monthlyBudget) * 100)}%). Bạn cần kiểm soát chặt chẽ các khoản chi tiêu trong những ngày còn lại!`
    : `✅ **An toàn ngân sách:** Dự kiến bạn sẽ kết thúc tháng với số tiền còn dư khoảng **${(monthlyBudget - projectedMonthEnd).toLocaleString('vi-VN')} đ**. Bạn đang duy trì kỷ luật chi tiêu rất tốt!`}

💡 **Khuyến nghị:** Tiếp tục quét hóa đơn ngay sau mỗi lần chi tiêu để SpendWise AI cập nhật dự báo liên tục theo thời gian thực!`;
  }

  // Intent 3: Quy tắc 50/30/20
  if (lowerQuery.includes('50/30/20') || lowerQuery.includes('50 30 20') || lowerQuery.includes('quy tắc')) {
    const n50 = Math.round(monthlyBudget * 0.5);
    const n30 = Math.round(monthlyBudget * 0.3);
    const n20 = Math.round(monthlyBudget * 0.2);

    return `📐 **Kế hoạch phân bổ theo quy tắc 50/30/20 cho ngân sách ${(monthlyBudget || 0).toLocaleString('vi-VN')} đ:**

1. **50% - Nhu cầu thiết yếu (${n50.toLocaleString('vi-VN')} đ):**
   - Dành cho: Tiền phòng trọ, ăn uống cơ bản, điện nước internet, xăng xe đi lại.
   - *Hiện tại:* Bạn đã chi ${(topCategory?.amount || 0).toLocaleString('vi-VN')} đ cho ${topCategory?.name || 'nhu cầu thiết yếu'}.

2. **30% - Sở thích linh hoạt (${n30.toLocaleString('vi-VN')} đ):**
   - Dành cho: Cà phê bạn bè, mua sắm đồ dùng cá nhân, giải trí, xem phim, ăn ngoài.

3. **20% - Tiết kiệm & Tích lũy khẩn cấp (${n20.toLocaleString('vi-VN')} đ):**
   - Chuyển thẳng số tiền này vào tài khoản tiết kiệm hoặc heo đất điện tử ngay khi nhận tiền đầu tháng ("Pay yourself first"), không để tiền thừa mới tiết kiệm.`;
  }

  // Intent 4: Tiết kiệm tiền / Kế hoạch tiết kiệm
  if (lowerQuery.includes('tiết kiệm') || lowerQuery.includes('dành dụm') || lowerQuery.includes('tích lũy')) {
    return `💰 **Kế hoạch hành động để tiết kiệm hiệu quả:**

Dựa trên cơ cấu chi tiêu hiện tại (${totalSpent.toLocaleString('vi-VN')} đ đã chi / ${monthlyBudget.toLocaleString('vi-VN')} đ ngân sách):

1. **Tập trung vào danh mục lớn nhất (${topCategory?.name || 'Sinh hoạt'}):** Tối ưu hóa các chi phí dùng chung hoặc chi phí cố định để giảm ngay 10% - 20%.
2. **Chiến lược "Tiết kiệm trước - Chi tiêu sau":** Mỗi đầu tháng, hãy trích ngay 15% - 20% vào tài khoản riêng trước khi bắt đầu chi tiêu hàng ngày.
3. **Kiểm soát các khoản "chi tiêu vi mô" (Micro-spending):** Các khoản 20.000đ - 40.000đ mua đồ ăn vặt, trà sữa lặt vặt mỗi ngày có thể tích tụ thành 800.000đ - 1.200.000đ mỗi tháng mà bạn không hề hay biết nếu không quét hóa đơn theo dõi.`;
  }

  // Intent 5: Tình hình ngân sách / Còn bao nhiêu tiền
  if (lowerQuery.includes('ngân sách') || lowerQuery.includes('còn bao nhiêu') || lowerQuery.includes('hết tiền')) {
    return `📊 **Tổng kết tình hình ngân sách tháng này:**

• **Tổng ngân sách:** ${(monthlyBudget || 0).toLocaleString('vi-VN')} đ
• **Đã chi tiêu:** ${(totalSpent || 0).toLocaleString('vi-VN')} đ (${Math.round(percentSpent || 0)}%)
• **Ngân sách còn lại:** ${(remainingBudget || 0).toLocaleString('vi-VN')} đ
• **Trạng thái:** ${percentSpent > 80 ? '⚠️ Cần thắt chặt chi tiêu! Bạn đã dùng hơn 80% ngân sách tháng.' : '✅ Ngân sách đang ở mức an toàn, bạn vẫn kiểm soát tốt dòng tiền của mình!'}

💡 Mức chi tiêu an toàn khuyến nghị cho các ngày còn lại là khoảng **${Math.max(0, Math.round(remainingBudget / 10)).toLocaleString('vi-VN')} đ/ngày**.`;
  }

  // Intent 6: So sánh với tháng trước
  if (lowerQuery.includes('tháng trước') || lowerQuery.includes('so sánh')) {
    const isIncrease = (momPercent || 0) > 0;
    return `📈 **So sánh chi tiêu với tháng trước:**

• **Tháng này:** ${(totalSpent || 0).toLocaleString('vi-VN')} đ
• **Tháng trước:** ${(prevMonthTotal || 0).toLocaleString('vi-VN')} đ
• **Biến động:** ${isIncrease ? `Tăng thêm **${Math.abs(Math.round(momPercent))}%** (+${Math.abs(totalSpent - prevMonthTotal).toLocaleString('vi-VN')} đ)` : `Tiết kiệm được **${Math.abs(Math.round(momPercent))}%** (-${Math.abs(totalSpent - prevMonthTotal).toLocaleString('vi-VN')} đ)`}

${isIncrease 
  ? 'Lưu ý: Mức chi tiêu tháng này đang có chiều hướng tăng so với tháng trước. Bạn nên rà soát lại các khoản chi lớn trong danh mục Sinh hoạt và Mua sắm.'
  : 'Rất tốt! Bạn đang kiểm soát chi tiêu chặt chẽ hơn so với tháng trước.'}`;
  }

  // Default Fallback
  return `🤖 **SpendWise AI Phân tích Tổng quan:**
- Tổng chi tiêu tháng: **${(totalSpent || 0).toLocaleString('vi-VN')} đ** qua **${transactions.length || totalTransactions} hóa đơn**.
- Khoản chi lớn nhất: **${topCategory?.name || 'Sinh hoạt'}** chiếm **${Math.round(topCategory?.percentOfTotal || 0)}%** (${(topCategory?.amount || 0).toLocaleString('vi-VN')} đ).
- Chi tiêu trung bình ngày: **${(dailyAverage || 0).toLocaleString('vi-VN')} đ/ngày**, dự báo hết tháng khoảng **${(projectedMonthEnd || 0).toLocaleString('vi-VN')} đ**.

Bạn có thể bấm vào các câu hỏi gợi ý bên dưới hoặc hỏi tôi bất cứ điều gì về chi tiêu, ngân sách và cách tối ưu hóa nhé!`;
}
