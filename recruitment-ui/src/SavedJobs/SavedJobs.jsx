import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedJobs, unsaveJob } from '../Services/SavedJobsApi';
import { DEV_BYPASS_LOGIN_TO_SAVE, DEV_CANDIDATE_ID } from '../Services/candidateSession';
import { AuthContext } from '../Auth/AuthContext'; 
import './SavedJobs.css';

const SavedJobs = () => {
  const navigate = useNavigate();
  
  // 1. Lấy thông tin user đăng nhập từ AuthContext
  const { user } = useContext(AuthContext);

  // 2. Tự động xác định Candidate ID dựa trên môi trường (Dev bypass hoặc Real user)
  const candidateId = useMemo(() => {
    if (DEV_BYPASS_LOGIN_TO_SAVE) return DEV_CANDIDATE_ID;
    
    // Ưu tiên lấy candidateId từ thông tin đăng nhập
    const currentId = user?.candidateId || user?.id || null;
    console.log("👉 ID dùng để load trang Saved Jobs:", currentId); 
    
    return currentId;
  }, [user]);
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3. Tải danh sách công việc đã lưu từ Backend
  useEffect(() => {
    const fetchData = async () => {
      // Nếu chưa đăng nhập (không có ID), không thực hiện gọi API
      if (!candidateId) {
        setLoading(false);
        return;
      }

      try {
        // Hàm getSavedJobs bên trong đã được cập nhật để dùng VITE_API_BASE_URL
        const result = await getSavedJobs(candidateId);
        
        // Xử lý linh hoạt các kiểu trả về của API (Array trực tiếp hoặc Object chứa data)
        if (Array.isArray(result)) {
          setJobs(result);
        } else if (result && Array.isArray(result.data)) {
          setJobs(result.data);
        } else {
          setJobs([]);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách job đã lưu:', error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [candidateId]);

  // 4. Xử lý bỏ lưu công việc
  const handleRemove = async (e, jobId) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra card cha
    try {
      // Gọi service để xóa bản ghi lưu trữ trên DB
      await unsaveJob(candidateId, jobId);
      // Cập nhật lại UI ngay lập tức bằng cách lọc bỏ job vừa xóa khỏi state
      setJobs((prev) => prev.filter((job) => String(job.idJobPost || job.jobId || job.id) !== String(jobId)));
    } catch (error) {
      console.error(error);
      alert(error?.message || 'Không thể bỏ lưu công việc.');
    }
  };

  const handleApply = (e, jobId) => {
    e.stopPropagation(); 
    navigate(`/jobpostdetail/${jobId}`);
  };

  return (
    <div className="saved-jobs-wrapper">
      <div className="saved-jobs-container">
        <div className="saved-jobs-header">
          <div>
            <h2 className="page-title">Việc làm đã lưu</h2>
            <p className="page-subtitle">Quản lý những cơ hội nghề nghiệp bạn đang quan tâm</p>
          </div>
          <button className="btn-back" onClick={() => navigate('/joblist')}>
            <span className="icon">←</span> Quay lại tìm việc
          </button>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải danh sách công việc...</p>
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>Chưa có việc làm nào được lưu</h3>
            <p>Hãy tiếp tục tìm kiếm và lưu lại những công việc phù hợp với bạn nhé.</p>
            <button className="btn-primary mt-3" onClick={() => navigate('/joblist')} style={{ padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
              Khám phá việc làm ngay
            </button>
          </div>
        )}

        <div className="saved-jobs-list">
          {!loading && jobs.length > 0 && jobs.map((job) => {
            const currentJobId = String(job.idJobPost || job.jobId || job.id);
            const salaryText = job.salaryMin && job.salaryMax 
                ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} $` 
                : 'Thỏa thuận';
            
            return (
              <div 
                className="saved-job-card clickable-card" 
                key={currentJobId}
                onClick={() => navigate(`/jobpostdetail/${currentJobId}`)}
              >
                <div className="sj-logo-box">
                  <img src="https://static.topcv.vn/company_logo/default-company-logo.png" alt="Company Logo" />
                </div>
                
                <div className="sj-content">
                  <div className="sj-header">
                    <h3 className="sj-title">{job.title}</h3>
                    <div className="sj-salary">{salaryText}</div>
                  </div>
                  
                  <div className="sj-company-name">HỆ THỐNG QUẢN LÝ TUYỂN DỤNG RIMS</div>
                  
                  <div className="sj-tags">
                    <span className="sj-tag location">
                      <span className="icon">📍</span> {job.location || 'Chưa cập nhật'}
                    </span>
                    <span className="sj-tag experience">
                      <span className="icon">⏳</span> {job.experience > 0 ? `${job.experience} năm KN` : 'Không yêu cầu KN'}
                    </span>
                  </div>
                </div>

                <div className="sj-actions">
                  <button className="btn-apply" onClick={(e) => handleApply(e, currentJobId)}>
                    Ứng tuyển
                  </button>
                  <button 
                    className="btn-remove" 
                    onClick={(e) => handleRemove(e, currentJobId)}
                    title="Bỏ lưu công việc này"
                  >
                    Bỏ lưu
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SavedJobs;