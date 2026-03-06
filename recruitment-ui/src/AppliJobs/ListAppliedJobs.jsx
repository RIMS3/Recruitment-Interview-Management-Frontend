import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ListAppliedJobs.css';

const ListAppliedJobs = () => {
    const [appliedList, setAppliedList] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // CandidateId mẫu theo yêu cầu hệ thống của bạn
    const candidateId = "CCB1695B-D1F3-4CFD-B475-8D7B7BDA3DDE";

    useEffect(() => {
        fetchAppliedJobs();
    }, []);

    const fetchAppliedJobs = async () => {
        try {
            // API trả về danh sách các công việc ứng viên đã nộp
            const response = await fetch(`https://localhost:7272/api/ViewListJobApply/candidate/${candidateId}`);
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
            case 0: return { text: "Pending", class: "status-pending" }; //
            case 1: return { text: "Accepted", class: "status-accepted" };
            case 2: return { text: "Rejected", class: "status-rejected" };
            default: return { text: "Unknown", class: "status-default" };
        }
    };

    if (loading) return <div className="status-loading">Đang tải danh sách hồ sơ...</div>;

    return (
        <div className="list-applied-page">
            <div className="content-container">
                <h2 className="main-title">Việc làm đã ứng tuyển</h2>
                <div className="job-grid">
                    {appliedList.map((item) => {
                        const status = getStatusDetails(item.status);
                        
                        // QUAN TRỌNG: Map theo jobId để link không bị undefined
                        // Ưu tiên lấy 'jobId' (mã bắt đầu bằng f666... hoặc f333...)
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
                                            e.stopPropagation(); // Không kích hoạt navigate của thẻ cha khi bấm xóa
                                            handleUnapply(item.applicationId);
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" width="16" fill="currentColor" style={{marginRight: '4px'}}><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* NÚT THOÁT QUAY LẠI (GÓC DƯỚI BÊN TRÁI) */}
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