import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../Auth/AuthContext';
import api from './api';
import { 
  Plus, Search, Clock, Briefcase, Trash2, Edit3, AlertCircle,
  ChevronRight, ChevronLeft, Award 
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify'; 
import Swal from 'sweetalert2'; 
import 'react-toastify/dist/ReactToastify.css'; 
import './JobManager.css';

// DANH SÁCH 63 TỈNH THÀNH VIỆT NAM
const VIETNAM_PROVINCES = [
  "Hà Nội", "Cao Bằng", "Lạng Sơn", "Quảng Ninh", "Hải Phòng",
  "Thái Nguyên", "Phú Thọ", "Lào Cai", "Sơn La", "Hòa Bình",
  "Hưng Yên", "Thái Bình", "Ninh Bình", "Thanh Hóa", "Nghệ An",
  "Hà Tĩnh", "Quảng Bình", "Quảng Trị", "Huế", "Đà Nẵng",
  "Quảng Ngãi", "Bình Định", "Khánh Hòa", "Đắk Lắk", "Lâm Đồng",
  "Bình Phước", "TP. Hồ Chí Minh", "Đồng Nai", "Tây Ninh",
  "Cần Thơ", "An Giang", "Đồng Tháp", "Cà Mau", "Kiên Giang"
];

// DANH SÁCH OPTION KINH NGHIỆM
const EXPERIENCE_OPTIONS = [
  { value: 0, label: "Chưa có kinh nghiệm" },
  { value: 1, label: "1 năm" },
  { value: 2, label: "2 năm" },
  { value: 3, label: "3 năm" },
  { value: 4, label: "Trên 4 năm" },
];

const JobManager = () => {
  const { user, loading } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);

  // --- STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 8; 

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
    } catch (err) { 
      console.error("Lỗi fetch:", err);
      toast.error("Không thể tải danh sách tin tuyển dụng!"); 
    }
  };

  // --- LOGIC PHÂN TRANG ---
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob); 
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

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

    // --- VALIDATE TRƯỚC KHI GỬI ---
    if (Number(formData.salaryMin) > Number(formData.salaryMax)) {
      return toast.warning("Lương tối thiểu không được lớn hơn lương tối đa!"); 
    }

    const selectedDate = new Date(formData.expireAt);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (selectedDate <= today) {
      return toast.warning("Hạn nộp phải là một ngày trong tương lai!"); 
    }

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
        toast.success("Cập nhật tin tuyển dụng thành công!"); 
      } else {
        await api.post('/CRUDJobPost/create', payload);
        toast.success("Tạo tin tuyển dụng mới thành công!"); 
        setCurrentPage(1); 
      }

      setIsModalOpen(false);
      fetchJobs();
    } catch (err) {
      const serverError = err.response?.data;
      toast.error(typeof serverError === 'string' ? serverError : "Có lỗi xảy ra, vui lòng thử lại!"); 
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Tin tuyển dụng này sẽ bị xóa vĩnh viễn!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#16a34a', 
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy bỏ',
      customClass: {
        confirmButton: 'swal-btn-soft', 
        cancelButton: 'swal-btn-soft'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/CRUDJobPost/${id}`);
          toast.success("Đã xóa tin tuyển dụng thành công!"); 
          fetchJobs();
        } catch (err) { 
          toast.error("Lỗi khi xóa tin tuyển dụng!"); 
        }
      }
    });
  };

  if (loading) return <div className="jm-loading">Đang tải dữ liệu...</div>;

  return (
    <div className="jm-wrapper">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

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
                  <span className="jm-tag">{job.location || "Toàn quốc"}</span>

                  {/* TAG KINH NGHIỆM TRÊN CARD */}
                  <span className="jm-tag jm-tag-exp">
                    <Award size={12} style={{marginRight: '4px'}} />
                    {job.experience === 0 ? "Chưa có kinh nghiệm" : 
                     job.experience === 4 ? "Trên 4 năm KN" : 
                     `${job.experience} năm KN`}
                  </span>

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

        {/* PHÂN TRANG */}
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

                {/* --- SẮP XẾP LẠI THỨ TỰ: LOẠI HÌNH -> KINH NGHIỆM -> ĐỊA ĐIỂM --- */}
                <div className="jm-form-group">
                  <label className="jm-label">Loại hình</label>
                  <select className="jm-select" value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value})}>
                    {Object.entries(jobTypeLabels).map(([v, data]) => <option key={v} value={v}>{data.label}</option>)}
                  </select>
                </div>

                <div className="jm-form-group">
                  <label className="jm-label">Kinh nghiệm yêu cầu</label>
                  <select 
                    className="jm-select" 
                    value={formData.experience} 
                    onChange={e => setFormData({...formData, experience: e.target.value})}
                  >
                    {EXPERIENCE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="jm-form-group">
                  <label className="jm-label">Địa điểm *</label>
                  <select 
                    required 
                    className="jm-select" 
                    value={formData.location} 
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  >
                    <option value="">-- Chọn địa điểm --</option>
                    {VIETNAM_PROVINCES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="jm-form-group">
                  <label className="jm-label">Hạn nộp *</label>
                  <input required type="date" className="jm-input" value={formData.expireAt} onChange={e => setFormData({...formData, expireAt: e.target.value})} />
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
                  <div>Tin đăng có đầy đủ thông tin lương và kinh nghiệm rõ ràng sẽ nhận được lượng ứng tuyển cao hơn 40%.</div>
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