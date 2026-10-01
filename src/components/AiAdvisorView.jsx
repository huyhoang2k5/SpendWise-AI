import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  HelpCircle
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { askFinancialAdvisor } from '../services/geminiService';

export default function AiAdvisorView({ transactions, monthlyBudget, categoryBudgets, apiKey, openApiKeyModal }) {
  const stats = analyticsService.calculateStats(transactions, monthlyBudget, categoryBudgets);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Xin chào! Tôi đã tổng hợp ${stats.totalTransactions} khoản chi trong ${stats.currentMonthDisplay || 'tháng này'} với tổng cộng **${analyticsService.formatCurrency(stats.totalSpent)}**.
Bạn cần gợi ý hay tối ưu khoản nào hôm nay?`,
      time: 'Vừa xong'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    'Tháng này tôi tiêu nhiều nhất vào khoản nào và làm sao để giảm?',
    'Dự báo chi tiêu cuối tháng của tôi là bao nhiêu?',
    'Làm thế nào để áp dụng quy tắc 50/30/20 hiệu quả?',
    'Tôi có thể tiết kiệm 1.5 triệu đồng bằng cách nào?'
  ];

  const handleSendMessage = async (queryText) => {
    const query = queryText || inputValue;
    if (!query.trim() || isTyping) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const financialContext = {
        totalSpent: stats.totalSpent,
        totalTransactions: stats.totalTransactions,
        monthlyBudget: stats.monthlyBudget,
        remainingBudget: stats.remainingBudget,
        percentSpent: stats.percentSpent,
        dailyAverage: stats.dailyAverage,
        topCategory: stats.topCategory,
        categoryBreakdown: stats.categoryBreakdown.map(c => ({ 
          key: c.key,
          name: c.name, 
          amount: c.amount, 
          percent: c.percentOfTotal 
        })),
        projectedMonthEnd: stats.projectedMonthEnd,
        prevMonthTotal: stats.prevMonthTotal,
        momDiff: stats.momDiff,
        momPercent: stats.momPercent,
        transactions: (transactions || [])
          .filter(t => t.date && t.date.startsWith(stats.currentMonthPrefix || '2026-10'))
          .map(t => ({
            id: t._id || t.id,
            merchant: t.merchant,
            total: t.total,
            category: t.category,
            date: t.date,
            notes: t.notes || ''
          }))
      };

      const reply = await askFinancialAdvisor({
        query,
        financialContext,
        apiKey
      });

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('Advisor error:', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Xin lỗi, hiện tại đang có gián đoạn kết nối. Bạn vui lòng thử lại sau giây lát!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="page-view">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px' }}>
          Trợ Lý Tài Chính AI
        </h1>
      </div>

      {/* AI Insights & Forecasting Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Card 1: Spending Forecast */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Dự báo tháng</h4>
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)', marginBottom: '8px' }}>
            ~ {analyticsService.formatCurrency(stats.projectedMonthEnd)}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Chi tiêu trung bình {analyticsService.formatCurrency(stats.dailyAverage)}/ngày, dự kiến cả tháng khoảng <strong>{analyticsService.formatCurrency(stats.projectedMonthEnd)}</strong>.
          </p>
        </div>

        {/* Card 2: Anomaly Detection */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24'
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Bất thường</h4>
            </div>
          </div>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px', color: '#fbbf24' }}>
            {stats.peakDay ? `Đỉnh chi tiêu vào ngày ${stats.peakDay.displayDate}` : 'Dòng tiền ổn định'}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {stats.peakDay 
              ? `Ngày ${stats.peakDay.displayDate} có khoản chi ${analyticsService.formatCurrency(stats.peakDay.amount)} cao hơn bình thường.`
              : 'Chi tiêu các ngày đều ở mức ổn định, không có khoản đột biến.'}
          </p>
        </div>

        {/* Card 3: Actionable AI Smart Tip */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a78bfa'
            }}>
              <Lightbulb size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Gợi ý tiết kiệm</h4>
            </div>
          </div>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>
            Tối ưu danh mục {stats.topCategory?.name || 'Ăn uống'}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {stats.topCategory?.name || 'Ăn uống'} đang chiếm {Math.round(stats.topCategory?.percentOfTotal || 0)}% tổng chi. Cân nhắc giảm bớt các khoản phát sinh để tiết kiệm chi tiêu.
          </p>
        </div>
      </div>

      {/* Interactive AI Chat Assistant */}
      <div className="card" style={{ padding: '0', overflow: 'hidden', maxWidth: '880px', margin: '0 auto' }}>
        {/* Chat Header */}
        <div style={{
          padding: '16px 24px',
          background: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Bot size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Trò chuyện với Cố vấn AI</h3>
              <span style={{ fontSize: '11px', color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                {apiKey ? 'Gemini AI' : 'Sẵn sàng tư vấn'}
              </span>
            </div>
          </div>

          {!apiKey && (
            <button
              onClick={openApiKeyModal}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              Nhập API Key
            </button>
          )}
        </div>

        {/* Chat Messages Body */}
        <div style={{
          padding: '24px',
          height: '380px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          background: 'var(--bg-secondary)'
        }}>
          {messages.map((m, idx) => {
            const isAi = m.sender === 'ai';
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: isAi ? 'flex-start' : 'flex-end',
                  gap: '10px',
                  alignItems: 'flex-start'
                }}
              >
                {isAi && (
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#a78bfa',
                    flexShrink: 0
                  }}>
                    <Bot size={16} />
                  </div>
                )}
                <div style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: isAi ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                  background: isAi ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: isAi ? 'var(--text-primary)' : '#ffffff',
                  fontSize: '14px',
                  lineHeight: 1.5,
                  boxShadow: 'var(--shadow-sm)',
                  border: isAi ? '1px solid var(--border-subtle)' : 'none',
                  whiteSpace: 'pre-line'
                }}>
                  {m.text}
                  <div style={{
                    fontSize: '10px',
                    opacity: 0.7,
                    marginTop: '6px',
                    textAlign: isAi ? 'left' : 'right'
                  }}>
                    {m.time}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <Bot size={16} />
              <span>AI đang trả lời...</span>
            </div>
          )}
        </div>

        {/* Suggested Questions */}
        <div style={{
          padding: '12px 20px',
          background: 'var(--bg-tertiary)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto'
        }}>
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q)}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '12px',
                padding: '5px 12px',
                whiteSpace: 'nowrap',
                borderRadius: '9999px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <HelpCircle size={13} color="var(--emerald-400)" />
              <span>{q}</span>
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div style={{
          padding: '16px 20px',
          background: 'var(--bg-elevated)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '12px'
        }}>
          <input
            type="text"
            className="input"
            placeholder="Hỏi AI về chi tiêu, tiết kiệm, ngân sách..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
          />
          <button
            onClick={() => handleSendMessage()}
            className="btn btn-primary"
            disabled={!inputValue.trim() || isTyping}
            style={{ padding: '0 20px' }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
