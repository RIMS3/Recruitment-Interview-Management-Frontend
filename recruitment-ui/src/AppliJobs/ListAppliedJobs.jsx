import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Thêm thư viện thông báo sinh động
import './ListAppliedJobs.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ListAppliedJobs = () => {
    const [appliedList, setAppliedList] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedCandidateId = localStorage.getItem("candidateId");

        if (!storedCandidateId) {
            // Thay alert bằng SweetAlert2 sinh động
            Swal.fire({
                title: 'Thông báo',
                text: "Vui lòng đăng nhập với vai trò ứng viên để xem danh sách này!",
                icon: 'warning',
                confirmButtonColor: '#00b14f',
                confirmButtonText: 'Đến trang đăng nhập'
            }).then(() => {
                navigate('/login');
            });
            return;
        }

        fetchAppliedJobs(storedCandidateId);
    }, [navigate]);

    const fetchAppliedJobs = async (candidateId) => {
        try {
            setLoading(true);
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

    // 3. Hàm hủy ứng tuyển - ĐÃ CẬP NHẬT MỀM MẠI HƠN
    const handleUnapply = async (applicationId) => {
        // Thay window.confirm bằng hộp thoại xác nhận cực đẹp
        const resultConfirm = await Swal.fire({
            title: 'Xác nhận hủy?',
            text: "Bạn có chắc chắn muốn rút hồ sơ khỏi công việc này không?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#00b14f',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Đồng ý, hủy ngay',
            cancelButtonText: 'Suy nghĩ lại',
            reverseButtons: true, // Đưa nút hủy sang trái cho thuận tay
            background: '#ffffff',
            borderRadius: '20px'
        });

        if (!resultConfirm.isConfirmed) return;

        try {
            const response = await fetch(`${API_BASE_URL}/ViewListJobApply/unapply/${applicationId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();

            if (result.isSuccess) {
                // Thông báo thành công tự động đóng sau 2 giây
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: result.message || "Đã gỡ hồ sơ ứng tuyển.",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
                
                setAppliedList(prevList => prevList.filter(item => item.applicationId !== applicationId));
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Thất bại',
                    text: result.message || "Lỗi không xác định",
                    confirmButtonColor: '#00b14f'
                });
            }
        } catch (error) {
            console.error("Lỗi khi hủy ứng tuyển:", error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi kết nối',
                text: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau!",
                confirmButtonColor: '#00b14f'
            });
        }
    };

    const getStatusDetails = (status) => {
        switch (status) {
            case 0: return { text: "Pending", class: "status-pending" };
            case 1: return { text: "Accepted", class: "status-accepted" };
            case 2: return { text: "Rejected", class: "status-rejected" };
            default: return { text: "Unknown", class: "status-default" };
        }
    };

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
                                                e.stopPropagation();
                                                handleUnapply(item.applicationId);
                                            }}
                                            disabled={item.status === 2}
                                            title={item.status === 2 ? 'Không thể hủy hồ sơ đã bị từ chối' : 'Hủy ứng tuyển'}
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