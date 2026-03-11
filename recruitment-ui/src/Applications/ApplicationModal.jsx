import React from "react";
import { X, Mail, Briefcase, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import "./ApplicationModal.css";
import { applicationApi } from "../Services/applicationApi";

const ApplicationModal = ({ show, handleClose, application }) => {
  if (!show || !application) return null;

  /* =========================
      FIX DATA MAPPING
  ========================== */

  const appliedDate =
    application.appliedDate ||
    application.appliedAt ||
    application.AppliedAt ||
    application.createdAt ||
    application.CreatedAt ||
    null;

  const candidateName =
    application.candidateName ||
    application.CandidateName ||
    "Unknown";

  const candidateEmail =
    application.candidateEmail ||
    application.CandidateEmail ||
    "Không có email";

  const candidateAvatar = 
    application.candidateAvatar || 
    application.CandidateAvatar || 
    null;

  const jobTitle =
    application.jobTitle ||
    application.JobTitle ||
    "Chưa xác định";

  const status = Number(
    application.status ??
    application.Status ??
    0
  );

  const cvId =
    application.cvId ||
    application.CvId ||
    null;

  /* =========================
      FORMAT DATE
  ========================== */

  const formatDate = (date) => {
    if (!date) return "Chưa có dữ liệu";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Ngày không hợp lệ";
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  /* =========================
      VIEW CV
  ========================== */

  const handleViewCV = async () => {
    try {
      const applicationId =
        application.applicationId ||
        application.ApplicationId;

      if (!applicationId) {
        toast.error("Không tìm thấy applicationId");
        return;
      }

      const result = await applicationApi.getCvIdByApplication(applicationId);
      const cvId = result.cvId || result;

      if (!cvId) {
        toast.error("Ứng viên chưa tạo CV");
        return;
      } 

      const url = `/cv-preview/${cvId}`;
      window.open(url, "_blank");
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải CV");
    }
  };

  /* =========================
      STATUS TEXT
  ========================== */

  const getStatusText = (status) => {
    switch (status) {
      case 0: return "Chờ duyệt";
      case 1: return "Đã chấp nhận";
      case 2: return "Đã từ chối";
      default: return "Không xác định";
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box single">

        {/* LEFT */}
        <div className="modal-left">
          <div className="modal-header">
            <h3>Thông tin ứng viên</h3>
            <button className="close-btn" onClick={handleClose}>
              <X size={18} />
            </button>
          </div>

          <div className="modal-body">
            {/* PROFILE CARD - UPDATED WITH AVATAR LOGIC */}
            <div className="profile-card">
              {candidateAvatar ? (
                <div className="avatar-wrapper">
                   <img
                    src={candidateAvatar}
                    alt={candidateName}
                    className="avatar-img-modal"
                    onError={(e) => {
                      // Fallback nếu ảnh lỗi
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className="avatar" style={{ display: 'none' }}>
                    {candidateName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                </div>
              ) : (
                <div className="avatar">
                  {candidateName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}

              <div className="profile-info">
                <h4>{candidateName}</h4>
                <div className="email">
                  <Mail size={14} />
                  {candidateEmail}
                </div>
              </div>
            </div>

            {/* JOB */}
            <div className="info-item">
              <div className="info-label">
                <Briefcase size={14} />
                Vị trí ứng tuyển
              </div>
              <div className="info-value-row">
                <span className="job-title">{jobTitle}</span>
                <span className={`status status-${status}`}>
                  {getStatusText(status)}
                </span>
              </div>
            </div>

            {/* DATE */}
            <div className="info-item">
              <div className="info-label">
                <Calendar size={14} />
                Ngày nộp hồ sơ
              </div>
              <div className="info-value">
                {formatDate(appliedDate)}
              </div>
            </div>

            {/* BUTTON */}
            <button className="btn-primary" onClick={handleViewCV}>
              Xem CV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;