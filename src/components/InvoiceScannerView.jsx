import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  Store, 
  Calendar, 
  CreditCard, 
  Tag, 
  Receipt, 
  Layers,
  ArrowRight,
  RefreshCw,
  FileCheck,
  Image as ImageIcon,
  X,
  SwitchCamera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { parseInvoiceWithAI } from '../services/geminiService';
import { analyticsService } from '../services/analyticsService';

export default function InvoiceScannerView({ onAddTransaction, apiKey, onNavigateToDashboard }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [svgPreview, setSvgPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [parsedData, setParsedData] = useState(null);
  const [scanError, setScanError] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleStartCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        setIsLiveCameraOpen(true);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.log('Play err:', e));
        }
      } catch (err) {
        console.warn('Live camera error, opening system camera:', err);
        stopLiveCamera();
        cameraInputRef.current?.click();
      }
    } else {
      cameraInputRef.current?.click();
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsLiveCameraOpen(false);
  };

  const toggleFacingMode = async () => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacing);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: newFacing },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.log('Play err:', e));
      }
    } catch (e) {
      console.warn('Switch camera error:', e);
    }
  };

  const captureLivePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    stopLiveCamera();

    setImageSrc(dataUrl);
    setSvgPreview(null);
    setScanError(null);
    startScan({ imageBase64: dataUrl });
  };

  // Handle uploading real image file
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
      setSvgPreview(null);
      setScanError(null);
      startScan({ imageBase64: event.target.result });
    };
    reader.readAsDataURL(file);
  };

  // Perform AI parsing
  const startScan = async ({ imageBase64 }) => {
    setIsScanning(true);
    setParsedData(null);
    setScanError(null);
    setScanProgress(10);
    setScanStage('Đang xử lý hình ảnh...');

    try {
      const result = await parseInvoiceWithAI({
        imageBase64,
        apiKey,
        onProgress: ({ step, progress }) => {
          setScanStage(step);
          setScanProgress(progress);
        }
      });

      setParsedData(result);
    } catch (err) {
      console.error('Scan error:', err);
      setScanError(err.message || 'Lỗi quét hóa đơn. Vui lòng bấm thử lại!');
    } finally {
      setIsScanning(false);
    }
  };

  // Form field changes
  const updateField = (field, value) => {
    setParsedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Item list updates
  const handleItemChange = (index, field, value) => {
    const newItems = [...parsedData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'quantity' || field === 'unitPrice' || field === 'total' 
        ? Number(value) || 0 
        : value
    };

    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }

    // Recalculate total
    const itemsSum = newItems.reduce((acc, it) => acc + (it.total || 0), 0);
    const newTotal = itemsSum + (parsedData.vat || 0) - (parsedData.discount || 0);

    setParsedData(prev => ({
      ...prev,
      items: newItems,
      total: Math.max(0, newTotal)
    }));
  };

  const addItem = () => {
    setParsedData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { name: 'Món hàng mới', quantity: 1, unitPrice: 20000, total: 20000, category: prev.category }
      ]
    }));
  };

  const removeItem = (index) => {
    const newItems = parsedData.items.filter((_, i) => i !== index);
    const itemsSum = newItems.reduce((acc, it) => acc + (it.total || 0), 0);
    const newTotal = itemsSum + (parsedData.vat || 0) - (parsedData.discount || 0);

    setParsedData(prev => ({
      ...prev,
      items: newItems,
      total: Math.max(0, newTotal)
    }));
  };

  // Save to expense ledger
  const handleSaveTransaction = () => {
    if (!parsedData) return;

    onAddTransaction({
      ...parsedData,
      id: 'tx-' + Date.now(),
      savedAt: new Date().toISOString()
    });

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti trigger:', e);
    }
  };

  const resetScanner = () => {
    setImageSrc(null);
    setSvgPreview(null);
    setParsedData(null);
    setIsScanning(false);
    setSelectedSample(null);
  };

  return (
    <div style={{ padding: '36px 0 60px' }}>
      {/* Title Header - Desktop Version (Giữ nguyên cho Laptop) */}
      <div className="desktop-only-scanner" style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '9999px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          color: '#34d399',
          fontSize: '13px',
          fontWeight: '700',
          marginBottom: '14px'
        }}>
          <Sparkles size={15} />
          <span>Quét Hóa Đơn AI</span>
        </div>
        <h1 style={{ fontSize: '30px', marginBottom: '8px' }}>
          Quét Hóa Đơn Tự Động
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '14px' }}>
          Tải ảnh hoặc chụp hóa đơn để AI tự động nhận diện và lưu chi tiêu.
        </p>
      </div>

      {/* Title Header - Mobile Version (Tối ưu cho Điện Thoại) */}
      <div className="mobile-only-scanner" style={{ marginBottom: '18px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '9999px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          color: '#34d399',
          fontSize: '11.5px',
          fontWeight: '700',
          marginBottom: '8px'
        }}>
          <Sparkles size={13} />
          <span>Quét Hóa Đơn AI</span>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>
          Quét Hóa Đơn AI
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
          Chụp hoặc tải ảnh hóa đơn để AI tự động ghi nhận chi tiêu.
        </p>
      </div>

      {/* Main Scanner Section */}
      {!parsedData && !isScanning && (
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          {/* Error Banner if any */}
          {scanError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '14px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={20} color="#f87171" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '14px', color: '#fca5a5', fontWeight: '500' }}>{scanError}</span>
              </div>
              {imageSrc && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    startScan({ imageBase64: imageSrc });
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '13px', flexShrink: 0 }}
                >
                  <RefreshCw size={14} />
                  <span>Thử quét lại</span>
                </button>
              )}
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
          />

          {/* MOBILE SCANNER HERO CARD (Chuyên dụng cho Điện Thoại) */}
          <div className="mobile-only-scanner" style={{ marginBottom: '24px' }}>
            <div style={{
              background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.14), rgba(6, 182, 212, 0.08))',
              border: '1.5px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '20px',
              padding: '24px 18px',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.12)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div 
                onClick={handleStartCamera}
                className="mobile-camera-pulse-btn"
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 0 25px rgba(16, 185, 129, 0.55), 0 0 0 8px rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <Camera size={38} strokeWidth={2.2} />
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-primary)' }}>
                Chụp Hóa Đơn Bằng Camera
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.45 }}>
                Chụp hóa đơn để AI tự động nhận diện chi tiêu
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleStartCamera}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    height: '46px',
                    fontSize: '14px',
                    fontWeight: '700',
                    justifyContent: 'center',
                    gap: '8px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <Camera size={18} />
                  <span>Chụp ảnh hóa đơn</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    height: '42px',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    justifyContent: 'center',
                    gap: '8px',
                    borderRadius: '12px'
                  }}
                >
                  <ImageIcon size={17} color="var(--emerald-400)" />
                  <span>Chọn từ thư viện ảnh</span>
                </button>
              </div>
            </div>
          </div>

          {/* DESKTOP UPLOAD DROPZONE (Giữ nguyên 100% cho Laptop) */}
          <div className="desktop-only-scanner">
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--surface-glass-border)',
              borderRadius: '20px',
              padding: '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'var(--surface-card)',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.3s ease',
              marginBottom: '32px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--emerald-500)';
              e.currentTarget.style.background = 'var(--surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--surface-glass-border)';
              e.currentTarget.style.background = 'var(--surface-card)';
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--emerald-400)'
            }}>
              <UploadCloud size={32} />
            </div>
            <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>
              Kéo thả hoặc Bấm để tải ảnh hóa đơn
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
              Hỗ trợ định dạng JPG, PNG, WEBP, HEIC từ điện thoại hoặc máy tính
            </p>
            <div style={{ display: 'inline-flex', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-primary btn-sm"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                <Camera size={16} />
                <span>Chọn ảnh từ thiết bị</span>
              </button>
            </div>
          </div>
          </div>

          {/* Real-world Receipt Scanning Guide */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--emerald-400)" />
              <span>Hướng dẫn chụp & tải hóa đơn thực tế</span>
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px'
            }}>
              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--emerald-400)', marginBottom: '4px' }}>
                  📸 1. Đầy đủ ánh sáng & phẳng phiu
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Đặt hóa đơn phẳng trên bàn hoặc nền tối, tránh bị bóng tay che khuất dòng chữ hoặc số tiền.
                </p>
              </div>

              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--emerald-400)', marginBottom: '4px' }}>
                  🧾 2. Đầy đủ các phần quan trọng
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Bao gồm tên cửa hàng, ngày mua, danh sách từng món hàng và dòng tổng tiền thanh toán cuối cùng.
                </p>
              </div>

              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--emerald-400)', marginBottom: '4px' }}>
                  📱 3. Chụp biên lai ngân hàng / POS
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Hỗ trợ cả ảnh chụp màn hình chuyển khoản VietQR, VNPay, MoMo và biên lai quẹt thẻ POS.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Laser Scanning In-Progress View */}
      {isScanning && (
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div className="card" style={{ padding: '32px' }}>
            <div className="scanner-container" style={{
              width: '280px',
              height: '380px',
              margin: '0 auto 24px',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              background: '#161d2b',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {/* Laser animation */}
              <div className="scanner-laser" />
              <div className="scanner-grid-overlay" />

              {/* Receipt Preview inside scan */}
              {imageSrc && (
                <img 
                  src={imageSrc} 
                  alt="Scanning Receipt" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.8 }} 
                />
              )}
              {svgPreview && (
                <div 
                  dangerouslySetInnerHTML={{ __html: svgPreview }} 
                  style={{ width: '100%', height: '100%', transform: 'scale(0.85)', opacity: 0.8 }} 
                />
              )}
            </div>

            {/* Scanning Progress Bar */}
            <div style={{
              width: '100%',
              height: '6px',
              background: 'var(--bg-tertiary)',
              borderRadius: '9999px',
              overflow: 'hidden',
              marginBottom: '16px'
            }}>
              <div style={{
                height: '100%',
                width: `${scanProgress}%`,
                background: 'linear-gradient(90deg, #10b981, #22d3ee)',
                transition: 'width 0.4s ease'
              }} />
            </div>

            <h3 style={{ fontSize: '17px', marginBottom: '6px', color: 'var(--text-primary)' }}>
              {scanStage || 'Đang xử lý hình ảnh...'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Vui lòng đợi trong giây lát...
            </p>
          </div>
        </div>
      )}

      {/* Review & Confirmation Split View (Human-in-the-loop) */}
      {parsedData && !isScanning && (
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '12px 20px',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 color="#34d399" size={20} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#34d399' }}>
                AI đã trích xuất thành công! Bạn có thể kiểm tra và chỉnh sửa nhanh trước khi lưu.
              </span>
            </div>
            <button onClick={resetScanner} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} /> Quét hóa đơn khác
            </button>
          </div>

          <div className="grid-sidebar-main">
            {/* Left Column: Receipt Document View */}
            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '14px' 
              }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  HÌNH ẢNH HÓA ĐƠN
                </span>
                <span style={{ 
                  fontSize: '11px', 
                  padding: '3px 8px', 
                  borderRadius: '4px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  fontFamily: 'var(--font-mono)'
                }}>
                  Độ tin cậy: {Math.round(parsedData.confidence * 100)}%
                </span>
              </div>

              <div style={{
                maxHeight: '520px',
                overflowY: 'auto',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: '#fcfaf2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px'
              }}>
                {imageSrc && (
                  <img 
                    src={imageSrc} 
                    alt="Receipt" 
                    style={{ width: '100%', height: 'auto', borderRadius: '4px' }} 
                  />
                )}
                {svgPreview && (
                  <div 
                    dangerouslySetInnerHTML={{ __html: svgPreview }} 
                    style={{ width: '100%', height: 'auto' }} 
                  />
                )}
              </div>
            </div>

            {/* Right Column: Structured Editable Form */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck color="var(--emerald-400)" size={20} />
                Thông Tin Chi Tiết Giao Dịch
              </h3>

              {/* Merchant & Category */}
              <div className="grid-2col" style={{ marginBottom: '14px' }}>
                <div>
                  <label className="label">
                    <Store size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    Tên cửa hàng / Đơn vị
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={parsedData.merchant || ''}
                    onChange={(e) => updateField('merchant', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">
                    <Tag size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    Danh mục chi tiêu
                  </label>
                  <select
                    className="select"
                    value={parsedData.category || 'other'}
                    onChange={(e) => updateField('category', e.target.value)}
                  >
                    {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => (
                      <option key={key} value={key}>
                        {cat.name} ({cat.englishName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date, Invoice #, Payment */}
              <div className="grid-3col" style={{ marginBottom: '16px' }}>
                <div>
                  <label className="label">
                    <Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    Ngày giao dịch
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={parsedData.date || ''}
                    onChange={(e) => updateField('date', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Số hóa đơn / HĐ</label>
                  <input
                    type="text"
                    className="input"
                    value={parsedData.invoiceNumber || ''}
                    onChange={(e) => updateField('invoiceNumber', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">
                    <CreditCard size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    Hình thức
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={parsedData.paymentMethod || 'Tiền mặt'}
                    onChange={(e) => updateField('paymentMethod', e.target.value)}
                  />
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="label" style={{ margin: 0 }}>
                    <Layers size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    Danh sách món / Sản phẩm đã bóc tách ({parsedData.items?.length || 0})
                  </label>
                  <button type="button" onClick={addItem} className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', fontSize: '12px' }}>
                    <Plus size={12} /> Thêm món
                  </button>
                </div>

                <div style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-tertiary)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '8px 10px' }}>Tên sản phẩm</th>
                        <th style={{ padding: '8px 10px', width: '60px' }}>SL</th>
                        <th style={{ padding: '8px 10px', width: '100px' }}>Đơn giá</th>
                        <th style={{ padding: '8px 10px', width: '110px' }}>Thành tiền</th>
                        <th style={{ padding: '8px 10px', width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.items?.map((item, index) => (
                        <tr key={index} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '6px 10px' }}>
                            <input
                              type="text"
                              className="input"
                              style={{ padding: '4px 8px', fontSize: '13px' }}
                              value={item.name}
                              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            />
                          </td>
                          <td style={{ padding: '6px 10px' }}>
                            <input
                              type="number"
                              className="input"
                              style={{ padding: '4px 8px', fontSize: '13px', textAlign: 'center' }}
                              value={item.quantity}
                              min="1"
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            />
                          </td>
                          <td style={{ padding: '6px 10px' }}>
                            <input
                              type="number"
                              className="input"
                              style={{ padding: '4px 8px', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            />
                          </td>
                          <td style={{ padding: '6px 10px', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>
                            {analyticsService.formatCurrency(item.total)}
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#fb7185',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Calculation Card */}
              <div style={{
                background: 'var(--bg-tertiary)',
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Thuế GTGT (VAT):</span>
                  <input
                    type="number"
                    className="input"
                    style={{ width: '130px', padding: '3px 8px', height: '28px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}
                    value={parsedData.vat || 0}
                    onChange={(e) => updateField('vat', Number(e.target.value) || 0)}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Giảm giá / Voucher:</span>
                  <input
                    type="number"
                    className="input"
                    style={{ width: '130px', padding: '3px 8px', height: '28px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}
                    value={parsedData.discount || 0}
                    onChange={(e) => updateField('discount', Number(e.target.value) || 0)}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <span style={{ fontSize: '16px', fontWeight: '800' }}>TỔNG TIỀN THANH TOÁN:</span>
                  <span style={{
                    fontSize: '22px',
                    fontWeight: '800',
                    color: 'var(--emerald-400)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {analyticsService.formatCurrency(parsedData.total)}
                  </span>
                </div>
              </div>

              {/* Save Button */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={handleSaveTransaction}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1 }}
                >
                  <CheckCircle2 size={18} />
                  <span>Xác nhận & Lưu vào Sổ chi tiêu</span>
                </button>
                <button
                  type="button"
                  onClick={resetScanner}
                  className="btn btn-secondary btn-lg"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Live Camera Viewfinder Modal */}
      {isLiveCameraOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99999,
          background: '#070b14',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingTop: 'max(12px, env(safe-area-inset-top, 12px))',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))'
        }}>
          {/* Top Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            zIndex: 10
          }}>
            <button
              onClick={stopLiveCamera}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={22} />
            </button>

            <div style={{
              fontSize: '14.5px',
              fontWeight: '700',
              color: '#ffffff',
              background: 'rgba(0, 0, 0, 0.6)',
              padding: '6px 16px',
              borderRadius: '9999px',
              backdropFilter: 'blur(10px)',
              letterSpacing: '0.2px'
            }}>
              Căn chỉnh hóa đơn
            </div>

            <button
              onClick={toggleFacingMode}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Đổi camera trước / sau"
            >
              <SwitchCamera size={20} />
            </button>
          </div>

          {/* Viewfinder Window */}
          <div style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            margin: '0 12px',
            borderRadius: '24px'
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />

            {/* Guide overlay */}
            <div style={{
              position: 'absolute',
              width: '84%',
              height: '76%',
              border: '2px solid rgba(16, 185, 129, 0.7)',
              borderRadius: '16px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '12px'
            }}>
              <div className="camera-live-laser" />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '22px', height: '22px', borderTop: '4px solid #10b981', borderLeft: '4px solid #10b981', borderTopLeftRadius: '8px' }} />
                <div style={{ width: '22px', height: '22px', borderTop: '4px solid #10b981', borderRight: '4px solid #10b981', borderTopRightRadius: '8px' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  fontSize: '12px',
                  color: '#ffffff',
                  background: 'rgba(16, 185, 129, 0.9)',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>
                  Giữ hóa đơn phẳng và rõ nét
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '22px', height: '22px', borderBottom: '4px solid #10b981', borderLeft: '4px solid #10b981', borderBottomLeftRadius: '8px' }} />
                <div style={{ width: '22px', height: '22px', borderBottom: '4px solid #10b981', borderRight: '4px solid #10b981', borderBottomRightRadius: '8px' }} />
              </div>
            </div>
          </div>

          {/* Shutter Controls */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%', maxWidth: '340px' }}>
              <button
                onClick={() => {
                  stopLiveCamera();
                  cameraInputRef.current?.click();
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Camera size={20} color="#34d399" />
                <span>Camera máy</span>
              </button>

              <button
                onClick={captureLivePhoto}
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: 'transparent',
                  border: '4px solid #ffffff',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 24px rgba(16, 185, 129, 0.7)'
                }}
              >
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)'
                }} />
              </button>

              <button
                onClick={() => {
                  stopLiveCamera();
                  fileInputRef.current?.click();
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ImageIcon size={20} color="#38bdf8" />
                <span>Thư viện</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}