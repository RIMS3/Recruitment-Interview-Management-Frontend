import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import './JobDetails.css';

const JobPostDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [candidateId, setCandidateId] = useState(null);

    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [isError, setIsError] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        if (!id || id === 'undefined') {
            setLoading(false);
            return;
        }

        const userId = localStorage.getItem("userId");
        const initData = async () => {
            try {
                // 1. Lấy thông tin công việc
                const jobRes = await fetch(`https://localhost:7272/api/jobs/${id}`);
                const jobData = await jobRes.json();
                setJob(jobData);

                // 2. Lấy candidateId dựa trên userId (RIMS logic)
                if (userId) {
                    const candRes = await fetch(`https://localhost:7272/api/Application/candidate/${userId}`);
                    if (candRes.ok) {
                        const candData = await candRes.json();
                        if (candData.candidateId) {
                            setCandidateId(candData.candidateId);
                            // Lưu vào local để ListAppliedJobs có thể dùng
                            localStorage.setItem("candidateId", candData.candidateId);
                        }
                    }
                }
            } catch (err) {
                console.error("Lỗi khởi tạo:", err);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [id]);

    const handleApply = async () => {
        // Kiểm tra đăng nhập
        if (!localStorage.getItem("userId")) {
            showNotify(true, "Vui lòng đăng nhập để thực hiện ứng tuyển!");
            return;
        }
        if (!candidateId) {
            showNotify(true, "Không tìm thấy thông tin ứng viên của bạn!");
            return;
        }

        setIsApplying(true);

        try {
            // KIỂM TRA HOẶC TẠO CV TỰ ĐỘNG
            let currentCvId = localStorage.getItem("cvId");

            if (!currentCvId || currentCvId === "undefined" || currentCvId === "null") {
                console.log("Đang tạo CV mới bằng FormData [FromForm]...");
                
                const cvFormData = new FormData();
                cvFormData.append("CandidateId", candidateId);
                
                // Cần khớp với CreateCvRequestDto ở Backend (Họ tên, Tiêu đề...)
                cvFormData.append("Title", "Hồ sơ ứng tuyển mặc định");
                // Giả lập FullName để tránh lỗi Validation "Họ tên không..."
                cvFormData.append("FullName", "Ứng viên RIMS"); 

                const cvResponse = await fetch(`https://localhost:7272/api/Cvs`, {
                    method: 'POST',
                    body: cvFormData 
                    // Lưu ý: Không set Content-Type header cho FormData
                });

                // XỬ LÝ LỖI VALIDATION (TRÁNH LỖI Unexpected token 'H')
                const contentType = cvResponse.headers.get("content-type");
                let cvResult;

                if (contentType && contentType.includes("application/json")) {
                    cvResult = await cvResponse.json();
                } else {
                    // Nếu Backend trả về text thuần (ví dụ: "Họ tên không được trống")
                    const errorText = await cvResponse.text();
                    throw new Error(errorText || "Lỗi dữ liệu đầu vào khi tạo CV.");
                }

                if (cvResponse.ok && cvResult.id) {
                    currentCvId = cvResult.id;
                    localStorage.setItem("cvId", currentCvId);
                } else {
                    throw new Error(cvResult.message || "Tạo CV thất bại.");
                }
            }

            // THỰC HIỆN ỨNG TUYỂN
            const applyPayload = {
                jobId: id, 
                candidateId: candidateId,
                cvId: currentCvId
            };

            const response = await fetch(`https://localhost:7272/api/Application/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applyPayload)
            });

            const result = await response.json();
            
            if (result.isSuccess) {
                showNotify(false, result.message || "Ứng tuyển thành công!");
            } else {
                showNotify(true, result.message || "Ứng tuyển thất bại.");
            }

        } catch (err) {
            console.error("Lỗi quá trình xử lý:", err);
            showNotify(true, err.message);
        } finally {
            setIsApplying(false);
        }
    };

    const showNotify = (error, msg) => {
        setIsError(error);
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3500);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Đang cập nhật";
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const renderExperience = (exp) => {
        if (exp === 0) return "Không yêu cầu kinh nghiệm";
        return exp ? `${exp} năm kinh nghiệm` : "Chưa cập nhật";
    };

    if (loading) return <div className="status-msg">Đang tải dữ liệu công việc...</div>;
    if (!job) return <div className="status-msg">Không tìm thấy thông tin công việc.</div>;

    return (
        <div className="job-page-wrapper">
            {showToast && (
                <div className={`custom-toast ${isError ? 'toast-error' : ''}`}>
                    <span className="toast-icon">{isError ? '⚠️' : '✅'}</span>
                    <div className="toast-content">
                        <strong>{isError ? 'Thông báo' : 'Thành công!'}</strong>
                        <p>{toastMsg}</p>
                    </div>
                </div>
            )}

            <nav className="job-breadcrumb">
                <Link to="/">Việc làm</Link> <span>/</span> 
                <Link to="/joblist">IT Phần mềm</Link> <span>/</span> 
                {job.title}
            </nav>

            <div className="job-container-layout">
                <div className="job-main-column">
                    <div className="job-header-card">
                        <h1 className="job-main-title">{job.title}</h1>
                        <div className="job-stats-container">
                            <div className="stat-box">
                                <div className="stat-icon">💵</div>
                                <div className="stat-info">
                                    <span className="stat-label">Mức lương</span>
                                    <span className="stat-value">
                                        {job.salaryMin?.toLocaleString()} - {job.salaryMax?.toLocaleString()} USD
                                    </span>
                                </div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-icon">📍</div>
                                <div className="stat-info">
                                    <span className="stat-label">Địa điểm</span>
                                    <span className="stat-value">{job.location}</span>
                                </div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-icon">⏳</div>
                                <div className="stat-info">
                                    <span className="stat-label">Kinh nghiệm</span>
                                    <span className="stat-value">{renderExperience(job.experience)}</span>
                                </div>
                            </div>
                        </div>
                        <p className="job-deadline">Hạn nộp hồ sơ: {formatDate(job.expireAt)}</p>
                        <div className="job-actions">
                            <button className="btn-apply-now" onClick={handleApply} disabled={isApplying}>
                                {isApplying ? "Đang xử lý..." : "Ứng tuyển ngay"}
                            </button>
                            <button className="btn-save-job">♡ Lưu tin</button>
                        </div>
                    </div>

                    <div className="job-content-card">
                        <h2 className="content-heading">Chi tiết tin tuyển dụng</h2>
                        <div className="description-section">
                            <h3>Mô tả công việc</h3>
                            <div className="desc-text">{job.description || "Chưa có mô tả."}</div>
                        </div>
                        <div className="description-section">
                            <h3>Yêu cầu ứng viên</h3>
                            <div className="desc-text">{job.requirement || "Chưa có yêu cầu."}</div>
                        </div>
                        <div className="description-section">
                            <h3>Quyền lợi</h3>
                            <div className="desc-text">{job.benefit || "Theo chính sách công ty."}</div>
                        </div>
                    </div>
                </div>

                <div className="job-sidebar-column">
                    <div className="company-card-right">
                        <div className="company-header-flex">
                            <div className="company-logo-img">
                                {job.company?.logoUrl ? <img src={job.company.logoUrl} alt="logo" /> : "LOGO"}
                            </div>
                            <div className="company-name-box">
                                <h4>{job.company?.name}</h4>
                                <span className="pro-label">Pro Company</span>
                            </div>
                        </div>
                        <p>📍 {job.company?.address}</p>
                        <a href={`https://${job.company?.website}`} target="_blank" rel="noreferrer" className="view-company-link">
                            Xem trang công ty ↗
                        </a>
                    </div>
                </div>
            </div>

            <button 
                className="floating-back-btn" 
                title="Quay lại danh sách"
                onClick={() => navigate('/joblist')}
            >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#00b14f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            <button 
                className="floating-user-add-btn" 
                title="Danh sách ứng tuyển"
                onClick={() => navigate('/applied-jobs')}
            >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 12C9.21 12 11 10.21 11 8C11 5.79 9.21 4 7 4C4.79 4 3 5.79 3 8C3 10.21 4.79 12 7 12ZM7 14C4.33 14 0 15.34 0 18V20H14V18C14 15.34 9.67 14 7 14Z" fill="#00b14f"/>
                    <path d="M21 9V6H19V9H16V11H19V14H21V11H24V9H21Z" fill="#00b14f"/>
                </svg>
            </button>
        </div>
    );
};

export default JobPostDetails;