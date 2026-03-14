import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import * as signalR from '@microsoft/signalr';
import './DepositPage.css';

const DepositPage = () => {
  const [amount, setAmount] = useState('');
  const [qrString, setQrString] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle | pending | success

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7272/paymentHub", {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        console.log("Connected to SignalR Hub");
        connection.on("PaidOrder", (message) => {
          console.log("Server notification:", message);
          setPaymentStatus('success'); // Kích hoạt hiệu ứng thành công
          setQrString('');
        });
      })
      .catch(err => console.error("SignalR Connection Error: ", err));

    return () => {
      if (connection) connection.stop();
    };
  }, [token]);

  const handleDeposit = async () => {
    if (!userId) {
      setError("Không tìm thấy thông tin người dùng.");
      return;
    }
    if (!amount || Number(amount) < 5000) {
      alert("Số tiền nạp tối thiểu là 5.000đ");
      return;
    }

    setLoading(true);
    setError(null);
    setPaymentStatus('pending');

    try {
      const response = await fetch('https://localhost:7272/api/refill', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ IdUser: userId, amount: amount.toString() }),
      });

      const data = await response.json();
      if (data.isSuccess) {
        setQrString(data.qrCode);
      } else {
        setError(data.message || "Có lỗi xảy ra.");
        setPaymentStatus('idle');
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ.");
      setPaymentStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deposit-wrapper">
      {/* HIỆU ỨNG SUCCESS OVERLAY */}
      {paymentStatus === 'success' && (
        <div className="success-overlay">
          <div className="success-checkmark-container">
            <div className="check-icon">
              <span className="icon-line line-tip"></span>
              <span className="icon-line line-long"></span>
              <div className="icon-circle"></div>
              <div className="icon-fix"></div>
            </div>
            <h2>Nạp tiền thành công!</h2>
            <p>Hệ thống đã cập nhật số dư của bạn.</p>
            <button className="done-btn" onClick={() => setPaymentStatus('idle')}>
              Tuyệt vời
            </button>
          </div>
        </div>
      )}

      {/* Hiệu ứng Sao Băng */}
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>

      <div className="deposit-card">
        <header className="deposit-header">
          <div className="header-content">
            <h1>Nạp Tiền Hệ Thống</h1>
            <p>Thanh toán an toàn qua cổng VietQR</p>
          </div>
          <div className="user-badge">PTD Corporation</div>
        </header>

        <div className="deposit-body">
          <div className="deposit-column form-column">
            <div className="input-group">
              <label>Số tiền muốn nạp (VND)</label>
              <input 
                type="number" 
                className="amount-input"
                placeholder="Ví dụ: 50000" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="quick-amounts-grid">
                {[5000, 20000, 50000, 100000, 200000, 500000].map(val => (
                  <button 
                    key={val} 
                    className={`amount-chip ${Number(amount) === val ? 'active' : ''}`}
                    onClick={() => setAmount(val)}
                  >
                    {val.toLocaleString()}đ
                  </button>
                ))}
              </div>
            </div>

            <button 
              className={`submit-button ${loading ? 'is-loading' : ''}`} 
              onClick={handleDeposit}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Tạo mã QR thanh toán'}
            </button>

            {error && <div className="error-message">{error}</div>}

            <div className="guide-box">
              <h3>Hướng dẫn:</h3>
              <ul>
                <li>Quét mã QR bằng ứng dụng ngân hàng.</li>
                <li>Hệ thống tự động duyệt sau khi nhận tiền.</li>
              </ul>
            </div>
          </div>

          <div className="deposit-column qr-column">
            <div className="qr-preview-box">
              {qrString ? (
                <div className="qr-result animate-fade-in">
                  <div className="qr-wrapper">
                    <QRCodeCanvas value={qrString} size={240} level="H" />
                  </div>
                  <div className="qr-status-info">
                    <div className="dot-flashing"></div>
                    <span>Đang chờ thanh toán...</span>
                  </div>
                </div>
              ) : (
                <div className="qr-placeholder">
                  <div className="placeholder-icon">🏦</div>
                  <p>Chọn mệnh giá để tạo mã</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="marquee-container footer-marquee">
        <div className="marquee-inner">
          <span className="marquee-text">⚠️ Nạp tiền tự động 24/7 • Bảo mật tuyệt đối • Hỗ trợ trực tuyến • </span>
          <span className="marquee-text">⚠️ Nạp tiền tự động 24/7 • Bảo mật tuyệt đối • Hỗ trợ trực tuyến • </span>
        </div>
      </div>
    </div>
  );
};

export default DepositPage;