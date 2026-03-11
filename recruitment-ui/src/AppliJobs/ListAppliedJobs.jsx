import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ListAppliedJobs.css';

// 1. Lấy Base URL từ biến môi trường của Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ListAppliedJobs = () => {
    const [appliedList, setAppliedList] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Lấy candidateId động từ localStorage (đã được lưu khi đăng nhập hoặc ứng tuyển)
        const storedCandidateId = localStorage.getItem("candidateId");

        // Kiểm tra quyền truy cập
        if (!storedCandidateId) {
            alert("Vui lòng đăng nhập với vai trò ứng viên để xem danh sách này!");
            navigate('/login'); 
            return;
        }

        fetchAppliedJobs(storedCandidateId);
    }, [navigate]);

    // 2. Hàm lấy danh sách công việc đã ứng tuyển
    const fetchAppliedJobs = async (candidateId) => {
        try {
            setLoading(true);
            // Sử dụng template literal để nối API_BASE_URL
            const response = await fetch(`${API_BASE_URL}/ViewListJobApply/candidate/${candidateId}`);
            
            if (!response.ok) {
                throw new Error("Không thể kết nối đến máy chủ.");
            }

            const data = await response.json();
            setAppliedList(data);
        } catch (error) {
            console.error("Lỗi fetch dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. Hàm hủy ứng tuyển
    const handleUnapply = async (applicationId) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy ứng tuyển công việc này?")) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/ViewListJobApply/unapply/${applicationId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.isSuccess) {
                alert(result.message || "Đã hủy ứng tuyển thành công.");
                // Cập nhật lại UI bằng cách lọc bỏ item vừa xóa
                setAppliedList(prevList => prevList.filter(item => item.applicationId !== applicationId));
            } else {
                alert("Hủy ứng tuyển thất bại: " + (result.message || "Lỗi không xác định"));
            }
        } catch (error) {
            console.error("Lỗi khi hủy ứng tuyển:", error);
            alert("Có lỗi xảy ra khi kết nối server.");
        }
    };

    // 4. Hàm helper xử lý trạng thái
    const getStatusDetails = (status) => {
        switch (status) {
            case 0: return { text: "Pending", class: "status-pending" };
            case 1: return { text: "Accepted", class: "status-accepted" };
            case 2: return { text: "Rejected", class: "status-rejected" };
            default: return { text: "Unknown", class: "status-default" };
        }
    };

    // Giao diện khi đang tải
    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải danh sách hồ sơ...</p>
        </div>
    );

    return (
        <div className="list-applied-page">
            <div className="content-container">
                <header className="page-header">
                    <h2 className="main-title">Việc làm đã ứng tuyển</h2>
                    <span className="job-count">Tổng cộng: <strong>{appliedList.length}</strong> hồ sơ</span>
                </header>
                
                {appliedList.length === 0 ? (
                    <div className="empty-state-wrapper">
                        <div className="empty-state-content">
                            <div className="empty-icon-circle">
                                <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="#00b14f" strokeWidth="1.5">
                                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M13 2v7h7" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 18h.01M8 14h8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3>Chưa có lịch sử ứng tuyển</h3>
                            <p>Hãy bắt đầu hành trình sự nghiệp bằng cách tìm kiếm và ứng tuyển vào các vị trí phù hợp ngay hôm nay!</p>
                            <button className="btn-explore-now" onClick={() => navigate('/joblist')}>
                                Khám phá việc làm ngay
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="job-grid">
                        {appliedList.map((item) => {
                            const status = getStatusDetails(item.status);
                            // Ưu tiên lấy jobId để điều hướng về trang chi tiết
                            const targetJobId = item.jobId || item.id || item.idJobPost;

                            return (
                                <div key={item.applicationId} className="job-item-card">
                                    <div 
                                        className="job-info-left" 
                                        onClick={() => navigate(`/jobpostdetail/${targetJobId}`)}
                                    >
                                        <h3 className="job-name">{item.jobTitle}</h3>
                                        <p className="comp-name">🏢 {item.companyName}</p>
                                        <div className="meta-info">
                                            <span className="apply-date">
                                                📅 Ngày nộp: {item.appliedAt ? new Date(item.appliedAt).toLocaleDateString('vi-VN') : "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="job-action-right">
                                        <div className={`status-tag ${status.class}`}>
                                            {status.text}
                                        </div>
                                        <button 
                                            className="btn-unapply" 
                                            onClick={(e) => {
                                                e.stopPropagation(); // Tránh kích hoạt sự kiện onClick của thẻ cha
                                                handleUnapply(item.applicationId);
                                            }}
                                            title="Hủy ứng tuyển"
                                        >
                                            <svg viewBox="0 0 24 24" width="18" fill="currentColor">
                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                            </svg>
                                            <span>Hủy</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Nút quay lại trang trước đó */}
            <button 
                className="floating-exit-btn" 
                title="Quay lại"
                onClick={() => navigate(-1)} 
            >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="30" height="30">
                    <path d="M11 16L7 12M7 12L11 8M7 12H17M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#00b14f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>         
        </div>
    );
};

export default ListAppliedJobs;