import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './CVs.css';
import { AuthContext } from '../Auth/AuthContext'; 

import Template1 from './Templates/Template1';
import Template2 from './Templates/Template2';
import Template3 from './Templates/Template3';

// =========================================================================
// COMPONENT CON: RENDER CV THẬT VÀ THU NHỎ LẠI (LIVE PREVIEW)
// =========================================================================
const CVThumbnail = ({ cvSummary }) => {
  const [fullCvData, setFullCvData] = useState(null);
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(0.3); 

  useEffect(() => {
    const fetchFullCv = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cvs/${cvSummary.id}/editor`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setFullCvData(data);
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết CV preview", error);
      }
    };
    fetchFullCv();
  }, [cvSummary.id]);

  useEffect(() => {
    const updateScale = () => {
      if (wrapperRef.current) {
        const cardWidth = wrapperRef.current.offsetWidth;
        setScale(cardWidth / 794);
      }
    };
    
    setTimeout(updateScale, 50); 
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const renderTemplate = () => {
    if (!fullCvData) return (
      <div className="preview-loading">
        <div className="spinner"></div>
        <span>Đang tải CV...</span>
      </div>
    );
    
    const noop = () => {};
    const props = { 
      cvData: fullCvData, 
      handleTextChange: noop, 
      handleArrayChange: noop, 
      onAvatarClick: noop 
    };

    switch (cvSummary.templateId) {
      case 'tpl-1': return <Template1 {...props} />;
      case 'tpl-2': return <Template2 {...props} />;
      case 'tpl-3': return <Template3 {...props} />;
      default: return <Template1 {...props} />;
    }
  };

  return (
    <div className="cv-preview-wrapper" ref={wrapperRef}>
      <div className="cv-preview-scaler" style={{ transform: `scale(${scale})` }}>
        {renderTemplate()}
      </div>
    </div>
  );
};

// =========================================================================
// COMPONENT CHÍNH: QUẢN LÝ CV (MANAGE CV)
// =========================================================================
const CVManagement = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchingJob, setIsSearchingJob] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  useEffect(() => {
    const fetchMyCVs = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        let realCandidateId = user?.candidateId; 

        if (!realCandidateId) {
          const profileResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cvs/my-candidate-id`, {
             headers: { 
                 'Accept': 'application/json',
                 'Authorization': `Bearer ${token}` 
             }
          });
          
          if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              realCandidateId = profileData.candidateId; 
          } else {
              setIsLoading(false);
              return; 
          }
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cvs/candidate/${realCandidateId}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCvs(data); 
        }
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyCVs();
  }, [user]);

  const handleCreateCV = () => navigate('/cv-templates'); 
  const handleToggleJobSearch = () => setIsSearchingJob(!isSearchingJob);

  // Lấy chữ cái đầu của tên làm Avatar
  const getInitial = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  // =========================================================================
  // XỬ LÝ XÓA CV
  // =========================================================================
  const handleDeleteCV = async (cvId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản CV này không? Hành động này không thể hoàn tác.")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cvs/${cvId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "Xóa CV thành công!");
        
        // Cập nhật state để loại bỏ CV vừa xóa khỏi giao diện
        setCvs((prevCvs) => prevCvs.filter((cv) => cv.id !== cvId));
      } else {
        alert("Có lỗi xảy ra khi xóa CV. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Lỗi gọi API xóa CV:", error);
      alert("Không thể kết nối đến máy chủ.");
    }
  };

  return (
    <div className="topcv-container">
      {/* BANNER GỢI Ý VIỆC LÀM */}
      <div className="banner-wrapper">
        <div className="banner">
          <div className="banner-content">
            <span className="banner-icon">💡</span>
            <span>Hãy chia sẻ nhu cầu công việc để nhận gợi ý việc làm tốt nhất và phù hợp nhất với bạn.</span>
          </div>
          <button className="btn-update-job">Cập nhật nhu cầu →</button>
        </div>
      </div>

      <main className="main-content">
        <section className="cv-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">CV đã tạo trên hệ thống</h2>
              <p className="section-subtitle">Quản lý và chỉnh sửa các bản CV của bạn</p>
            </div>
            <button className="btn-create-cv" onClick={handleCreateCV}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Tạo CV mới
            </button>
          </div>

          {isLoading ? (
            <div className="empty-state">
               <div className="spinner-large"></div>
               <p>Đang tải danh sách CV của bạn...</p>
            </div>
          ) : cvs.length === 0 ? (
            <div className="empty-state">
              <img src="https://cdn-icons-png.flaticon.com/512/7486/7486747.png" alt="Empty CV" className="empty-img" />
              <h3>Bạn chưa có bản CV nào</h3>
              <p>Hãy tạo ngay một bản CV chuyên nghiệp để gây ấn tượng với nhà tuyển dụng nhé!</p>
              <button className="btn-create-cv mt-3" onClick={handleCreateCV}>Tạo CV ngay</button>
            </div>
          ) : (
            <div className="cv-grid">
              {cvs.map((cv) => (
                <div className="cv-card" key={cv.id}>
                  <Link to={`/create-cv/${cv.id}`} className="cv-image-link">
                    <CVThumbnail cvSummary={cv} />
                    {/* Hiệu ứng lớp phủ khi Hover */}
                    <div className="cv-hover-overlay">
                      <span className="edit-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Chỉnh sửa CV
                      </span>
                    </div>
                  </Link>
                  <div className="cv-info">
                    <h3 className="cv-title" title={cv.fullName || "CV chưa đặt tên"}>
                      {cv.fullName || "CV chưa đặt tên"}
                    </h3>
                    <p className="cv-position">{cv.position || "Chưa cập nhật vị trí ứng tuyển"}</p>
                    <div className="cv-meta">
                      <span className="cv-date">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Cập nhật: {formatDate(cv.updatedAt)}
                      </span>
                      
                      {/* NÚT XÓA CV */}
                      <button 
                        className="btn-delete-cv" 
                        onClick={() => handleDeleteCV(cv.id)}
                        title="Xóa CV này"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="sidebar">
          <div className="profile-card box-shadow">
            <div className="profile-info">
              <div className="avatar-lg">
                {getInitial(user?.fullName)}
              </div>
              <div className="profile-text">
                <p className="welcome-text">Chào mừng trở lại,</p>
                <h3 className="profile-name">{user ? user.fullName : 'Ứng viên'}</h3>
                <span className="badge-verified">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Tài khoản xác thực
                </span>
              </div>
            </div>
          </div>

          <div className="status-card box-shadow">
            <div className="toggle-row">
              <div className="toggle-text-group">
                <span className="toggle-label">Trạng thái tìm việc</span>
                <span className={`status-badge ${isSearchingJob ? 'active' : ''}`}>
                  {isSearchingJob ? 'Đang bật' : 'Đang tắt'}
                </span>
              </div>
              <label className="switch">
                <input type="checkbox" checked={isSearchingJob} onChange={handleToggleJobSearch} />
                <span className="slider round green"></span>
              </label>
            </div>
            <div className="divider"></div>
            <p className="description">
              Bật trạng thái tìm việc để nhận được nhiều cơ hội việc làm tốt nhất từ các nhà tuyển dụng hàng đầu trên hệ thống.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default CVManagement;