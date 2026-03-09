import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ListAppliedJobs.css';

const ListAppliedJobs = () => {
    const [appliedList, setAppliedList] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 1. Lấy candidateId từ localStorage thay vì fix cứng
    const candidateId = localStorage.getItem('candidateId'); 

    useEffect(() => {
        // 2. Kiểm tra nếu không có candidateId (chưa đăng nhập) thì đẩy về trang login hoặc báo lỗi
        if (!candidateId) {
            console.error("Không tìm thấy Candidate ID. Vui lòng đăng nhập.");
            setLoading(false);
            // navigate('/login'); // Bạn có thể mở comment này nếu muốn tự động chuyển hướng
            return;
        }
        
        fetchAppliedJobs();
    }, [candidateId]); // Chạy lại nếu candidateId thay đổi

    const fetchAppliedJobs = async () => {
        try {
            // API trả về danh sách các công việc ứng viên đã nộp
            const response = await fetch(`https://localhost:7272/api/ViewListJobApply/candidate/${candidateId}`);
            if (!response.ok) throw new Error("Lỗi khi tải dữ liệu từ server");
            
            const data = await response.json();
            setAppliedList(data);
        } catch (error) {
            console.error("Lỗi fetch dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnapply = async (applicationId) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy ứng tuyển công việc này?")) return;
        try {
            const response = await fetch(`https://localhost:7272/api/ViewListJobApply/unapply/${applicationId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            if (result.isSuccess) {
                alert(result.message);
                setAppliedList(appliedList.filter(item => item.applicationId !== applicationId));
            } else {
                alert("Hủy ứng tuyển thất bại: " + result.message);
            }
        } catch (error) {
            console.error("Lỗi khi hủy ứng tuyển:", error);
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

    if (loading) return <div className="status-loading">Đang tải danh sách hồ sơ...</div>;
    
    // 3. Hiển thị thông báo nếu không có dữ liệu hoặc chưa đăng nhập
    if (!candidateId) return <div className="status-loading">Vui lòng đăng nhập để xem danh sách.</div>;

    return (
        <div className="list-applied-page">
            <div className="content-container">
                <h2 className="main-title">Việc làm đã ứng tuyển</h2>
                <div className="job-grid">
                    {appliedList.length > 0 ? (
                        appliedList.map((item) => {
                            const status = getStatusDetails(item.status);
                            const targetJobId = item.jobId || item.id || item.idJobPost;

                            return (
                                <div key={item.applicationId} className="job-item-card">
                                    <div 
                                        className="job-info-left" 
                                        onClick={() => {
                                            if (targetJobId) {
                                                navigate(`/jobpostdetail/${targetJobId}`);
                                            } else {
                                                alert("Lỗi: Không tìm thấy JobId cho công việc này!");
                                            }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <h3 className="job-name">{item.jobTitle}</h3>
                                        <p className="comp-name">{item.companyName}</p>
                                        <span className="apply-date">Ngày nộp: {new Date(item.appliedAt).toLocaleDateString('vi-VN')}</span>
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
                                        >
                                            <svg viewBox="0 0 24 24" width="16" fill="currentColor" style={{marginRight: '4px'}}><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="no-data">Bạn chưa ứng tuyển công việc nào.</div>
                    )}
                </div>
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