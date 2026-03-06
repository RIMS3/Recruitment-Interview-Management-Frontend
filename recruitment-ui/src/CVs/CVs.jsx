import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './CVs.css';
import { AuthContext } from '../Auth/AuthContext'; 

const CVManagement = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  useEffect(() => {
    const fetchMyCVs = async () => {
      try {
        let realCandidateId = user?.candidateId || user?.id;

        // Nếu context rỗng, gọi API lấy ID tương tự trang CVTemplates
        if (!realCandidateId) {
          const profileResponse = await fetch(`https://localhost:7272/api/candidates/me`, {
             headers: { 'Accept': 'application/json' }
          });
          if (profileResponse.ok) {
             const profileData = await profileResponse.json();
             realCandidateId = profileData.id || profileData.candidateId;
          } else {
             setIsLoading(false);
             return; // Dừng lại nếu không lấy được ID
          }
        }

        const response = await fetch(`https://localhost:7272/api/cvs/candidate/${realCandidateId}`);
        
        if (response.ok) {
          const data = await response.json();
          setCvs(data); 
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách CV:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyCVs();
  }, [user]);

  const handleCreateCV = () => {
    navigate('/cv-templates'); 
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
                      src={`https://placehold.co/300x420/f9f9f9/a3a3a3?text=${encodeURIComponent(cv.fullName || "CV")}`} 
                      alt={cv.fullName} 
                    />
                  </Link>
                  <div className="cv-info">
                    <p><b>{cv.fullName || "CV chưa đặt tên"}</b></p>
                    <p style={{fontSize: "12px", color: "gray"}}>{cv.position || "Chưa rõ vị trí"}</p>
                    <p style={{fontSize: "11px", color: "#888", marginTop: "4px"}}>Cập nhật: {formatDate(cv.updatedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="sidebar">
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
        </aside>
      </main>
    </div>
  );
};

export default CVManagement;