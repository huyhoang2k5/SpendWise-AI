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
  SwitchCamera,
  Utensils,
  ShoppingBag,
  Car,
  GraduationCap,
  Home,
  MoreHorizontal
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { parseInvoiceWithAI } from '../services/geminiService';
import { analyticsService } from '../services/analyticsService';

const CATEGORY_ICONS = {
  food: Utensils,
  shopping: ShoppingBag,
  transport: Car,
  education: GraduationCap,
  living: Home,
  other: MoreHorizontal
};

export default function InvoiceScannerView({ onAddTransaction, apiKey, onNavigateToDashboard }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [svgPreview, setSvgPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [parsedData, setParsedData] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [reviewTab, setReviewTab] = useState('basic'); // 'basic' | 'items'
  const [showReceiptImage, setShowReceiptImage] = useState(false);
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
      {/* Title Header - Desktop Version */}
      <div className="desktop-only-scanner" style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800' }}>
          Quét Hóa Đơn AI
        </h1>
      </div>

      {/* Title Header - Mobile Version */}
      <div className="mobile-only-scanner" style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800' }}>
          Quét Hóa Đơn AI
        </h1>
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
                  <span>Quét lại</span>
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

          {/* MOBILE SCANNER HERO CARD */}
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

              <h2 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>
                Chụp hoặc chọn hóa đơn
              </h2>

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
                  <span>Chụp ảnh</span>
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
                  <span>Chọn từ thư viện</span>
                </button>
              </div>
            </div>
          </div>

          {/* DESKTOP UPLOAD DROPZONE */}
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
              marginBottom: '28px'
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
              Kéo thả hoặc tải ảnh hóa đơn
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
              Hỗ trợ JPG, PNG, WEBP
            </p>
            <div style={{ display: 'inline-flex', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-primary btn-sm"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                <Camera size={16} />
                <span>Chọn ảnh</span>
              </button>
            </div>
          </div>
          </div>

          {/* Minimalist Receipt Guide Tip */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--text-secondary)',
            fontSize: '12.5px'
          }}>
            <Sparkles size={16} color="var(--emerald-400)" style={{ flexShrink: 0 }} />
            <div>
              Hỗ trợ hóa đơn giấy, siêu thị, nhà hàng và ảnh chuyển khoản ngân hàng.
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

      {/* Review & Confirmation (Tối giản, Dễ dùng, Không bị rối) */}
      {parsedData && !isScanning && (
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          {/* Top Hero Summary Card with 1-Tap Save */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))',
            border: '1.5px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 color="#34d399" size={20} />
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#34d399' }}>
                  Kết quả quét
                </span>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {Math.round((parsedData.confidence || 0.95) * 100)}% chính xác
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {(imageSrc || svgPreview) && (
                  <button
                    type="button"
                    onClick={() => setShowReceiptImage(prev => !prev)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                  >
                    <ImageIcon size={14} />
                    <span>{showReceiptImage ? 'Ẩn ảnh' : 'Xem ảnh'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetScanner}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                >
                  <RefreshCw size={14} />
                  <span>Quét lại</span>
                </button>
              </div>
            </div>

            {/* Receipt Image Drawer (Collapsible) */}
            {showReceiptImage && (imageSrc || svgPreview) && (
              <div style={{
                marginBottom: '18px',
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'center',
                maxHeight: '340px',
                overflowY: 'auto'
              }}>
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt="Receipt"
                    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px' }}
                  />
                )}
                {svgPreview && (
                  <div dangerouslySetInnerHTML={{ __html: svgPreview }} style={{ maxHeight: '300px', overflow: 'hidden' }} />
                )}
              </div>
            )}

            {/* Total and Merchant Highlight */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              padding: '16px 20px',
              background: 'var(--bg-secondary)',
              borderRadius: '14px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '18px'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                  Tổng tiền
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: 'var(--emerald-400)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {analyticsService.formatCurrency(parsedData.total)}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {parsedData.merchant || 'Hóa đơn'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>{parsedData.date || 'Hôm nay'}</span>
                  <span>•</span>
                  <span>{EXPENSE_CATEGORIES[parsedData.category]?.name || 'Khác'}</span>
                </div>
              </div>
            </div>

            {/* Primary 1-Tap Save Action */}
            <button
              type="button"
              onClick={handleSaveTransaction}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: '800',
                borderRadius: '12px',
                boxShadow: '0 4px 18px rgba(16, 185, 129, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={19} />
              <span>Lưu chi tiêu</span>
            </button>
          </div>

          {/* Quick Edit Sections (Clean Tabs) */}
          <div className="card" style={{ padding: '20px', borderRadius: '18px' }}>
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '18px',
              gap: '8px'
            }}>
              <button
                type="button"
                onClick={() => setReviewTab('basic')}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '700',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: reviewTab === 'basic' ? '2px solid var(--emerald-400)' : '2px solid transparent',
                  color: reviewTab === 'basic' ? 'var(--emerald-400)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Store size={15} />
                <span>Thông tin</span>
              </button>
              <button
                type="button"
                onClick={() => setReviewTab('items')}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '700',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: reviewTab === 'items' ? '2px solid var(--emerald-400)' : '2px solid transparent',
                  color: reviewTab === 'items' ? 'var(--emerald-400)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Layers size={15} />
                <span>Chi tiết món ({parsedData.items?.length || 0})</span>
              </button>
            </div>

            {/* Tab 1: Thông tin chung */}
            {reviewTab === 'basic' && (
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <label className="label" style={{ fontSize: '12px', marginBottom: '6px' }}>
                    Cửa hàng
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={parsedData.merchant || ''}
                    onChange={(e) => updateField('merchant', e.target.value)}
                    style={{ fontSize: '14px', padding: '9px 12px' }}
                  />
                </div>

                {/* 1-tap category grid */}
                <div style={{ marginBottom: '14px' }}>
                  <label className="label" style={{ fontSize: '12px', marginBottom: '6px' }}>
                    Danh mục
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px'
                  }}>
                    {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => {
                      const isSelected = parsedData.category === key;
                      const IconComponent = CATEGORY_ICONS[key] || MoreHorizontal;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => updateField('category', key)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            padding: '8px 10px',
                            borderRadius: '10px',
                            border: isSelected ? `1.5px solid ${cat.color}` : '1px solid var(--border-subtle)',
                            background: isSelected ? cat.bgColor : 'var(--bg-tertiary)',
                            color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: isSelected ? '700' : '500',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <IconComponent size={15} color={cat.color} style={{ flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cat.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Ngày
                    </label>
                    <input
                      type="date"
                      className="input"
                      value={parsedData.date || ''}
                      onChange={(e) => updateField('date', e.target.value)}
                      style={{ fontSize: '12px', padding: '8px 10px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Thanh toán
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={parsedData.paymentMethod || 'Tiền mặt'}
                      onChange={(e) => updateField('paymentMethod', e.target.value)}
                      style={{ fontSize: '12px', padding: '8px 10px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Mã hóa đơn
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={parsedData.invoiceNumber || ''}
                    onChange={(e) => updateField('invoiceNumber', e.target.value)}
                    placeholder="VD: HD-12345"
                    style={{ fontSize: '12px', padding: '8px 10px' }}
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Chi tiết các món & Thuế/Giảm giá */}
            {reviewTab === 'items' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Danh sách món ({parsedData.items?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 10px', fontSize: '12px' }}
                  >
                    <Plus size={13} /> Thêm món
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {parsedData.items?.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'var(--bg-tertiary)',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <input
                        type="text"
                        className="input"
                        placeholder="Tên món hàng"
                        style={{ flex: 3, minWidth: '130px', padding: '6px 8px', fontSize: '13px' }}
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: '70px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SL:</span>
                        <input
                          type="number"
                          className="input"
                          min="1"
                          style={{ width: '45px', padding: '6px 4px', textAlign: 'center', fontSize: '12px' }}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 2, minWidth: '100px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Giá:</span>
                        <input
                          type="number"
                          className="input"
                          style={{ width: '100%', padding: '6px 6px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        />
                      </div>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: 'var(--emerald-400)',
                        fontFamily: 'var(--font-mono)',
                        minWidth: '80px',
                        textAlign: 'right'
                      }}>
                        {analyticsService.formatCurrency(item.total)}
                      </div>
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
                        title="Xóa món"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* VAT & Discount */}
                <div style={{
                  background: 'var(--bg-tertiary)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Thuế VAT (VNĐ)
                    </label>
                    <input
                      type="number"
                      className="input"
                      style={{ fontSize: '12px', padding: '6px 8px', fontFamily: 'var(--font-mono)' }}
                      value={parsedData.vat || 0}
                      onChange={(e) => updateField('vat', Number(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Giảm giá / Voucher (VNĐ)
                    </label>
                    <input
                      type="number"
                      className="input"
                      style={{ fontSize: '12px', padding: '6px 8px', fontFamily: 'var(--font-mono)' }}
                      value={parsedData.discount || 0}
                      onChange={(e) => updateField('discount', Number(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={resetScanner}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '10px', fontSize: '13px' }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveTransaction}
                className="btn btn-primary"
                style={{ flex: 2, padding: '10px', fontSize: '13px', fontWeight: '700' }}
              >
                <CheckCircle2 size={16} />
                <span>Lưu Giao Dịch</span>
              </button>
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