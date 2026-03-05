import React, { useEffect, useState } from "react";
import { Eye, CheckCircle2, XCircle, Loader2, Sparkles, Facebook, Linkedin, Mail, Search } from "lucide-react";
import ApplicationModal from "./ApplicationModal";
import "./ApplicationList.css";
import { applicationApi } from "../Services/applicationApi";

const ApplicationList = ({ companyId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchTitle, setSearchTitle] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationApi.getList({
        companyId,
        searchTitle,
        status: statusFilter,
      });
      setApplications(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [companyId]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchApplications();
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTitle, statusFilter]);

  const handleUpdateStatus = async (appId, newStatus) => {
    const success = await applicationApi.updateStatus(appId, newStatus);
    if (success) {
      fetchApplications();
      setSelectedApp(null);
    }
  };

  const waitingCount = applications.filter(app => app.status === 0).length;

  return (
    <div className="app-container">
      <main className="app-wrapper">
        {/* Header Section */}
        <div className="app-header">
          <div className="header-left">
            <div className="title-group">
              <Sparkles size={28} color="#6366f1" fill="#6366f1" />
              <h2>Quản lý hồ sơ ứng tuyển</h2>
            </div>
            <div className="waiting-count">
              Bạn có <span className="count-badge">{waitingCount}</span> ứng viên đang chờ xử lý
            </div>
          </div>

          <div className="app-filters">
            <div className="search-box">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Tìm vị trí hoặc tên ứng viên..."
                value={searchTitle}
                className="search-input"
                onChange={(e) => setSearchTitle(e.target.value)}
              />
            </div>
            <select
              className="status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="0">Chờ duyệt</option>
              <option value="1">Đã chấp nhận</option>
              <option value="2">Đã từ chối</option>
            </select>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="loading-box">
            <Loader2 className="spin" size={40} />
            <p>Đang tải danh sách hồ sơ...</p>
          </div>
        ) : (
          <div className="card-grid">
            {applications.map((app) => (
              <div key={app.applicationId} className="candidate-card">
                <div className="card-top">
                  {app.candidateAvatar ? (
                    <img 
                      src={app.candidateAvatar} 
                      alt={app.candidateName} 
                      className="avatar-img"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div className="avatar" style={{ display: app.candidateAvatar ? 'none' : 'flex' }}>
                    {app.candidateName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="candidate-meta">
                    <h4>{app.candidateName}</h4>
                    <p className="email">{app.candidateEmail}</p>
                  </div>
                </div>

                <div className="card-middle">
                  <div className="job-info">
                    <span className="label">Vị trí ứng tuyển</span>
                    <span className="job-title">{app.jobTitle}</span>
                  </div>
                  <span className={`status status-${app.status}`}>
                    {app.status === 0 ? "Chờ duyệt" : app.status === 1 ? "Đã chấp nhận" : "Đã từ chối"}
                  </span>
                </div>

                <div className="card-actions">
                  <button className="btn btn-view" onClick={() => setSelectedApp(app)}>
                    <Eye size={16} />
                    Chi tiết
                  </button>

                  {app.status === 0 && (
                    <div className="decision-buttons">
                      <button className="btn btn-accept" onClick={() => handleUpdateStatus(app.applicationId, 1)}>
                        <CheckCircle2 size={16} />
                        Duyệt
                      </button>
                      <button className="btn btn-reject" onClick={() => handleUpdateStatus(app.applicationId, 2)}>
                        <XCircle size={16} />
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Main Footer Block */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-section brand-info">
            <h3 className="footer-logo">IT LoCak</h3>
            <p>Nâng tầm sự nghiệp lập trình viên Việt Nam với những cơ hội tốt nhất.</p>
            <div className="social-links">
              <Facebook size={20} className="icon-hover" />
              <Linkedin size={20} className="icon-hover" />
              <Mail size={20} className="icon-hover" />
            </div>
          </div>
          <div className="footer-section">
            <h4>Ứng viên</h4>
            <ul>
              <li>Việc làm mới</li>
              <li>Tạo CV chuyên nghiệp</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Hỗ trợ</h4>
            <ul>
              <li>Trung tâm trợ giúp</li>
              <li>Bảo mật & Điều khoản</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Liên hệ</h4>
            <p>📞 1900 888 999</p>
            <p>📧 career@recruitfree.vn</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 RecruitFree Platform. All rights reserved.</p>
          <p>Made with ❤️ by Pham Trung Duc</p>
        </div>
      </footer>

      {/* Modal Profile */}
      <ApplicationModal
        app={selectedApp}
        onClose={() => setSelectedApp(null)}
        onAction={handleUpdateStatus}
      />
    </div>
  );
};

export default ApplicationList;