import React, { useState } from 'react';
import './DepositPage.css'; // Đảm bảo bạn đã dán đoạn CSS mới vào file này nhé

const DepositPage = () => {
  const [giftcode, setGiftcode] = useState('');
  const [giftcodeLoading, setGiftcodeLoading] = useState(false);
  const [giftcodeMessage, setGiftcodeMessage] = useState({ text: '', isError: false });

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("accessToken");

  const handleApplyGiftcode = async () => {
    if (!giftcode) {
      setGiftcodeMessage({ text: "Vui lòng nhập mã quà tặng", isError: true });
      return;
    }
    
    setGiftcodeLoading(true);
    setGiftcodeMessage({ text: '', isError: false });

    try {
      const response = await fetch('https://itlocak.xyz/api/refill/gift-code', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ IdUser: userId, Code: giftcode }),
      });
      
      const data = await response.json();
      setGiftcodeMessage({ text: data.message || "Xử lý thành công", isError: !response.ok });
      
      if(response.ok) setGiftcode('');
    } catch (err) {
      setGiftcodeMessage({ text: "Lỗi kết nối máy chủ", isError: true });
    } finally {
      setGiftcodeLoading(false);
    }
  };

  return (
    <div className="deposit-wrapper">
      {/* HIỆU ỨNG SAO BĂNG NỀN */}
      <div className="star-container">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="shooting-star"></div>
        ))}
      </div>

      <div className="gift-card-only">
        <header className="deposit-header">
          <div className="header-content">
            <h1>🎁 Đổi Giftcode</h1>
            <p className="subtitle">Nhập mã ưu đãi để nhận ngay Ngân Lượng</p>
          </div>
          <div className="user-badge">PTD Corp</div>
        </header>

        <div className="gift-body-centered">
          <div className="input-section">
            <label className="input-label">Mã Code (Voucher)</label>
            <input 
              className="gift-input-field" 
              value={giftcode}
              onChange={(e) => setGiftcode(e.target.value.toUpperCase())}
              placeholder="VÍ DỤ: 2HONDAICONDON"
            />
          </div>

          <button 
            className="submit-button" 
            onClick={handleApplyGiftcode} 
            disabled={giftcodeLoading}
          >
            {giftcodeLoading ? 'ĐANG KIỂM TRA...' : 'ÁP DỤNG NGAY'}
          </button>

          {giftcodeMessage.text && (
            <div className={`gift-status-msg ${giftcodeMessage.isError ? 'err' : 'ok'}`}>
              {giftcodeMessage.isError ? '❌ ' : '✅ '} {giftcodeMessage.text}
            </div>
          )}

          <div className="guide-box">
            <p>• Mã code chỉ có giá trị sử dụng một lần duy nhất.</p>
            <p>• Hãy chắc chắn rằng bạn nhập đúng các ký tự.</p>
            <p>• Phần thưởng sẽ được cộng trực tiếp vào số dư.</p>
             <p>• Nếu có vấn đề xảy ra, vui lòng liên hệ Admin Phạm Trung Đức</p>
          </div>
        </div>
      </div>

      {/* ĐÃ SỬA CLASS Ở ĐÂY ĐỂ TRÁNH XUNG ĐỘT MARQUEE */}
      <footer className="deposit-wrapper-footer-marquee">
        <div className="marquee-inner">
          <span className="marquee-text">
            Hệ thống nạp Giftcode PTD Corporation luôn sẵn sàng phục vụ bạn! - Chúc bạn chơi game vui vẻ!
          </span>
        </div>
      </footer>
    </div>
  );
};

export default DepositPage;