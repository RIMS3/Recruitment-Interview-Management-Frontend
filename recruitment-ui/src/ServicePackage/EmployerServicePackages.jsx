import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './EmployerServicePackages.css';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/ServicePackages`;

const EmployerServicePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    fetchActivePackages();
  }, []);

  const fetchActivePackages = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const activePackages = data.filter(pkg => pkg.isActive === true);
      setPackages(activePackages);
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Không thể tải danh sách gói dịch vụ!");
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = (pkg) => {
    toast.success(`Đang xử lý giao dịch cho: ${pkg.name}`);
  };

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h2 className="gradient-heading">Nâng Tầm Tuyển Dụng</h2>
        <p>Chọn gói dịch vụ phù hợp để mở khóa sức mạnh kết nối ứng viên tài năng.</p>
      </div>

      {loading ? (
        <div className="loader">Đang tải các tinh hoa...</div>
      ) : packages.length === 0 ? (
        <p>Hiện tại chưa có gói dịch vụ nào được mở bán.</p>
      ) : (
        <div className="pricing-grid">
          {packages.map((pkg) => (
            <div className="pricing-card" key={pkg.id}>
              {/* Vầng sáng nghệ thuật trang trí góc thẻ */}
              <div className="card-glow blob-1"></div>
              <div className="card-glow blob-2"></div>

              {/* Nội dung chính đặt đè lên trên */}
              <div className="card-content">
                <h3 className="pkg-name">{pkg.name}</h3>
                <div className="pkg-price-wrapper">
                  <span className="pkg-price">{pkg.price?.toLocaleString('vi-VN')}</span>
                  <span className="pkg-currency">VNĐ</span>
                </div>
                
                <div className="pkg-divider"></div>

                <ul className="pkg-features">
                  <li>
                    <span className="check-icon">✨</span>
                    <div>Thời hạn: <strong>{pkg.durationDays} ngày</strong></div>
                  </li>
                  <li>
                    <span className="check-icon">✨</span>
                    <div>Tối đa: <strong>{pkg.maxPost} bài đăng</strong></div>
                  </li>
                  {pkg.description && (
                    <li>
                      <span className="check-icon">✨</span>
                      <div>{pkg.description}</div>
                    </li>
                  )}
                </ul>

                <div className="pkg-actions">
                  <button className="btn-buy" onClick={() => handleBuy(pkg)}>Sở hữu ngay</button>
                  <button className="btn-details" onClick={() => setSelectedPackage(pkg)}>Khám phá chi tiết</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Giữ nguyên */}
      {selectedPackage && (
        <div className="detail-modal-overlay" onClick={() => setSelectedPackage(null)}>
          <div className="detail-modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.5rem', color: '#111827', marginBottom: '1rem' }}>{selectedPackage.name}</h3>
            <p><strong>Mô tả:</strong> {selectedPackage.description || "Không có mô tả chi tiết."}</p>
            <p style={{marginTop: '0.5rem'}}><strong>Giá:</strong> <span style={{color: '#10b981', fontWeight: 'bold'}}>{selectedPackage.price?.toLocaleString('vi-VN')} VNĐ</span></p>
            <p style={{marginTop: '0.5rem'}}><strong>Thời gian:</strong> {selectedPackage.durationDays} ngày</p>
            <p style={{marginTop: '0.5rem'}}><strong>Hạn mức:</strong> {selectedPackage.maxPost} bài đăng</p>
            
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="detail-modal-close" onClick={() => setSelectedPackage(null)}>Đóng lại</button>
              <button className="btn-buy" style={{width: 'auto', margin: 0}} onClick={() => handleBuy(selectedPackage)}>Sở hữu ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerServicePackages;