import React, { useEffect, useState } from "react";
import {
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Search
} from "lucide-react";

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
        status: statusFilter
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

  const waitingCount = applications.filter(
    (app) => app.status === 0
  ).length;

  return (

    <div className="app-container">

      <main className="app-wrapper">

        {/* HEADER */}
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

          {/* FILTER */}
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

        {/* CONTENT */}
        {loading ? (

          <div className="loading-box">
            <Loader2 className="spin" size={40} />
            <p>Đang tải danh sách hồ sơ...</p>
          </div>

        ) : (

          <div className="card-grid">

            {applications.map((app) => (

              <div key={app.applicationId} className="candidate-card">

                {/* CARD TOP */}
                <div className="card-top">

                  {app.candidateAvatar ? (
                    <img
                      src={app.candidateAvatar}
                      alt={app.candidateName}
                      className="avatar-img"
                    />
                  ) : (
                    <div className="avatar">
                      {app.candidateName?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="candidate-meta">

                    <h4>{app.candidateName}</h4>

                    <p className="email">
                      {app.candidateEmail}
                    </p>

                  </div>

                </div>

                {/* CARD MIDDLE */}
                <div className="card-middle">

                  <div className="job-info">

                    <span className="label">
                      Vị trí ứng tuyển
                    </span>

                    <span className="job-title">
                      {app.jobTitle}
                    </span>

                  </div>

                  <span className={`status status-${app.status}`}>

                    {app.status === 0
                      ? "Chờ duyệt"
                      : app.status === 1
                      ? "Đã chấp nhận"
                      : "Đã từ chối"}

                  </span>

                </div>

                {/* ACTIONS */}
                <div className="card-actions">

                  <button
                    className="btn btn-view"
                    onClick={() => setSelectedApp(app)}
                  >

                    <Eye size={16} />
                    Chi tiết

                  </button>

                  {app.status === 0 && (

                    <div className="decision-buttons">

                      <button
                        className="btn btn-accept"
                        onClick={() =>
                          handleUpdateStatus(app.applicationId, 1)
                        }
                      >
                        <CheckCircle2 size={16} />
                        Duyệt
                      </button>

                      <button
                        className="btn btn-reject"
                        onClick={() =>
                          handleUpdateStatus(app.applicationId, 2)
                        }
                      >
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

      {/* MODAL */}
      <ApplicationModal
        show={!!selectedApp}
        handleClose={() => setSelectedApp(null)}
        application={selectedApp}
      />

    </div>
  );
};

export default ApplicationList;