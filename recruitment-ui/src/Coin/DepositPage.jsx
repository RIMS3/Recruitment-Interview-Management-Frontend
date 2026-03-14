import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import * as signalR from '@microsoft/signalr';
import './DepositPage.css';

const DepositPage = () => {
  const [amount, setAmount] = useState('');
  const [qrString, setQrString] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, pending, success

  const [giftcode, setGiftcode] = useState('');
  const [giftcodeLoading, setGiftcodeLoading] = useState(false);
  const [giftcodeMessage, setGiftcodeMessage] = useState({ text: '', isError: false });

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
        connection.on("PaidOrder", () => {
          setPaymentStatus('success');
          setQrString('');
          setAmount('');
        });
      })
      .catch(err => console.error("SignalR Error: ", err));

    return () => { if (connection) connection.stop(); };
  }, [token]);

  const handleDeposit = async () => {
    if (!amount || Number(amount) < 5000) {
      alert("Số tiền nạp tối thiểu là 5.000đ");
      return;
    }
    setLoading(true);
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
        setPaymentStatus('pending');
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    } finally { setLoading(false); }
  };

  const handleApplyGiftcode = async () => {
    if (!giftcode) return;
    setGiftcodeLoading(true);
    try {
      const response = await fetch('https://localhost:7272/api/refill/gift-code', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ IdUser: userId, Code: giftcode }),
      });
      const data = await response.json();
      setGiftcodeMessage({ text: data.message, isError: !response.ok });
      if(response.ok) setGiftcode('');
    } catch (err) {
      setGiftcodeMessage({ text: "Lỗi kết nối", isError: true });
    } finally { setGiftcodeLoading(false); }
  };

  return (
    <div className="deposit-wrapper">
      {/* HIỆU ỨNG SAO BĂNG NỀN */}
      <div className="star-container">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="shooting-star"></div>
        ))}
      </div>

      {/* MODAL THÔNG BÁO THÀNH CÔNG */}
      {paymentStatus === 'success' && (
        <div className="success-overlay">
          <div className="success-card">
            <div className="checkmark-wrapper">
              <div className="checkmark-circle">
                <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
            <h2>Nạp Tiền Thành Công!</h2>
            <p>Số dư của bạn đã được cập nhật tự động.</p>
            <button className="done-btn" onClick={() => setPaymentStatus('idle')}>Tuyệt vời</button>
          </div>
        </div>
      )}

      <div className="deposit-card">
        <header className="deposit-header">
          <div>
            <h1>Nạp Ngân Lượng</h1>
            <p className="subtitle">Nâng tầm trải nghiệm  - Nạp liền tay vận may sẽ tìm đến !</p>
          </div>
          <div className="user-badge">PTD Corporation</div>
        </header>

        <div className="deposit-body">
          <div className="deposit-column">
            <label className="input-label">Số tiền muốn nạp (VND)</label>
            <input 
              type="number" className="amount-input" 
              value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="Ví dụ: 50,000"
            />
            <div className="quick-amounts-grid">
              {[5000, 10000, 20000, 50000, 100000, 200000].map(val => (
                <button 
                  key={val} className={`amount-chip ${Number(amount) === val ? 'active' : ''}`}
                  onClick={() => setAmount(val)}
                >
                  {val.toLocaleString()}
                </button>
              ))}
            </div>
            <button className="submit-button" onClick={handleDeposit} disabled={loading}>
              {loading ? 'Đang tạo mã...' : 'Tạo mã QR thanh toán'}
            </button>
            <div className="guide-box">
              <p>• Quét mã bằng App Ngân hàng (VietQR).</p>
              <p>• Tiền sẽ vào tài khoản sau 30s - 1 phút.</p>
              <p>• Vui lòng không sửa nội dung chuyển khoản.</p>
            </div>
          </div>

          <div className="deposit-column">
            <div className="qr-preview-box">
              {qrString ? (
                <div className="qr-container animate-fade-in">
                  <div className="qr-wrapper">
                    <QRCodeCanvas value={qrString} size={220} />
                  </div>
                </div>
              ) : (
                <div className="qr-placeholder">
                  <div className="empty-icon">💸</div>
                  <p>Chọn số tiền để hiển thị QR</p>
                </div>
              )}
            </div>

            <div className="giftcode-section">
              <h3 className="gift-title">🎁 Nhập Giftcode</h3>
              <div className="giftcode-input-group">
                <input 
                  className="giftcode-input" value={giftcode}
                  onChange={(e) => setGiftcode(e.target.value.toUpperCase())}
                  placeholder="Gift Code Tân Thủ ..."
                />
                <button className="giftcode-apply-btn" onClick={handleApplyGiftcode} disabled={giftcodeLoading}>
                  {giftcodeLoading ? '...' : 'Áp dụng'}
                </button>
              </div>
              {giftcodeMessage.text && (
                <p className={`gift-msg ${giftcodeMessage.isError ? 'err' : 'ok'}`}>
                  {giftcodeMessage.text}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="footer-marquee">
        <div className="marquee-inner">
          <span className="marquee-text">
        99% người chơi bỏ cuộc ngay trước khi họ chiến thắng | Có thể lần tiếp theo sẽ là của bạn — nạp thêm và tiếp tục chơi ngay!  - Hệ thống nạp tiền VietQR & Giftcode của PTD Corporation luôn sẵn sàng phục vụ bạn!
          </span>
        </div>
      </footer>
    </div>
  );
};

export default DepositPage;