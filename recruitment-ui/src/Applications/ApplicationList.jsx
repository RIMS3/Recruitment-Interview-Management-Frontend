import React, { useState, useEffect } from 'react';
import { Eye, Check, X, Loader2 } from 'lucide-react';
import ApplicationModal from './ApplicationModal';
import './ApplicationList.css';

const ApplicationList = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Cấu hình URL khớp với EmployerAppController và Port 7272 của bạn
    const API_URL = "https://localhost:7272/api/EmployerApplications";

    // 1. Hàm lấy danh sách ứng viên từ Backend
    const fetchApplications = async () => {
        setLoading(true);
        try {
            const companyId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

            const response = await fetch(`${API_URL}/list/${companyId}`);

            if (!response.ok) throw new Error("API error");

            const data = await response.json();
            setApps(data);
        } catch (error) {
            console.error("Lỗi gọi API:", error);
        } finally {
            setLoading(false);
        }
    };
};

// 2. Hàm cập nhật trạng thái (Chấp nhận / Từ chối)
const handleUpdateStatus = async (applicationId, status) => {
    try {
        const response = await fetch(`${API_URL}/update-status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                appId: applicationId,
                newStatus: status
            })
        });

        if (!response.ok) throw new Error("Update failed");

        setApps(prev =>
            prev.map(a =>
                a.applicationId === applicationId
                    ? { ...a, status }
                    : a
            )
        );
    } catch (error) {
        console.error("Lỗi update:", error);
    }
};

useEffect(() => {
    fetchApplications();
}, []);

return (
    <div className="it-locak-container">
        <div className="it-locak-header">
            <div>
                <h1>Quản lý hồ sơ ứng tuyển</h1>
                <p className="subtitle">Xem và duyệt hồ sơ từ các ứng viên tiềm năng</p>
            </div>
            <button className="btn-refresh" onClick={fetchApplications}>Làm mới dữ liệu</button>
        </div>

        <div className="it-locak-card">
            {loading ? (
                <div className="loading-state">
                    <Loader2 className="spinner" />
                    <p>Đang tải dữ liệu từ server...</p>
                </div>
            ) : (
                <table className="it-locak-table">
                    <thead>
                        <tr>
                            <th>Ứng viên</th>
                            <th>Vị trí ứng tuyển</th>
                            <th className="text-center">Trạng thái</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {apps.length > 0 ? (
                            apps.map(app => (
                                <tr key={app.applicationId}>
                                    <td>
                                        <div className="candidate-name" onClick={() => { setSelectedApp(app); setIsModalOpen(true); }}>
                                            {app.candidateName}
                                        </div>
                                        <div className="candidate-email">{app.candidateEmail}</div>
                                    </td>
                                    <td>
                                        <div className="job-title-cell">{app.jobTitle}</div>
                                        <div className="applied-date">
                                            {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className={`it-locak-badge status-${app.status}`}>
                                            {app.status === 0 ? "Chờ duyệt" : app.status === 1 ? "Chấp nhận" : "Từ chối"}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="action-btns">
                                            <button className="btn-view" onClick={() => { setSelectedApp(app); setIsModalOpen(true); }} title="Xem chi tiết">
                                                <Eye size={18} />
                                            </button>
                                            {app.status === 0 && (
                                                <>
                                                    <button className="btn-accept" onClick={() => handleUpdateStatus(app.applicationId, 1)} title="Chấp nhận hồ sơ">
                                                        <Check size={18} />
                                                    </button>
                                                    <button className="btn-reject" onClick={() => handleUpdateStatus(app.applicationId, 2)} title="Loại hồ sơ">
                                                        <X size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center" style={{ padding: '50px' }}>
                                    Chưa có ứng viên nào ứng tuyển hoặc sai CompanyId.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>

        {/* Modal hiển thị chi tiết CV */}
        <ApplicationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            app={selectedApp}
        />
    </div>
);

export default ApplicationList;