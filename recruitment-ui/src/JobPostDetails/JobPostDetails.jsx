import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSavedJobIds, toggleSavedJob } from '../Services/SavedJobsApi';
import { DEV_BYPASS_LOGIN_TO_SAVE, DEV_CANDIDATE_ID } from '../Services/candidateSession';
import { AuthContext } from '../Auth/AuthContext';
import './JobDetails.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const JobPostDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // 1. Lấy thông tin user từ AuthContext
    const { user } = useContext(AuthContext);

    // 2. Xác định candidateId – đồng bộ với logic trong JobList
    const candidateId = useMemo(() => {
        if (DEV_BYPASS_LOGIN_TO_SAVE) return DEV_CANDIDATE_ID;
        const currentId = user?.candidateId || user?.id || null;
        console.log("👉 ID Ứng viên hiện tại trong JobPostDetails:", currentId);
        return currentId;
    }, [user]);

    // State dữ liệu công việc
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);

    // State lưu tin
    const [savedJobIds, setSavedJobIds] = useState(new Set());
    const [savingMap, setSavingMap] = useState({});

    // State ứng viên (để ứng tuyển)
    const [applyingCandidateId, setApplyingCandidateId] = useState(null);

    // State Toast thông báo
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [isError, setIsError] = useState(false);

    // 3. Load danh sách job đã lưu khi trang mở (hoặc khi candidateId thay đổi)
    const fetchSavedIds = useCallback(async () => {
        if (!candidateId) return;
        try {
            const ids = await getSavedJobIds(candidateId);
            setSavedJobIds(new Set(ids.map(String)));
        } catch (err) {
            console.error('Lỗi lấy danh sách job đã lưu:', err);
        }
    }, [candidateId]);

    useEffect(() => {
        fetchSavedIds();
    }, [fetchSavedIds]);

    // 4. Load chi tiết công việc và thông tin ứng viên
    useEffect(() => {
        if (!id || id === 'undefined') {
            setLoading(false);
            return;
        }

        const userId = localStorage.getItem('userId');
        const initData = async () => {
            try {
                const jobRes = await fetch(`${API_BASE_URL}/jobs/${id}`);
                const jobData = await jobRes.json();
                setJob(jobData);

                if (userId) {
                    const candRes = await fetch(`${API_BASE_URL}/Application/candidate/${userId}`);
                    if (candRes.ok) {
                        const candData = await candRes.json();
                        if (candData.candidateId) {
                            setApplyingCandidateId(candData.candidateId);
                            localStorage.setItem('candidateId', candData.candidateId);
                        }
                    }
                }
            } catch (err) {
                console.error('Lỗi khởi tạo dữ liệu:', err);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [id]);

    // 5. Xử lý Toggle Lưu tin – đồng bộ hoàn toàn với JobList
    const handleToggleSavedJob = useCallback(async () => {
        if (!candidateId) {
            showNotify(true, 'Bạn cần đăng nhập để lưu tin tuyển dụng.');
            return;
        }

        const jobId = String(id);
        if (savingMap[jobId]) return; // chống spam click

        setSavingMap(prev => ({ ...prev, [jobId]: true }));

        try {
            const result = await toggleSavedJob(candidateId, jobId);
            setSavedJobIds(prev => {
                const next = new Set(prev);
                if (result.saved) next.add(jobId);
                else next.delete(jobId);
                return next;
            });
        } catch (err) {
            console.error('Lỗi toggle lưu tin:', err);
            showNotify(true, err?.message || 'Không thể cập nhật trạng thái lưu tin.');
        } finally {
            setSavingMap(prev => ({ ...prev, [jobId]: false }));
        }
    }, [candidateId, id, savingMap]);

    // 6. Xử lý Ứng tuyển
    const handleApply = async () => {
        if (!localStorage.getItem('userId')) {
            showNotify(true, 'Vui lòng đăng nhập để thực hiện ứng tuyển!');
            return;
        }
        if (!applyingCandidateId) {
            showNotify(true, 'Không tìm thấy thông tin ứng viên của bạn!');
            return;
        }

        setIsApplying(true);

        try {
            let currentCvId = localStorage.getItem('cvId');

            if (!currentCvId || currentCvId === 'undefined' || currentCvId === 'null') {
                const cvFormData = new FormData();
                cvFormData.append('CandidateId', applyingCandidateId);
                cvFormData.append('Title', 'Hồ sơ ứng tuyển mặc định');
                cvFormData.append('FullName', 'Ứng viên RIMS');

                const cvResponse = await fetch(`${API_BASE_URL}/Cvs`, {
                    method: 'POST',
                    body: cvFormData
                });

                const contentType = cvResponse.headers.get('content-type');
                let cvResult;

                if (contentType && contentType.includes('application/json')) {
                    cvResult = await cvResponse.json();
                } else {
                    const errorText = await cvResponse.text();
                    throw new Error(errorText || 'Lỗi khi tạo hồ sơ mặc định.');
                }

                if (cvResponse.ok && cvResult.id) {
                    currentCvId = cvResult.id;
                    localStorage.setItem('cvId', currentCvId);
                } else {
                    throw new Error(cvResult.message || 'Tạo CV thất bại.');
                }
            }

            const applyPayload = {
                jobId: id,
                candidateId: applyingCandidateId,
                cvId: currentCvId
            };

            const response = await fetch(`${API_BASE_URL}/Application/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applyPayload)
            });

            const result = await response.json();

            if (result.isSuccess) {
                showNotify(false, result.message || 'Ứng tuyển thành công!');
            } else {
                showNotify(true, result.message || 'Bạn đã ứng tuyển công việc này rồi.');
            }
        } catch (err) {
            console.error('Lỗi xử lý ứng tuyển:', err);
            showNotify(true, err.message);
        } finally {
            setIsApplying(false);
        }
    };

    // Helpers
    const showNotify = (error, msg) => {
        setIsError(error);
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3500);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Đang cập nhật';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const renderExperience = (exp) => {
        if (exp === 0) return 'Không yêu cầu kinh nghiệm';
        return exp ? `${exp} năm kinh nghiệm` : 'Chưa cập nhật';
    };

    // Tính trạng thái lưu của job hiện tại
    const jobId = String(id);
    const isSaved = savedJobIds.has(jobId);
    const isSaving = !!savingMap[jobId];

    if (loading) return <div className="status-msg">Đang tải dữ liệu công việc...</div>;
    if (!job) return <div className="status-msg">Không tìm thấy thông tin công việc.</div>;

    return (
        <div className="job-page-wrapper">
            {/* Toast thông báo */}
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

                        {/* Nút hành động */}
                        <div className="job-actions">
                            <button
                                className="btn-apply-now"
                                onClick={handleApply}
                                disabled={isApplying}
                            >
                                {isApplying ? 'Đang xử lý...' : 'Ứng tuyển ngay'}
                            </button>
                            <button
                                className={`btn-save-job ${isSaved ? 'saved' : ''}`}
                                onClick={handleToggleSavedJob}
                                disabled={isSaving}
                                title={isSaved ? 'Bỏ lưu tin' : 'Lưu tin'}
                            >
                                {isSaving ? '...' : isSaved ? '❤ Đã lưu' : '♡ Lưu tin'}
                            </button>
                        </div>
                    </div>

                    <div className="job-content-card">
                        <h2 className="content-heading">Chi tiết tin tuyển dụng</h2>
                        <div className="description-section">
                            <h3>Mô tả công việc</h3>
                            <div className="desc-text">{job.description || 'Chưa có mô tả.'}</div>
                        </div>
                        <div className="description-section">
                            <h3>Yêu cầu ứng viên</h3>
                            <div className="desc-text">{job.requirement || 'Chưa có yêu cầu.'}</div>
                        </div>
                        <div className="description-section">
                            <h3>Quyền lợi</h3>
                            <div className="desc-text">{job.benefit || 'Theo chính sách công ty.'}</div>
                        </div>
                    </div>
                </div>

                <div className="job-sidebar-column">
                    <div className="company-card-right">
                        <div className="company-header-flex">
                            <div className="company-logo-img">
                                {job.company?.logoUrl ? (
                                    <img src={job.company.logoUrl} alt="logo" />
                                ) : (
                                    <div className="logo-placeholder">LOGO</div>
                                )}
                            </div>
                            <div className="company-name-box">
                                <h4>{job.company?.name || 'Công ty chưa cập nhật'}</h4>
                                <span className="pro-label">Pro Company</span>
                            </div>
                        </div>
                        <p>📍 {job.company?.address || 'Địa chỉ đang cập nhật'}</p>
                        {job.company?.website && (
                            <a
                                href={`https://${job.company.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="view-company-link"
                            >
                                Xem trang công ty ↗
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* NÚT QUAY LẠI */}
            <button
                className="floating-back-btn"
                title="Quay lại danh sách"
                onClick={() => navigate('/joblist')}
            >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#00b14f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            {/* NÚT DANH SÁCH ỨNG TUYỂN */}
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

            {/* FLOATING HEART BUTTON – Badge số lượng job đã lưu (realtime) */}
            <div
                className="saved-jobs-floating"
                onClick={() => navigate('/saved-jobs')}
                title="Xem tin đã lưu"
            >
                <svg viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                {savedJobIds.size > 0 && (
                    <span className="saved-badge">{savedJobIds.size}</span>
                )}
            </div>
        </div>
    );
};

export default JobPostDetails;