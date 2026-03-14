import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code'; 
import * as signalR from '@microsoft/signalr';
import './UpgradeCvPro.css';

// Import ảnh
import vnpayLogo from '../img/vnpay.jpg'; 

const UpgradeCvPro = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [packageInfo, setPackageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // Modal thành công mới
  const [paymentResult, setPaymentResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [connection, setConnection] = useState(null);

  const vouchers = [
    { id: 1, code: 'CVPRO50', title: 'Giảm 50% Gói Pro', desc: 'Dành cho 100 khách hàng đầu tiên.' },
    { id: 2, code: 'NEWBIE', title: 'Giảm 20.000₫', desc: 'Tặng riêng cho tài khoản mới.' }
  ];

  // Khởi tạo SignalR
  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7272/paymentHub", {
         accessTokenFactory: () => localStorage.getItem("accessToken")
      })
      .withAutomaticReconnect()
      .build();
    setConnection(newConnection);
    return () => { if (newConnection) newConnection.stop(); };
  }, []);

  // Xử lý sự kiện thanh toán thành công qua SignalR
  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          connection.on("PaidOrder", (message) => {
            // Đóng các modal đang mở
            setIsQRModalOpen(false);
            
            // Hiện Modal thành công giữa màn hình
            setIsSuccessModalOpen(true);

            // Chuyển hướng sau 4 giây để người dùng kịp tận hưởng niềm vui
            setTimeout(() => navigate('/'), 4000);
          });
        })
        .catch(err => console.error("SignalR Connection Error: ", err));
    }
  }, [connection, navigate]);

  // Lấy thông tin gói cước
  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://localhost:7272/api/Cvs/cvpro/24A8F863-35CD-47F1-9FD9-CCBA90CFFDA0');
        setPackageInfo(response.data);
      } catch (error) {
        toast.error('Không thể kết nối đến máy chủ!');
      } finally {
        setLoading(false);
      }
    };
    fetchPackageData();
  }, []);

  const handlePayment = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) { toast.error("Vui lòng đăng nhập!"); return; }

    if (paymentMethod === 'bank') {
      try {
        setIsProcessing(true);
        const response = await axios.post('https://localhost:7272/api/payment', {
          IdUser: userId,
          IdService: packageInfo.idService
        });
        if (response.data.isSuccess) {
          setPaymentResult(response.data);
          setIsQRModalOpen(true);
          toast.success('Đã tạo mã QR thanh toán');
        }
      } catch (error) {
        toast.error('Lỗi khởi tạo thanh toán!');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (loading) return <div className="checkout-container"><div className="loading-spinner">Đang tải gói cước...</div></div>;

  return (
    <div className="checkout-container">
      <div className="mesh-gradient-glow mesh-1"></div>
      <div className="mesh-gradient-glow mesh-2"></div>

      <div className="checkout-header">
        <h2>Nâng Cấp {packageInfo.name} ⭐</h2>
        <p>Mở khóa toàn bộ giới hạn - Nắm bắt mọi cơ hội việc làm</p>
      </div>

      <div className="checkout-grid">
        <div className="checkout-card card-pro">
          <div className="card-glow blob-1"></div>
          <h3><span>💎</span> Chi tiết gói cước</h3>
          <div className="summary-items">
            <div className="summary-item"><span>Tên gói:</span><strong className="text-pro">{packageInfo.name}</strong></div>
            {packageInfo.description?.split('\n').map((item, index) => (
              <div className="summary-item" key={index}><span>Đặc quyền {index + 1}:</span><strong>{item.trim()}</strong></div>
            ))}
            <div className="pkg-divider-dashed"></div>
            <div className="voucher-box" onClick={() => setIsVoucherModalOpen(true)}>
              <span>🎟️ Voucher giảm giá</span>
              <span className="apply-text">CHỌN MÃ &gt;</span>
            </div>
            <div className="summary-total">
              <span className="total-label">Tổng thanh toán:</span>
              <div className="price-group">
                <span className="original-price">{(packageInfo.price * 1.5).toLocaleString()} ₫</span>
                <span className="total-price text-pro">{packageInfo.price.toLocaleString()} ₫</span>
              </div>
            </div>
          </div>
        </div>

        <div className="checkout-card card-payment">
          <div className="card-glow blob-2"></div>
          <h3><span>💳</span> Phương thức thanh toán</h3>
          <div className="payment-options">
            <div className={`payment-option ${paymentMethod === 'bank' ? 'active' : ''}`} onClick={() => setPaymentMethod('bank')}>
              <div className="payment-option-left"><div className="check-circle"></div><span>Chuyển khoản Ngân hàng</span></div>
              <span className="payment-icon">🏦</span>
            </div>
            <div className="payment-option disabled" onClick={() => setIsMaintenanceModalOpen(true)}>
              <div className="payment-option-left"><div className="check-circle"></div><span>VNPay (Bảo trì)</span></div>
              <img src={vnpayLogo} alt="VNPay" className="payment-logo-img" />
            </div>
          </div>
          <button className="btn-pay-now" onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? 'Đang khởi tạo...' : `Thanh toán ${packageInfo.price.toLocaleString()} ₫`}
          </button>
          <button className="btn-cancel" onClick={() => navigate(-1)}>Quay lại</button>
        </div>
      </div>

      {/* MODAL QR */}
      {isQRModalOpen && paymentResult && (
        <div className="voucher-modal-overlay active" onClick={() => setIsQRModalOpen(false)}>
          <div className="maintenance-modal-content qr-modal" onClick={e => e.stopPropagation()}>
            <div className="qr-wrapper">
              <div className="qr-scan-line"></div>
              <div className="qr-frame">
                <QRCode value={paymentResult.orderCode} size={220} />
              </div>
            </div>
            <h3 className="qr-title">Quét mã QR để thanh toán</h3>
            <p className="qr-desc">Dùng ứng dụng Ngân hàng để quét mã</p>
            <div className="qr-info-row">
              <div className="status-dot-pulse"></div>
              <span>Hệ thống đang chờ bạn quét mã...</span>
            </div>
            <button className="btn-understand" style={{marginTop: '20px'}} onClick={() => setIsQRModalOpen(false)}>Hủy bỏ</button>
          </div>
        </div>
      )}

      {/* MODAL THÀNH CÔNG (HIỆU ỨNG TRUNG TÂM) */}
      {isSuccessModalOpen && (
        <div className="success-overlay">
          <div className="success-card">
            {/* Hiệu ứng pháo hoa giấy */}
            <div className="confetti-container">
              {[...Array(15)].map((_, i) => (
                <div key={i} className={`confetti piece-${i % 5}`}></div>
              ))}
            </div>
            
            <div className="success-icon-wrapper">
              <svg className="checkmark" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>

            <div className="success-content">
              <h2>Nâng Cấp Thành Công!</h2>
              <p>Tài khoản của bạn đã được chuyển sang gói <b>PRO</b></p>
              <div className="success-badge">ĐÃ KÍCH HOẠT</div>
            </div>

            <div className="success-footer">
              Đang quay lại trang chủ...
            </div>
          </div>
        </div>
      )}

      {/* MODAL BẢO TRÌ */}
      {isMaintenanceModalOpen && (
        <div className="voucher-modal-overlay active" onClick={() => setIsMaintenanceModalOpen(false)}>
          <div className="maintenance-modal-content">
            <div className="maintenance-icon">🛠️</div>
            <h3>Hệ thống đang bảo trì</h3>
            <p>Vui lòng chọn <b>Chuyển khoản ngân hàng</b></p>
            <button className="btn-understand" onClick={() => setIsMaintenanceModalOpen(false)}>Đồng ý</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpgradeCvPro;