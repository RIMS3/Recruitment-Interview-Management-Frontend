import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './JobDetails.css';

const JobPostDetails = () => {
    const { id } = useParams(); // Job ID từ URL
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // State lưu trữ candidateId sau khi quy đổi từ userId
    const [candidateId, setCandidateId] = useState(null);

    // State quản lý thông báo (Toast)
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [isError, setIsError] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        
        // Hàm lấy dữ liệu khởi tạo
        const initData = async () => {
            try {
                // 1. Lấy chi tiết công việc
                const jobRes = await fetch(`https://localhost:7272/api/jobs/${id}`);
                const jobData = await jobRes.json();
                setJob(jobData);

                // 2. Nếu có userId, gọi API lấy candidateId
                if (userId) {
                    const candRes = await fetch(`https://localhost:7272/api/application/candidate/${userId}`);
                    const candData = await candRes.json();
                    if (candData.isSuccess) {
                        setCandidateId(candData.candidateId);
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

    // Hàm xử lý ứng tuyển
    const handleApply = async () => {
        // Kiểm tra đăng nhập
        if (!localStorage.getItem("userId")) {
            showNotify(true, "Vui lòng đăng nhập để thực hiện ứng tuyển!");
            return;
        }

        // Kiểm tra xem đã lấy được candidateId chưa
        if (!candidateId) {
            showNotify(true, "Không tìm thấy thông tin ứng viên của bạn!");
            return;
        }

        setIsApplying(true);
        
        const applyPayload = {
            jobId: id, 
            candidateId: candidateId, // Sử dụng ID đã quy đổi
            cvId: "19191919-1919-1919-1919-191919191919" // ID CV mặc định
        };

        try {
            const response = await fetch(`https://localhost:7272/api/application/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applyPayload)
            });

            const result = await response.json();

            // Xử lý payload: { isSuccess, message }
            if (result.isSuccess) {
                showNotify(false, result.message || "Ứng tuyển thành công!");
            } else {
                // Trường hợp đã ứng tuyển hoặc lỗi nghiệp vụ khác
                showNotify(true, result.message);
            }
        } catch (err) {
            showNotify(true, "Có lỗi kết nối xảy ra. Vui lòng thử lại sau!");
        } finally {
            setIsApplying(false);
        }
    };

    // Hàm tiện ích hiển thị thông báo
    const showNotify = (error, msg) => {
        setIsError(error);
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
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
            {/* THÔNG BÁO (TOAST) */}
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
                <Link to="/jobs">IT Phần mềm</Link> <span>/</span> 
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
        </div>
    );
};

export default JobPostDetails;