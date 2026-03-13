import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './UpgradeCvPro.css'; // Dùng file CSS mới

// Thay đường dẫn ảnh cho đúng với cấu trúc thư mục của bạn
import vnpayLogo from '../img/vnpay.jpg'; 
import momoLogo from '../img/momo.jpg';

const UpgradeCvPro = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('bank');
  
  // State điều khiển Modal
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  // Hardcode thông tin gói CV Pro
  const packageInfo = {
    name: "Gói CV Pro (Vĩnh viễn)",
    price: 99000, // 99k 
    originalPrice: 200000,
  };

  const vouchers = [
    { id: 1, code: 'CVPRO50', title: 'Giảm 50% Gói Pro', desc: 'Dành cho 100 khách hàng đầu tiên trong tháng.' },
    { id: 2, code: 'NEWBIE', title: 'Giảm 20.000₫', desc: 'Tặng riêng cho tài khoản mới đăng ký.' }
  ];

  // Logic click phương thức thanh toán
  const handlePaymentMethodChange = (method) => {
    if (method === 'vnpay' || method === 'momo') {
      setIsMaintenanceModalOpen(true);
      setPaymentMethod('bank'); // Ép state về lại Chuyển khoản ngân hàng
    } else {
      setPaymentMethod(method);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'bank') {
      toast.success('Đang tạo mã QR thanh toán...');
      // TODO: Call API tạo giao dịch thanh toán ở đây
      // navigate('/payment-qr-page'); 
    }
  };

  return (
    <div className="checkout-container">
      {/* Hiệu ứng nền màu Gradient */}
      <div className="mesh-gradient-glow mesh-1"></div>
      <div className="mesh-gradient-glow mesh-2"></div>

      <div className="checkout-header">
        <h2>Nâng Cấp Tài Khoản CV Pro ⭐</h2>
        <p>Mở khóa toàn bộ giới hạn - Nắm bắt mọi cơ hội việc làm</p>
      </div>

      <div className="checkout-grid">
        {/* CỘT 1: THÔNG TIN GÓI & LỢI ÍCH */}
        <div className="checkout-card">
          <div className="card-glow blob-1"></div>
          
          <h3><span>💎</span> Chi tiết gói cước</h3>
          
          <div className="summary-items">
            <div className="summary-item">
              <span>Gói dịch vụ:</span>
              <strong className="text-pro">{packageInfo.name}</strong>
            </div>
            <div className="summary-item">
              <span>Đặc quyền 1:</span>
              <strong>Tạo CV không giới hạn số lượng</strong>
            </div>
            <div className="summary-item">
              <span>Đặc quyền 2:</span>
              <strong>Mở khóa tất cả Template Cao Cấp</strong>
            </div>
            <div className="summary-item">
              <span>Đặc quyền 3:</span>
              <strong>Tải PDF chất lượng cao, không Watermark</strong>
            </div>
            <div className="summary-item">
              <span>Thời hạn:</span>
              <strong className="text-green">Mãi mãi (Mua 1 lần)</strong>
            </div>

            <div className="pkg-divider-dashed"></div>

            <div className="voucher-section">
              <div className="voucher-box" onClick={() => setIsVoucherModalOpen(true)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🎟️</span> 
                  <span style={{ fontWeight: '600', color: '#334155' }}>Voucher / Mã giảm giá</span>
                </div>
                <span className="apply-text">CHỌN HOẶC NHẬP MÃ &gt;</span>
              </div>
            </div>

            <div className="summary-total">
              <span className="total-label">Tổng thanh toán:</span>
              <div className="price-group">
                <span className="original-price">{packageInfo.originalPrice.toLocaleString('vi-VN')} ₫</span>
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
            {/* VNPay */}
            <div 
              className={`payment-option ${paymentMethod === 'vnpay' ? 'active' : ''}`}
              onClick={() => handlePaymentMethodChange('vnpay')}
            >
              <div className="payment-option-left">
                <div className="check-circle"></div>
                <span>Cổng thanh toán VNPay</span>
              </div>
              <img src={vnpayLogo} alt="VNPay" className="payment-logo-img" />
            </div>

            {/* MoMo */}
            <div 
              className={`payment-option ${paymentMethod === 'momo' ? 'active' : ''}`}
              onClick={() => handlePaymentMethodChange('momo')}
            >
              <div className="payment-option-left">
                <div className="check-circle"></div>
                <span>Ví điện tử MoMo</span>
              </div>
              <img src={momoLogo} alt="MoMo" className="payment-logo-img" />
            </div>

            {/* Bank Transfer */}
            <div 
              className={`payment-option ${paymentMethod === 'bank' ? 'active' : ''}`}
              onClick={() => handlePaymentMethodChange('bank')}
            >
              <div className="payment-option-left">
                <div className="check-circle"></div>
                <span>Chuyển khoản Ngân hàng</span>
              </div>
              <span className="payment-icon">🏦</span>
            </div>
          </div>

          <button className="btn-pay-now" onClick={handlePayment}>
            Thanh toán {packageInfo.price.toLocaleString('vi-VN')} ₫
          </button>
          <button className="btn-cancel" onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>

      {/* MODAL VOUCHER */}
      {isVoucherModalOpen && (
        <div className="voucher-modal-overlay" onClick={() => setIsVoucherModalOpen(false)}>
          <div className="voucher-modal-content" onClick={e => e.stopPropagation()}>
            <div className="voucher-modal-header">
              <h3>Chọn Voucher Tuyển Dụng</h3>
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
                  <div className="voucher-status-badge">
                    Không thỏa mãn
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL BẢO TRÌ NGHỆ THUẬT */}
      {isMaintenanceModalOpen && (
        <div className="voucher-modal-overlay" onClick={() => setIsMaintenanceModalOpen(false)}>
          <div className="maintenance-modal-content" onClick={e => e.stopPropagation()}>
            <div className="maintenance-icon">🛠️</div>
            <h3>Hệ thống đang bảo trì</h3>
            <p>
              Cổng thanh toán điện tử hiện đang được nâng cấp để phục vụ bạn tốt hơn. Vui lòng chọn <strong>Chuyển khoản ngân hàng</strong> để tiếp tục giao dịch.
            </p>
            <button className="btn-understand" onClick={() => setIsMaintenanceModalOpen(false)}>
              Tôi đã hiểu
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default UpgradeCvPro;