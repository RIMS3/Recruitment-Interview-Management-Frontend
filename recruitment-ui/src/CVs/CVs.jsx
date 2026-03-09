import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './CVs.css';
import { AuthContext } from '../Auth/AuthContext'; 

const CVManagement = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State lưu danh sách ảnh template từ MinIO
  const [templateImages, setTemplateImages] = useState([]);
  // State cho nút Bật/tắt tìm việc
  const [isSearchingJob, setIsSearchingJob] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Hàm dịch mã Mẫu ra Link ảnh Thumbnail
  const getTemplateThumbnail = (templateId) => {
    if (templateImages.length === 0) {
        return 'https://placehold.co/300x420/cccccc/ffffff?text=Loading...';
    }

    // ✅ FIX LỖI: Chuẩn hóa chuỗi để chống lỗi sai chính tả/khoảng trắng từ DB
    const safeId = (templateId || '').toString().trim().toLowerCase();

    switch (safeId) {
        case 'tpl-1': return templateImages[0] || 'https://placehold.co/300x420/8c9e82/ffffff?text=Xanh+Reu'; 
        case 'tpl-2': return templateImages[1] || 'https://placehold.co/300x420/111111/ffffff?text=TikTok+Mode';   
        case 'tpl-3': return templateImages[2] || 'https://placehold.co/300x420/FDF7E7/333333?text=Hien+Dai'; 
        default: return 'https://placehold.co/300x420/cccccc/ffffff?text=CV+Cua+Ban';
    }
  };

  // Gọi API lấy ảnh Template 1 lần duy nhất khi render
  useEffect(() => {
    const fetchTemplateImages = async () => {
      try {
        const response = await fetch('https://localhost:7272/api/cvs/images');
        if (response.ok) {
          const data = await response.json();
          setTemplateImages(data);
        }
      } catch (error) {
        console.error("Lỗi khi tải ảnh template:", error);
      }
    };
    fetchTemplateImages();
  }, []);

  // Gọi API lấy danh sách CV
  useEffect(() => {
    const fetchMyCVs = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        let realCandidateId = user?.candidateId; 

        if (!realCandidateId) {
          const profileResponse = await fetch(`https://localhost:7272/api/cvs/my-candidate-id`, {
             headers: { 
                 'Accept': 'application/json',
                 'Authorization': `Bearer ${token}` 
             }
          });
          
          if (profileResponse.ok) {
             const profileData = await profileResponse.json();
             realCandidateId = profileData.candidateId; 
          } else {
             console.error("Lỗi API my-candidate-id, không thể lấy ID ứng viên");
             setIsLoading(false);
             return; 
          }
        }

        const response = await fetch(`https://localhost:7272/api/cvs/candidate/${realCandidateId}`, {
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

  const handleCreateCV = () => {
    navigate('/cv-templates'); 
  };

  const handleToggleJobSearch = () => {
    setIsSearchingJob(!isSearchingJob);
    // TODO: Có thể gọi API cập nhật trạng thái xuống backend ở đây
  };

  return (
    <div className="topcv-container">
      <div className="banner">
        <span>Hãy chia sẻ nhu cầu công việc để nhận gợi ý việc làm tốt nhất</span>
        <button className="btn-update-job">Cập nhật nhu cầu công việc →</button>
      </div>

      <main className="main-content">
        <section className="cv-section">
          <div className="section-header">
            <h2>CV đã tạo trên hệ thống</h2>
            <button className="btn-create-cv" onClick={handleCreateCV}>
              + Tạo CV mới
            </button>
          </div>

          {isLoading ? (
            <p style={{marginTop: '20px'}}>Đang tải danh sách CV...</p>
          ) : cvs.length === 0 ? (
            <p style={{marginTop: '20px'}}>Bạn chưa có CV nào. Hãy tạo một bản nhé!</p>
          ) : (
            <div className="cv-grid">
              {cvs.map((cv) => (
                <div className="cv-card" key={cv.id}>
                  <Link to={`/create-cv/${cv.id}`} className="cv-image">
                    <img 
                      src={getTemplateThumbnail(cv.templateId)} 
                      alt={cv.fullName || "CV"} 
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  </Link>
                  <div className="cv-info">
                    <p><b>{cv.fullName || "CV chưa đặt tên"}</b></p>
                    <p style={{fontSize: "12px", color: "gray"}}>{cv.position || "Chưa rõ vị trí"}</p>
                    <p style={{fontSize: "11px", color: "#888", marginTop: "4px"}}>
                       Cập nhật: {formatDate(cv.updatedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="sidebar">
          {/* Card Thông tin User */}
          <div className="profile-card box-shadow">
            <div className="profile-info">
              <div className="avatar-lg"></div>
              <div>
                <p className="welcome-text">Chào bạn trở lại,</p>
                <h3>{user ? user.fullName : 'Ứng viên'}</h3>
                <span className="badge-verified">Tài khoản đã xác thực</span>
              </div>
            </div>
          </div>

          {/* Card Bật Tắt Trạng Thái Tìm Việc (Sử dụng CSS bạn đã viết sẵn) */}
          <div className="profile-card box-shadow">
            <div className="toggle-row">
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={isSearchingJob}
                  onChange={handleToggleJobSearch}
                />
                <span className="slider round green"></span>
              </label>
              <span className="toggle-label">Đang tìm việc</span>
            </div>
            <p className="description">
              Bật trạng thái tìm việc để nhận được nhiều cơ hội việc làm tốt nhất từ các nhà tuyển dụng hàng đầu.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default CVManagement;