import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../Auth/AuthContext';
import api from './api';
import { 
  Plus, Search, Clock, Briefcase, Trash2, Edit3, AlertCircle,
  ChevronRight, ChevronLeft // MỚI: Import thêm ChevronLeft cho nút Prev
} from 'lucide-react';
import './JobManager.css';

const JobManager = () => {
  const { user, loading } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);

  // --- STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 8; // Số tin hiển thị trên 1 trang (bạn có thể đổi thành 12, 16...)

  const jobTypeLabels = {
    1: { label: "Toàn thời gian", bgColor: "#ecfdf5", color: "#059669" },
    2: { label: "Bán thời gian", bgColor: "#eff6ff", color: "#2563eb" },
    3: { label: "Thực tập", bgColor: "#faf5ff", color: "#9333ea" },
    4: { label: "Hợp đồng", bgColor: "#fff7ed", color: "#ea580c" },
    5: { label: "Freelance", bgColor: "#fdf2f8", color: "#db2777" },
    7: { label: "Remote", bgColor: "#eef2ff", color: "#4f46e5" },
    8: { label: "Hybrid", bgColor: "#ecfeff", color: "#0891b2" },
  };

  const initialForm = {
    title: '', description: '', requirement: '', benefit: '',
    salaryMin: 0, salaryMax: 0, location: '', jobType: 1,
    experience: 0, expireAt: ''
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (!loading && user) fetchJobs();
  }, [loading, user]);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/CRUDJobPost/my-jobs');
      setJobs(res.data);
    } catch (err) { console.error("Lỗi fetch:", err); }
  };

  // --- LOGIC PHÂN TRANG ---
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob); // Dữ liệu của trang hiện tại
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  // Chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // Nếu xóa tin ở trang cuối làm trang đó rỗng, tự lùi về trang trước
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [jobs.length, currentPage, totalPages]);


  const handleOpenModal = (job = null) => {
    if (job) {
      setCurrentJob(job);
      setFormData({
        title: job.title || '',
        description: job.description || '',
        requirement: job.requirement || '',
        benefit: job.benefit || '',
        salaryMin: job.salaryMin || 0,
        salaryMax: job.salaryMax || 0,
        location: job.location || '',
        jobType: job.jobType || 1,
        experience: job.experience || 0,
        expireAt: job.expireAt ? job.expireAt.split('T')[0] : ''
      });
    } else {
      setCurrentJob(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description || "",
        requirement: formData.requirement || "",
        benefit: formData.benefit || "",
        salaryMin: parseInt(formData.salaryMin) || 0,
        salaryMax: parseInt(formData.salaryMax) || 0,
        location: formData.location,
        jobType: parseInt(formData.jobType),
        experience: parseInt(formData.experience) || 0,
        expireAt: new Date(formData.expireAt).toISOString()
      };

      if (currentJob) {
        await api.put('/CRUDJobPost/update', { ...payload, jobId: currentJob.id });
      } else {
        await api.post('/CRUDJobPost/create', payload);
        setCurrentPage(1); // Tạo tin mới thì nhảy về trang 1
      }
      
      setIsModalOpen(false);
      fetchJobs();
    } catch (err) {
      alert("Lỗi: " + JSON.stringify(err.response?.data || "Server error"));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tin này?")) {
      try {
        await api.delete(`/CRUDJobPost/${id}`);
        fetchJobs();
      } catch (err) { alert("Lỗi khi xóa!"); }
    }
  };

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Đang tải...</div>;

  return (
    <div className="jm-wrapper">
      <div className="jm-container">
        
        {/* HEADER SECTION */}
        <div className="jm-header">
          <div>
            <h1 className="jm-title">
              <Briefcase color="#16a34a" /> Quản Lý Tin Tuyển Dụng
            </h1>
            <p className="jm-subtitle">Bạn đang có {jobs.length} công việc đang đăng tuyển</p>
          </div>
          <button onClick={() => handleOpenModal()} className="jm-btn-add">
            <Plus size={18} /> Đăng tin mới
          </button>
        </div>

        {/* JOB CARDS GRID */}
        <div className="jm-grid">
          {jobs.length === 0 ? (
            <div className="jm-empty">
               <Search size={48} style={{margin: '0 auto 10px', color: '#d1d5db'}} />
               <p>Chưa có tin đăng nào. Hãy tạo tin đầu tiên!</p>
            </div>
          ) : (
            // MỚI: Render mảng currentJobs thay vì mảng jobs
            currentJobs.map(job => (
              <div key={job.id} className="jm-card">
                
                {job.salaryMax > 2000 && <div className="jm-badge-hot">★ HOT</div>}

                <div className="jm-card-top">
                  <div className="jm-logo">
                    {job.title?.charAt(0) || 'J'}
                  </div>
                  <div className="jm-actions">
                    <button onClick={() => handleOpenModal(job)} className="jm-btn-icon edit" title="Sửa">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDelete(job.id)} className="jm-btn-icon delete" title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="jm-job-title">{job.title || "Chưa đặt tên"}</h3>
                <div className="jm-job-company">Công ty đối tác ITLocak</div>

                <div className="jm-tags">
                  <span className="jm-tag">IT Software</span>
                  <span className="jm-tag">{job.location || "Hà Nội"}</span>
                  {jobTypeLabels[job.jobType] && (
                    <span 
                      className="jm-tag" 
                      style={{
                        backgroundColor: jobTypeLabels[job.jobType].bgColor,
                        color: jobTypeLabels[job.jobType].color,
                        fontWeight: 'bold'
                      }}
                    >
                      {jobTypeLabels[job.jobType].label}
                    </span>
                  )}
                </div>

                <div className="jm-card-footer">
                  <span className="jm-salary">
                    ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
                  </span>
                  <div className="jm-date">
                     <Clock size={12} />
                     Hạn: {job.expireAt ? new Date(job.expireAt).toLocaleDateString('vi-VN') : '--/--'}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* MỚI: UI PHÂN TRANG */}
        {totalPages > 1 && (
          <div className="jm-pagination">
            <button onClick={prevPage} disabled={currentPage === 1} className="jm-page-btn">
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`jm-page-btn ${currentPage === index + 1 ? 'active' : ''}`}
              >
                {index + 1}
              </button>
            ))}

            <button onClick={nextPage} disabled={currentPage === totalPages} className="jm-page-btn">
              <ChevronRight size={18} />
            </button>
          </div>
        )}

      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="jm-modal-overlay">
          <form onSubmit={handleSubmit} className="jm-modal">
            
            <div className="jm-modal-header">
               <h2>{currentJob ? 'Sửa tin tuyển dụng' : 'Tạo tin tuyển dụng mới'}</h2>
               <button type="button" onClick={() => setIsModalOpen(false)} className="jm-btn-close">✕</button>
            </div>
            
            <div className="jm-modal-body">
               {/* Cột trái */}
               <div>
                  <div className="jm-form-group">
                    <label className="jm-label">Tiêu đề công việc *</label>
                    <input required className="jm-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  
                  <div className="jm-form-row">
                    <div>
                      <label className="jm-label">Lương từ ($)</label>
                      <input type="number" className="jm-input" value={formData.salaryMin} onChange={e => setFormData({...formData, salaryMin: e.target.value})} />
                    </div>
                    <div>
                      <label className="jm-label">Đến ($)</label>
                      <input type="number" className="jm-input" value={formData.salaryMax} onChange={e => setFormData({...formData, salaryMax: e.target.value})} />
                    </div>
                  </div>

                  <div className="jm-form-group">
                    <label className="jm-label">Địa điểm *</label>
                    <input required className="jm-input" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                  </div>

                  <div className="jm-form-row">
                    <div>
                      <label className="jm-label">Loại hình</label>
                      <select className="jm-select" value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value})}>
                        {Object.entries(jobTypeLabels).map(([v, data]) => <option key={v} value={v}>{data.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="jm-label">Hạn nộp *</label>
                      <input required type="date" className="jm-input" value={formData.expireAt} onChange={e => setFormData({...formData, expireAt: e.target.value})} />
                    </div>
                  </div>
               </div>

               {/* Cột phải */}
               <div>
                  <div className="jm-form-group">
                    <label className="jm-label">Mô tả công việc</label>
                    <textarea className="jm-textarea" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="jm-form-group">
                    <label className="jm-label">Yêu cầu ứng viên</label>
                    <textarea className="jm-textarea" value={formData.requirement} onChange={e => setFormData({...formData, requirement: e.target.value})} />
                  </div>
                  
                  <div className="jm-tip-box">
                    <AlertCircle size={20} style={{minWidth: '20px'}} />
                    <div>Tin đăng có đầy đủ thông tin lương và mô tả chi tiết sẽ nhận được lượng ứng tuyển cao hơn 40%.</div>
                  </div>
               </div>
            </div>

            <div className="jm-modal-footer">
              <button type="button" onClick={() => setIsModalOpen(false)} className="jm-btn-cancel">Hủy</button>
              <button type="submit" className="jm-btn-submit">
                {currentJob ? 'Lưu thay đổi' : 'Đăng ngay'}
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
};

export default JobManager;