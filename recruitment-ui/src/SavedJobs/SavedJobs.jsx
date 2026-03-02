import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedJobs, unsaveJob } from '../Services/SavedJobsApi';
import { DEV_BYPASS_LOGIN_TO_SAVE, DEV_CANDIDATE_ID, getCandidateIdFromSession } from '../Services/candidateSession';
import './SavedJobs.css';

const SavedJobs = () => {
  const navigate = useNavigate();
  const candidateId = useMemo(() => {
    if (DEV_BYPASS_LOGIN_TO_SAVE) return DEV_CANDIDATE_ID;
    return getCandidateIdFromSession();
  }, []);
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!candidateId) {
        setLoading(false);
        return;
      }

      try {
        const result = await getSavedJobs(candidateId);
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

  const handleRemove = async (e, jobId) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra thẻ cha (không nhảy trang)
    try {
      await unsaveJob(candidateId, jobId);
      setJobs((prev) => prev.filter((job) => String(job.idJobPost || job.jobId || job.id) !== String(jobId)));
    } catch (error) {
      console.error(error);
      alert(error?.message || 'Không thể bỏ lưu công việc.');
    }
  };

  const handleApply = (e, jobId) => {
    e.stopPropagation(); // Ngăn chặn nhảy trang khi bấm nút ứng tuyển
    // Điều hướng sang trang chi tiết hoặc mở modal ứng tuyển tùy logic của bạn
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
            <button className="btn-primary mt-3" onClick={() => navigate('/joblist')}>
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
                    <h3 className="sj-title">
                      {job.title}
                    </h3>
                    <div className="sj-salary">{salaryText}</div>
                  </div>
                  
                  <div className="sj-company-name">
                    HỆ THỐNG QUẢN LÝ TUYỂN DỤNG RIMS
                  </div>
                  
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
                  <button 
                    className="btn-apply"
                    onClick={(e) => handleApply(e, currentJobId)}
                  >
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