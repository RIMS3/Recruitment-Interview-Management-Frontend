import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedJobIds, toggleSavedJob } from '../Services/SavedJobsApi';
import { DEV_BYPASS_LOGIN_TO_SAVE, DEV_CANDIDATE_ID } from '../Services/candidateSession';
import { AuthContext } from '../Auth/AuthContext'; 
import './JobList.css';

// --- PHẦN THÊM MỚI: Mảng chứa logo các công ty lớn ---
const COMPANY_LOGOS = [
    // "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg", // Google
    // "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",     // Microsoft
    // "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",        // Amazon
    "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",   // Apple
    "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",  // Netflix
    "https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png",          // Tesla
    "https://d3e6ckxkrs5ntg.cloudfront.net/artists/images/8636356/original/resize:248x186/crop:x0y29w245h183/hash:1755578318/avt-viet69.jpeg?1755578318",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Pornhub-logo.svg/3840px-Pornhub-logo.svg.png"
];

// --- PHẦN THÊM MỚI: Hàm lấy logo cố định theo ID của Job ---
const getLogoForJob = (jobId) => {
    if (!jobId) return COMPANY_LOGOS[0];
    let hash = 0;
    for (let i = 0; i < jobId.length; i++) {
        hash = jobId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COMPANY_LOGOS.length;
    return COMPANY_LOGOS[index];
};

const JobList = () => {
    const navigate = useNavigate();
    
    // 1. Lấy thông tin user đăng nhập từ AuthContext
    const { user } = useContext(AuthContext);

    // 2. Tự động lấy ID chuẩn từ user
    const candidateId = useMemo(() => {
        if (DEV_BYPASS_LOGIN_TO_SAVE) return DEV_CANDIDATE_ID;
        const currentId = user?.candidateId || user?.id || null;
        console.log("👉 ID Ứng viên hiện tại trong JobList:", currentId); 
        return currentId;
    }, [user]);

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingMap, setSavingMap] = useState({});
    const [savedJobIds, setSavedJobIds] = useState(new Set());

    const [dynamicFilters, setDynamicFilters] = useState({
        locations: [],
        experiences: [],
        jobTypes: []
    });

    const [filters, setFilters] = useState({
        Search: '',
        Location: '',
        experience: '',
        rank: '',
        PageNumber: 1,
        PageSize: 6
    });

    useEffect(() => {
        const initData = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs`);
                const data = await res.json();

                const locations = [...new Set(data.map(j => j.location))].filter(Boolean).sort();
                const experiences = [...new Set(data.map(j => j.experience))]
                    .filter(exp => exp !== null && exp !== undefined)
                    .sort((a, b) => a - b);

                const jobTypesMap = new Map();
                data.forEach(j => {
                    if (j.jobType !== null && j.jobTypeName !== null) {
                        jobTypesMap.set(j.jobType, j.jobTypeName);
                    }
                });
                const jobTypes = Array.from(jobTypesMap, ([id, name]) => ({ id, name }));

                setDynamicFilters({ locations, experiences, jobTypes });
            } catch (err) {
                console.error('Lỗi khởi tạo dữ liệu bộ lọc:', err);
            }
        };

        initData();
    }, []);

    const fetchSavedIds = useCallback(async () => {
        if (!candidateId) return;
        try {
            const ids = await getSavedJobIds(candidateId);
            setSavedJobIds(new Set(ids.map(String)));
        } catch (err) {
            console.error(err);
        }
    }, [candidateId]);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.Search) params.append('Search', filters.Search);
            if (filters.Location) params.append('Location', filters.Location);
            if (filters.experience !== '') params.append('Experience', filters.experience);
            if (filters.rank !== '') params.append('JobType', filters.rank);
            params.append('PageNumber', filters.PageNumber);
            params.append('PageSize', filters.PageSize);

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs/filter?${params.toString()}`);
            const data = await response.json();
            setJobs(data);
        } catch (err) {
            console.error('Lỗi kết nối API lọc công việc:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchSavedIds();
    }, [fetchSavedIds]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchJobs();
        }, 300);
        return () => clearTimeout(handler);
    }, [filters, fetchJobs]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, PageNumber: 1 }));
    };

    const handleReset = () => {
        setFilters({
            Search: '',
            Location: '',
            experience: '',
            rank: '',
            PageNumber: 1,
            PageSize: 6
        });
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, PageNumber: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggleSavedJob = async (e, rawJobId) => {
        e.stopPropagation(); 
        const jobId = String(rawJobId);
        
        if (!candidateId) {
            alert('Bạn cần đăng nhập để lưu job.');
            return;
        }

        if (savingMap[jobId]) return;
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
            console.error(err);
            alert(err?.message || 'Không thể cập nhật trạng thái lưu job.');
        } finally {
            setSavingMap(prev => ({ ...prev, [jobId]: false }));
        }
    };

    return (
        <div className="job-list-wrapper">
            <header className="sticky-header">
                <div className="search-container">
                    <div className="search-box">
                        <span className="icon">🔍</span>
                        <input
                            type="text"
                            name="Search"
                            value={filters.Search}
                            onChange={handleInputChange}
                            placeholder="Tên công việc, vị trí ứng tuyển..."
                        />
                    </div>

                    <div className="location-box">
                        <span className="icon">📍</span>
                        <select name="Location" value={filters.Location} onChange={handleInputChange}>
                            <option value="">Tất cả địa điểm</option>
                            {dynamicFilters.locations.map((loc) => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    <button className="btn-find" onClick={fetchJobs}>Tìm kiếm</button>
                </div>
            </header>

            <div className="job-list-main-content">
                <aside className="job-list-sidebar">
                    <div className="filter-header">
                        <span className="filter-icon">⚡</span> Lọc nâng cao
                    </div>

                    <div className="filter-group">
                        <span className="filter-group-label">Kinh nghiệm</span>
                        <div className="options-list">
                            <label className={`option-item ${filters.experience === '' ? 'active' : ''}`}>
                                <input type="radio" name="experience" value="" checked={filters.experience === ''} onChange={handleInputChange} />
                                <span className="custom-radio"></span> Tất cả kinh nghiệm
                            </label>
                            {dynamicFilters.experiences.map(exp => (
                                <label key={`exp-${exp}`} className={`option-item ${filters.experience === exp.toString() ? 'active' : ''}`}>
                                    <input type="radio" name="experience" value={exp} checked={filters.experience === exp.toString()} onChange={handleInputChange} />
                                    <span className="custom-radio"></span>
                                    {exp === 0 ? 'Chưa có kinh nghiệm' : `${exp} năm kinh nghiệm`}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <span className="filter-group-label">Hình thức làm việc</span>
                        <div className="options-list">
                            <label className={`option-item ${filters.rank === '' ? 'active' : ''}`}>
                                <input type="radio" name="rank" value="" checked={filters.rank === ''} onChange={handleInputChange} />
                                <span className="custom-radio"></span> Tất cả hình thức
                            </label>
                            {dynamicFilters.jobTypes.map(type => (
                                <label key={`type-${type.id}`} className={`option-item ${filters.rank === type.id.toString() ? 'active' : ''}`}>
                                    <input type="radio" name="rank" value={type.id} checked={filters.rank === type.id.toString()} onChange={handleInputChange} />
                                    <span className="custom-radio"></span>
                                    {type.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button className="btn-reset" onClick={handleReset}>🔄 Xóa bộ lọc</button>
                </aside>

                <main className={`job-section ${loading ? 'loading-blur' : ''}`}>
                    <div className="job-count-info">
                        {loading ? 'Đang cập nhật...' : <>Có <strong>{jobs.length}</strong> việc làm phù hợp</>}
                    </div>

                    {jobs.map((job) => {
                        const jobId = String(job.idJobPost || job.jobId || job.id);
                        const isSaved = savedJobIds.has(jobId);
                        
                        // --- PHẦN THÊM MỚI: Lấy logo tương ứng cho job này ---
                        const jobLogo = getLogoForJob(jobId);

                        return (
                            <div 
                                className="job-card clickable-card" 
                                key={jobId}
                                onClick={() => navigate(`/jobpostdetail/${jobId}`)}
                            >
                                <div className="logo-box">
                                    {/* --- PHẦN THÊM MỚI: Truyền biến jobLogo vào thẻ img --- */}
                                    <img src={jobLogo} alt="company logo" />
                                </div>
                                <div className="job-info">
                                    <div className="job-top">
                                        <h3 className="job-title">{job.title}</h3>
                                        <span className="job-salary">
                                            {job.salaryMin?.toLocaleString()} - {job.salaryMax?.toLocaleString()} $
                                        </span>
                                    </div>
                                    <div className="comp-name">HỆ THỐNG QUẢN LÝ TUYỂN DỤNG RIMS</div>
                                    <div className="job-tags">
                                        <span className="job-tag">📍 {job.location}</span>
                                        <span className="job-tag">💼 {job.jobTypeName || 'N/A'}</span>
                                        <span className="job-tag">⏳ {job.experience > 0 ? `${job.experience} năm KN` : 'Không yêu cầu KN'}</span>
                                        <span className="job-tag">⏱ {new Date(job.expireAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="job-footer">
                                        <span className="job-date">Hạn nộp: {new Date(job.expireAt).toLocaleDateString()}</span>
                                        <div className="job-actions">
                                            <button
                                                className={`btn-wishlist ${isSaved ? 'saved' : ''}`}
                                                title={isSaved ? 'Bỏ lưu tin' : 'Lưu tin'}
                                                onClick={(e) => handleToggleSavedJob(e, jobId)}
                                                disabled={!!savingMap[jobId]}
                                            >
                                                ❤
                                            </button>
                                            <button 
                                                className="btn-apply"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/jobpostdetail/${jobId}`);
                                                }}
                                            >
                                                Ứng tuyển ngay
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <div className="pagination-container">
                        <button className="btn-page" disabled={filters.PageNumber === 1} onClick={() => handlePageChange(filters.PageNumber - 1)}>
                            « Trang trước
                        </button>
                        <span className="page-info">Trang {filters.PageNumber}</span>
                        <button className="btn-page" disabled={jobs.length < filters.PageSize} onClick={() => handlePageChange(filters.PageNumber + 1)}>
                            Trang sau »
                        </button>
                    </div>
                </main>
            </div>

            <button 
                className="floating-applied-list" 
                title="Danh sách ứng tuyển"
                onClick={() => navigate('/applied-jobs')}
            >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 12C9.21 12 11 10.21 11 8C11 5.79 9.21 4 7 4C4.79 4 3 5.79 3 8C3 10.21 4.79 12 7 12ZM7 14C4.33 14 0 15.34 0 18V20H14V18C14 15.34 9.67 14 7 14Z" fill="#00b14f"/>
                    <path d="M21 9V6H19V9H16V11H19V14H21V11H24V9H21Z" fill="#00b14f"/>
                </svg>
            </button>

            <div className="saved-jobs-floating" onClick={() => navigate('/saved-jobs')}>
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

export default JobList;