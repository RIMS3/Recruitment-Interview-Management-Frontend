import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import './CVTemplates.css';

const CVTemplates = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isCallingApi, setIsCallingApi] = useState(false);

  // --- STATE QUẢN LÝ POPUP ---
  const [popup, setPopup] = useState({
    isOpen: false,
    type: 'alert', // 'alert' hoặc 'error'
    message: ''
  });

  const [templates, setTemplates] = useState([
    { id: 'tpl-1', name: 'Mẫu Sang trọng (Xanh rêu)', imgUrl: 'https://placehold.co/300x420/8c9e82/ffffff?text=Loading...' },
    { id: 'tpl-2', name: 'Mẫu TikTok (Dark Mode)', imgUrl: 'https://placehold.co/300x420/111111/ffffff?text=Loading...' },
    { id: 'tpl-3', name: 'Mẫu Hiện đại (Vàng xám)', imgUrl: 'https://placehold.co/300x420/FDF7E7/333333?text=Loading...' }
  ]);

  // --- HELPER ĐỂ MỞ/ĐÓNG POPUP ---
  const showPopup = (message, type = 'alert') => {
    setPopup({ isOpen: true, message, type });
  };

  const closePopup = () => {
    setPopup({ ...popup, isOpen: false });
  };

  // Tải danh sách ảnh mẫu từ Backend
  useEffect(() => {
    const fetchTemplateImages = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cvs/images`);
        if (response.ok) {
          const imageUrls = await response.json(); 
          setTemplates(prevTemplates => prevTemplates.map((tpl, index) => {
            const matchedUrl = imageUrls.find(url => url.includes(`template${index + 1}.png`)) 
                               || imageUrls[index] 
                               || tpl.imgUrl;
            return { ...tpl, imgUrl: matchedUrl };
          }));
        }
      } catch (error) {
        console.error("Lỗi khi load ảnh templates từ API:", error);
      }
    };
    fetchTemplateImages();
  }, []);

  const handleSelectTemplate = async (templateId) => {
    setIsCallingApi(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        showPopup("⚠️ Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!", "error");
        setIsCallingApi(false);
        return;
      }

      const profileRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cvs/my-candidate-id`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json'
        }
      });

      if (!profileRes.ok) {
        showPopup("⚠️ Không tìm thấy thông tin Ứng viên trên hệ thống!", "error");
        setIsCallingApi(false);
        return;
      }

      const profileData = await profileRes.json();
      const realCandidateId = profileData.candidateId || profileData.id; 

      if (!realCandidateId) {
        showPopup("⚠️ Dữ liệu Ứng viên trả về không hợp lệ!", "error");
        setIsCallingApi(false);
        return;
      }

      const formData = new FormData();
      formData.append('candidateId', realCandidateId); 
      formData.append('fullName', user?.fullName || 'CV chưa đặt tên'); 
      formData.append('position', 'Vị trí ứng tuyển');
      formData.append('email', user?.email || '');
      formData.append('isDefault', 'true');
      formData.append('templateId', templateId); 
      formData.append('phoneNumber', '[BẢN NHÁP]');

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cvs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` 
        },
        body: formData 
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/create-cv/${data.id}`, { state: { selectedTemplate: templateId } });
      } else {
        const errorText = await response.text();
        throw new Error(`Gọi API tạo CV thất bại: ${errorText}`);
      }

    } catch (error) {
      console.error("Lỗi khi xử lý chọn mẫu:", error);
      showPopup("Có lỗi xảy ra khi tạo bản nháp CV. Vui lòng kiểm tra Console (F12).", "error");
    } finally {
      setIsCallingApi(false);
    }
  };

  return (
    <div className="template-container">
      <div className="template-header">
        {/* NÚT QUAY LẠI VÀ BREADCRUMB */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button 
            onClick={() => navigate('/manage-cv')} 
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#f8f9fa', border: '1px solid #e2e8f0', color: '#555',
              cursor: 'pointer', fontSize: '14px', fontWeight: '500', padding: '6px 12px',
              borderRadius: '20px', transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#00b14f'; e.currentTarget.style.borderColor = '#00b14f'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Quay lại
          </button>
          
          <p className="breadcrumb" style={{ margin: 0 }}>Trang chủ {'>'} Mẫu CV tiếng Việt</p>
        </div>
        <h1>Mẫu CV xin việc tiếng Việt chuẩn 2026</h1>
      </div>

      {isCallingApi && <div className="loading-overlay">Đang khởi tạo CV...</div>}

      <div className="template-grid">
        {templates.map(tpl => (
          <div className="template-card" key={tpl.id}>
            <div className="template-img-wrapper">
              <img src={tpl.imgUrl} alt={tpl.name} />
              <div className="template-overlay">
                <button 
                  className="btn-use-template"
                  onClick={() => handleSelectTemplate(tpl.id)}
                  disabled={isCallingApi}
                >
                  Dùng mẫu này
                </button>
              </div>
            </div>
            <p className="template-name">{tpl.name}</p>
          </div>
        ))}
      </div>

      {/* RENDER POPUP */}
      {popup.isOpen && (
        <div className="custom-popup-overlay">
          <div className="custom-popup-box">
            <h4 className="custom-popup-title" style={{ color: popup.type === 'error' ? '#d9534f' : '#333' }}>
              {popup.type === 'error' ? 'Lỗi' : 'Thông báo'}
            </h4>
            <p className="custom-popup-message">{popup.message}</p>
            <div className="custom-popup-actions">
              <button 
                className={`btn-popup-confirm ${popup.type === 'error' ? 'btn-danger' : 'btn-primary'}`}
                onClick={closePopup}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVTemplates;