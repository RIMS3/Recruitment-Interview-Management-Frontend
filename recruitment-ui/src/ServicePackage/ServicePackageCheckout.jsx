import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';
import axios from 'axios';
import './ServicePackageCheckout.css';

// Import Logo
import vnpayLogo from '../img/vnpay.jpg';
import momoLogo from '../img/momo.jpg';

const ServicePackageCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. Lấy thông tin gói dịch vụ từ trang trước truyền sang
  const { selectedPackage } = location.state || {};
  
  // 2. States điều khiển giao diện
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  
  // 3. States xử lý QR Code
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const vouchers = [
    { id: 1, code: 'NEWBIE20', title: 'Giảm 20% phí dịch vụ', desc: 'Dành cho tài khoản mới đăng ký.' },
    { id: 2, code: 'MEGA50', title: 'Giảm 50% sự kiện Mega Sale', desc: 'Chỉ áp dụng cho gói Premium.' }
  ];

  useEffect(() => {
    if (!selectedPackage) {
      navigate('/employer/buy-services');
    }
  }, [selectedPackage, navigate]);

  if (!selectedPackage) return null;

  const handlePaymentMethodChange = (method) => {
    if (method === 'vnpay' || method === 'momo') {
      setIsMaintenanceModalOpen(true);
      setPaymentMethod('bank'); 
    } else {
      setPaymentMethod(method);
    }
  };

  // --- HÀM XỬ LÝ THANH TOÁN ĐÃ CẬP NHẬT ---
  const handlePayment = async () => {
    if (paymentMethod === 'bank') {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId"); // Lấy userId từ localStorage
      
      if (!token || !userId) {
        toast.error("Phiên đăng nhập đã hết hạn hoặc không tìm thấy ID người dùng.");
        return;
      }

      setIsLoading(true);
      try {
        // Payload đúng định dạng yêu cầu
        const payload = {
          IdUser: userId,
          IdService: selectedPackage.id
        };

        const response = await axios.post(
          'https://localhost:7272/api/payment', 
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Xử lý response theo định dạng: { isSuccess, orderCode, message }
        if (response.data.isSuccess) {
          setQrCodeValue(response.data.orderCode); // orderCode dùng để tạo QR
          setIsQRModalOpen(true);
          toast.success('Khởi tạo mã VietQR thành công!');
        } else {
          toast.error(response.data.message || 'Lỗi từ hệ thống thanh toán.');
        }
      } catch (error) {
        console.error("Payment API Error:", error);
        if (error.response?.status === 401) {
          toast.error("Yêu cầu bị từ chối. Vui lòng đăng nhập lại.");
        } else {
          toast.error('Không thể kết nối tới máy chủ thanh toán (localhost:7272).');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="checkout-container">
      <div className="mesh-gradient-glow mesh-1"></div>
      <div className="mesh-gradient-glow mesh-2"></div>

      <div className="checkout-header">
        <h2>Xác Nhận & Thanh Toán An Toàn</h2>
        <p>Vui lòng kiểm tra lại đơn hàng và thực hiện chuyển khoản qua mã QR.</p>
      </div>

      <div className="checkout-grid">
        {/* CỘT 1: CHI TIẾT HÓA ĐƠN */}
        <div className="checkout-card">
          <div className="card-glow blob-1"></div>
          <div className="card-glow blob-2"></div>
          <h3><span>🛒</span> Chi tiết hóa đơn</h3>
          
          <div className="summary-items">
            <div className="summary-item">
              <span>Gói dịch vụ:</span>
              <strong>{selectedPackage.name}</strong>
            </div>
            <div className="summary-item">
              <span>Thời hạn:</span>
              <strong>{selectedPackage.durationDays || 30} ngày</strong>
            </div>
            <div className="summary-item">
              <span>Trạng thái:</span>
              <strong className="text-green">Kích hoạt ngay</strong>
            </div>

            <div className="pkg-divider-dashed"></div>

            <div className="voucher-section">
              <div className="voucher-box" onClick={() => setIsVoucherModalOpen(true)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎟️</span> 
                  <span style={{ fontWeight: '600' }}>Voucher / Mã giảm giá</span>
                </div>
                <span className="apply-text">CHỌN MÃ &gt;</span>
              </div>
            </div>

            <div className="summary-total">
              <span className="total-label">Tổng thanh toán:</span>
              <span className="total-price">{selectedPackage.price?.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>
        </div>

        {/* CỘT 2: PHƯƠNG THỨC THANH TOÁN */}
        <div className="checkout-card">
          <h3><span>💳</span> Phương thức thanh toán</h3>
          
          <div className="payment-options">
            <div className={`payment-option ${paymentMethod === 'vnpay' ? 'active' : ''}`} onClick={() => handlePaymentMethodChange('vnpay')}>
              <div className="payment-option-left"><div className="check-circle"></div><span>VNPay</span></div>
              <img src={vnpayLogo} alt="VNPay" className="payment-logo-img" />
            </div>

            <div className={`payment-option ${paymentMethod === 'momo' ? 'active' : ''}`} onClick={() => handlePaymentMethodChange('momo')}>
              <div className="payment-option-left"><div className="check-circle"></div><span>MoMo</span></div>
              <img src={momoLogo} alt="MoMo" className="payment-logo-img" />
            </div>

            <div className={`payment-option ${paymentMethod === 'bank' ? 'active' : ''}`} onClick={() => handlePaymentMethodChange('bank')}>
              <div className="payment-option-left"><div className="check-circle"></div><span>Chuyển khoản VietQR</span></div>
              <span className="payment-icon">🏦</span>
            </div>
          </div>

          <button 
            className={`btn-pay-now ${isLoading ? 'loading-btn' : ''}`} 
            onClick={handlePayment} 
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : `Thanh toán ngay`}
          </button>
        </div>
      </div>

      {/* MODAL HIỂN THỊ QR CODE */}
      {isQRModalOpen && (
        <div className="voucher-modal-overlay" onClick={() => setIsQRModalOpen(false)}>
          <div className="maintenance-modal-content" onClick={e => e.stopPropagation()}>
            <div className="qr-header">
              <h3 style={{marginBottom: '5px'}}>Mã QR Thanh Toán</h3>
              <p style={{fontSize: '0.85rem', color: '#64748b'}}>Sử dụng ứng dụng Ngân hàng để quét mã VietQR</p>
            </div>
            
            <div style={{ background: 'white', padding: '15px', borderRadius: '15px', display: 'inline-block', margin: '20px 0', border: '1px solid #e2e8f0' }}>
              <QRCode value={qrCodeValue} size={220} level="H" />
            </div>

            <div className="payment-info-mini" style={{textAlign: 'left', background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '20px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                <span>Số tiền:</span>
                <strong style={{color: '#10b981'}}>{selectedPackage.price?.toLocaleString('vi-VN')} ₫</strong>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span>Nội dung:</span>
                <strong style={{color: '#0f172a'}}>Thanh toan {selectedPackage.name}</strong>
              </div>
            </div>

            <button className="btn-understand" onClick={() => setIsQRModalOpen(false)}>
              Tôi đã chuyển khoản thành công
            </button>
          </div>
        </div>
      )}

      {/* MODAL BẢO TRÌ */}
      {isMaintenanceModalOpen && (
        <div className="voucher-modal-overlay" onClick={() => setIsMaintenanceModalOpen(false)}>
          <div className="maintenance-modal-content" onClick={e => e.stopPropagation()}>
            <div className="maintenance-icon">🛠️</div>
            <h3>Hệ thống đang bảo trì</h3>
            <p>Phương thức này hiện đang nâng cấp. Vui lòng sử dụng <strong>Chuyển khoản VietQR</strong>.</p>
            <button className="btn-understand" onClick={() => setIsMaintenanceModalOpen(false)}>Tôi đã hiểu</button>
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
                  <div className="voucher-status-badge">Kém khả dụng</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePackageCheckout;