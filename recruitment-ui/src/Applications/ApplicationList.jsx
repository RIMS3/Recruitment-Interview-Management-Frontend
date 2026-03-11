import React, { useEffect, useState, useCallback } from "react";
import { 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Sparkles, 
  Search, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import ApplicationModal from "./ApplicationModal";
import "./ApplicationList.css";
import { applicationApi } from "../Services/applicationApi";

const ApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchTitle, setSearchTitle] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // --- State cho phân trang ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await applicationApi.getList({
        searchTitle,
        status: statusFilter,
      });
      setApplications(data);
      // Reset về trang 1 khi dữ liệu thay đổi do tìm kiếm/lọc
      setCurrentPage(1);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu ứng tuyển:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTitle, statusFilter]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchApplications();
    }, 400);
    return () => clearTimeout(delay);
  }, [fetchApplications]);

  const handleUpdateStatus = async (appId, newStatus) => {
    const success = await applicationApi.updateStatus(appId, newStatus);
    if (success) {
      fetchApplications();
      setSelectedApp(null);
    }
  };

  // --- Logic tính toán phân trang ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = applications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(applications.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Cuộn lên đầu trang khi chuyển trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const waitingCount = applications.filter((app) => app.status === 0).length;

  return (
    <div className="app-container">
      <main className="app-wrapper">
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

        {loading ? (
          <div className="loading-box">
            <Loader2 className="spin" size={40} />
            <p>Đang tải danh sách hồ sơ...</p>
          </div>
        ) : (
          <>
            <div className="card-grid">
              {currentItems.length > 0 ? (
                currentItems.map((app) => (
                  <div key={app.applicationId} className="candidate-card">
                    <div className="card-top">
                      {app.candidateAvatar ? (
                        <>
                          <img 
                            src={app.candidateAvatar} 
                            alt={app.candidateName} 
                            className="avatar-img"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          <div className="avatar" style={{ display: 'none' }}>
                            {app.candidateName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                        </>
                      ) : (
                        <div className="avatar">
                          {app.candidateName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                      )}
                      <div className="candidate-meta">
                        <h4>{app.candidateName}</h4>
                        <p className="email">{app.candidateEmail}</p>
                        <span className="applied-date">
                          Ngày nộp: {new Date(app.appliedAt).toLocaleDateString("vi-VN")}
                        </span>
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
                        <Eye size={16} /> Chi tiết
                      </button>

                      {app.status === 0 && (
                        <div className="decision-buttons">
                          <button className="btn btn-accept" onClick={() => handleUpdateStatus(app.applicationId, 1)}>
                            <CheckCircle2 size={16} /> Duyệt
                          </button>
                          <button className="btn btn-reject" onClick={() => handleUpdateStatus(app.applicationId, 2)}>
                            <XCircle size={16} /> Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">Không tìm thấy hồ sơ nào.</div>
              )}
            </div>

            {/* --- UI Phân trang --- */}
            {applications.length > itemsPerPage && (
              <div className="pagination">
                <button 
                  className="page-btn"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={20} />
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={`page-btn ${currentPage === index + 1 ? "active" : ""}`}
                    onClick={() => paginate(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}

                <button 
                  className="page-btn"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <ApplicationModal
        show={!!selectedApp}
        handleClose={() => setSelectedApp(null)}
        application={selectedApp}
      />
    </div>
  );
};

export default ApplicationList;