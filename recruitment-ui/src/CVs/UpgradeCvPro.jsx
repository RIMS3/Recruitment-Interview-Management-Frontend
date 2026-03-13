import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code'; 
import './UpgradeCvPro.css';

// Import ảnh
import vnpayLogo from '../img/vnpay.jpg'; 
import momoLogo from '../img/momo.jpg';

const UpgradeCvPro = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('bank');
  
  // State dữ liệu
  const [packageInfo, setPackageInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // State điều khiển Modal
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  
  // State cho QR Code và Thanh toán
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const vouchers = [
    { id: 1, code: 'CVPRO50', title: 'Giảm 50% Gói Pro', desc: 'Dành cho 100 khách hàng đầu tiên.' },
    { id: 2, code: 'NEWBIE', title: 'Giảm 20.000₫', desc: 'Tặng riêng cho tài khoản mới.' }
  ];

  // 1. Fetch dữ liệu gói cước khi vào trang
  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://localhost:7272/api/Cvs/cvpro/24A8F863-35CD-47F1-9FD9-CCBA90CFFDA0');
        setPackageInfo(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin gói cước:", error);
        toast.error('Không thể kết nối đến máy chủ!');
      } finally {
        setLoading(false);
      }
    };

    fetchPackageData();
  }, []);

  const handlePaymentMethodChange = (method) => {
    if (method === 'vnpay' || method === 'momo') {
      setIsMaintenanceModalOpen(true);
      setPaymentMethod('bank'); 
    } else {
      setPaymentMethod(method);
    }
  };

  // 2. Hàm xử lý thanh toán và Call API
  const handlePayment = async () => {
    // Lấy UserId từ localStorage
    const userId = localStorage.getItem("userId");

    if (!userId) {
      toast.error("Vui lòng đăng nhập để thực hiện thanh toán!");
      return;
    }

    if (paymentMethod === 'bank') {
      try {
        setIsProcessing(true);
        
        // Payload gửi lên API
        const payload = {
          IdUser: userId,
          IdService: packageInfo.idService
        };

        const response = await axios.post('https://localhost:7272/api/payment', payload);

        if (response.data.isSuccess) {
          setPaymentResult(response.data);
          setIsQRModalOpen(true);
          toast.success('Đã tạo mã QR thanh toán!');
        } else {
          toast.error(response.data.message || 'Lỗi tạo giao dịch');
        }
      } catch (error) {
        console.error("Payment API Error:", error);
        toast.error('Không thể kết nối API thanh toán!');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="loading-spinner">Đang tải thông tin gói cước...</div>
      </div>
    );
  }

  if (!packageInfo) {
    return (
      <div className="checkout-container">
        <p>Lỗi: Không tìm thấy dữ liệu gói cước.</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  const descriptionList = packageInfo.description ? packageInfo.description.split('\n') : [];

  return (
    <div className="checkout-container">
      <div className="mesh-gradient-glow mesh-1"></div>
      <div className="mesh-gradient-glow mesh-2"></div>

      <div className="checkout-header">
        <h2>Nâng Cấp {packageInfo.name} ⭐</h2>
        <p>Mở khóa toàn bộ giới hạn - Nắm bắt mọi cơ hội việc làm</p>
      </div>

      <div className="checkout-grid">
        {/* CỘT 1: CHI TIẾT HÓA ĐƠN */}
        <div className="checkout-card">
          <div className="card-glow blob-1"></div>
          <h3><span>💎</span> Chi tiết gói cước</h3>
          <div className="summary-items">
            <div className="summary-item">
              <span>Mã dịch vụ:</span>
              <strong style={{fontSize: '11px', color: '#64748b'}}>{packageInfo.idService}</strong>
            </div>
            <div className="summary-item">
              <span>Tên gói:</span>
              <strong className="text-pro">{packageInfo.name}</strong>
            </div>
            
            {descriptionList.map((item, index) => (
              <div className="summary-item" key={index}>
                <span>Đặc quyền {index + 1}:</span>
                <strong>{item.trim()}</strong>
              </div>
            ))}

            <div className="summary-item">
              <span>Thời hạn:</span>
              <strong className="text-green">Mãi mãi (Mua 1 lần)</strong>
            </div>

            <div className="pkg-divider-dashed"></div>

            <div className="voucher-section">
              <div className="voucher-box" onClick={() => setIsVoucherModalOpen(true)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎟️</span> 
                  <span style={{ fontWeight: '600' }}>Voucher giảm giá</span>
                </div>
                <span className="apply-text">CHỌN MÃ &gt;</span>
              </div>
            </div>

            <div className="summary-total">
              <span className="total-label">Tổng thanh toán:</span>
              <div className="price-group">
                <span className="original-price">{(packageInfo.price * 1.5).toLocaleString('vi-VN')} ₫</span>
                <span className="total-price text-pro">{packageInfo.price.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT 2: PHƯƠNG THỨC THANH TOÁN */}
        <div className="checkout-card">
          <div className="card-glow blob-2"></div>
          <h3><span>💳</span> Phương thức thanh toán</h3>
          
          <div className="payment-options">
            <div className={`payment-option ${paymentMethod === 'vnpay' ? 'active' : ''}`} onClick={() => handlePaymentMethodChange('vnpay')}>
              <div className="payment-option-left">
                <div className="check-circle"></div>
                <span>Cổng thanh toán VNPay</span>
              </div>
              <img src={vnpayLogo} alt="VNPay" className="payment-logo-img" />
            </div>

            <div className={`payment-option ${paymentMethod === 'momo' ? 'active' : ''}`} onClick={() => handlePaymentMethodChange('momo')}>
              <div className="payment-option-left">
                <div className="check-circle"></div>
                <span>Ví điện tử MoMo</span>
              </div>
              <img src={momoLogo} alt="MoMo" className="payment-logo-img" />
            </div>

            <div className={`payment-option ${paymentMethod === 'bank' ? 'active' : ''}`} onClick={() => handlePaymentMethodChange('bank')}>
              <div className="payment-option-left">
                <div className="check-circle"></div>
                <span>Chuyển khoản Ngân hàng</span>
              </div>
              <span className="payment-icon">🏦</span>
            </div>
          </div>

          <button 
            className="btn-pay-now" 
            onClick={handlePayment} 
            disabled={isProcessing}
          >
            {isProcessing ? 'Đang khởi tạo...' : `Thanh toán ${packageInfo.price.toLocaleString('vi-VN')} ₫`}
          </button>
          
          <button className="btn-cancel" onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>

      {/* MODAL HIỂN THỊ MÃ QR */}
      {isQRModalOpen && paymentResult && (
        <div className="voucher-modal-overlay" onClick={() => setIsQRModalOpen(false)}>
          <div className="maintenance-modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', display: 'inline-block', marginBottom: '15px', border: '1px solid #eee' }}>
              <QRCode 
                value={paymentResult.orderCode} 
                size={220}
                viewBox={`0 0 256 256`}
              />
            </div>
            <h3 style={{color: '#10b981', marginBottom: '5px'}}>Quét mã QR qua App Ngân hàng</h3>
            <p style={{fontSize: '14px', color: '#64748b'}}>Hệ thống sẽ tự động kích hoạt gói ngay sau khi nhận được thanh toán.</p>
            
            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <button className="btn-understand" onClick={() => setIsQRModalOpen(false)}>Tôi đã thanh toán</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VOUCHER */}
      {isVoucherModalOpen && (
        <div className="voucher-modal-overlay" onClick={() => setIsVoucherModalOpen(false)}>
          <div className="voucher-modal-content" onClick={e => e.stopPropagation()}>
            <div className="voucher-modal-header">
              <h3>Chọn Voucher</h3>
              <button className="close-btn" onClick={() => setIsVoucherModalOpen(false)}>×</button>
            </div>
            <div className="voucher-list">
              {vouchers.map(v => (
                <div className="voucher-item-ineligible" key={v.id}>
                  <div className="voucher-info">
                    <h4>{v.title}</h4>
                    <p>{v.desc}</p>
                    <span className="voucher-code">{v.code}</span>
                  </div>
                  <div className="voucher-status-badge">Không đủ điều kiện</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL BẢO TRÌ */}
      {isMaintenanceModalOpen && (
        <div className="voucher-modal-overlay" onClick={() => setIsMaintenanceModalOpen(false)}>
          <div className="maintenance-modal-content" onClick={e => e.stopPropagation()}>
            <div className="maintenance-icon">🛠️</div>
            <h3>Hệ thống đang bảo trì</h3>
            <p>Vui lòng chọn <strong>Chuyển khoản ngân hàng</strong> để thanh toán trực tiếp qua mã QR.</p>
            <button className="btn-understand" onClick={() => setIsMaintenanceModalOpen(false)}>Đồng ý</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpgradeCvPro;