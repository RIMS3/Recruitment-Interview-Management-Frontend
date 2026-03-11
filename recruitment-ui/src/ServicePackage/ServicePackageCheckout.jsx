import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './ServicePackageCheckout.css';

// Import Logo thật
import vnpayLogo from '../img/vnpay.jpg';
import momoLogo from '../img/momo.jpg';

const ServicePackageCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { selectedPackage } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState('bank');
  
  // State điều khiển Modal
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false); // Modal Bảo trì mới

  const vouchers = [
    { id: 1, code: 'NEWBIE20', title: 'Giảm 20% phí dịch vụ', desc: 'Dành cho tài khoản mới đăng ký.' },
    { id: 2, code: 'MEGA50', title: 'Giảm 50% sự kiện Mega Sale', desc: 'Chỉ áp dụng cho gói Premium (Gói cao cấp nhất).' },
    { id: 3, code: 'FLASH70', title: 'Giảm 70% Flash Sale', desc: 'Đã hết lượt sử dụng.' },
    { id: 4, code: 'MINUS500K', title: 'Giảm thẳng 500.000₫', desc: 'Áp dụng cho đơn hàng tối thiểu 5.000.000₫.' }
  ];

  if (!selectedPackage) {
    navigate('/employer/buy-services');
    return null;
  }

  // Cập nhật logic click phương thức thanh toán
  const handlePaymentMethodChange = (method) => {
    if (method === 'vnpay' || method === 'momo') {
      // Mở modal bảo trì ở giữa màn hình thay vì dùng toast
      setIsMaintenanceModalOpen(true);
      setPaymentMethod('bank'); // Ép state về lại Chuyển khoản ngân hàng
    } else {
      setPaymentMethod(method);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'bank') {
      toast.success('Giao dịch đang chờ xử lý. Tính năng chuyển khoản ngân hàng sẽ sớm ra mắt!');
    }
  };

  return (
    <div className="checkout-container">
      <div className="mesh-gradient-glow mesh-1"></div>
      <div className="mesh-gradient-glow mesh-2"></div>

      <div className="checkout-header">
        <h2>Xác Nhận & Thanh Toán An Toàn</h2>
        <p>Vui lòng kiểm tra lại thông tin đơn hàng và chọn phương thức thanh toán phù hợp.</p>
      </div>

      <div className="checkout-grid">
        {/* CỘT 1: HÓA ĐƠN & VOUCHER (Giữ nguyên như bản sửa lỗi trước của bạn) */}
        <div className="checkout-card">
          <div className="card-glow blob-1 loader-in-list"></div>
          <div className="card-glow blob-2"></div>

          <h3><span>🛒</span> Chi tiết hóa đơn</h3>
          
          <div className="summary-items">
            <div className="summary-item">
              <span>Gói dịch vụ:</span>
              <strong>{selectedPackage.name}</strong>
            </div>
            <div className="summary-item">
              <span>Thời hạn:</span>
              <strong>{selectedPackage.durationDays} ngày</strong>
            </div>
            <div className="summary-item">
              <span>Hạn mức bài đăng:</span>
              <strong>{selectedPackage.maxPost} bài</strong>
            </div>
            <div className="summary-item">
              <span>Trạng thái:</span>
              <strong className="text-green">Kích hoạt ngay lập tức</strong>
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
              <span className="total-price">{selectedPackage.price?.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>
        </div>

        {/* CỘT 2: PHƯƠNG THỨC THANH TOÁN (Giao diện mới không radio) */}
        <div className="checkout-card">
          <div className="card-glow blob-1 loader-in-list"></div>
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
            Thanh toán {selectedPackage.price?.toLocaleString('vi-VN')} ₫
          </button>
        </div>
      </div>

      {/* MODAL VOUCHER (Giữ nguyên) */}
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

      {/* MODAL BẢO TRÌ NGHỆ THUẬT (THÊM MỚI Ở ĐÂY) */}
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

export default ServicePackageCheckout;