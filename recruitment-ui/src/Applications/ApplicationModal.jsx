import React from "react";
import { X, Check, XCircle, ExternalLink, Calendar, Mail, Briefcase } from "lucide-react";
import "./ApplicationModal.css";

const ApplicationModal = ({ app, onClose, onAction }) => {
  if (!app) return null;

  const getStatusLabel = (status) => {
    const labels = {
      0: { text: "Chờ duyệt", class: "status-0" },
      1: { text: "Đã chấp nhận", class: "status-1" },
      2: { text: "Đã từ chối", class: "status-2" },
    };
    return labels[status] || { text: "", class: "" };
  };

  const statusInfo = getStatusLabel(app.status);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>Thông tin ứng viên</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Profile Identity Section */}
        <div className="modal-body">
          <div className="modal-profile-card">
            <div className="profile-main">
              {app.candidateAvatar ? (
                <img 
                  src={app.candidateAvatar} 
                  alt={app.candidateName} 
                  className="modal-avatar-img"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div className="avatar large" style={{ display: app.candidateAvatar ? 'none' : 'flex' }}>
                {app.candidateName?.charAt(0).toUpperCase()}
              </div>
              <div className="profile-text">
                <h4>{app.candidateName}</h4>
                <div className="profile-subtext">
                  <Mail size={14} />
                  <span>{app.candidateEmail}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="info-grid">
            <div className="info-row">
              <label><Briefcase size={14} /> Vị trí ứng tuyển</label>
              <span>{app.jobTitle}</span>
            </div>

            <div className="info-row">
              <label><Calendar size={14} /> Ngày nộp hồ sơ</label>
              <span>{new Date(app.appliedAt).toLocaleDateString('vi-VN')}</span>
            </div>

            <div className="info-row">
              <label>Trạng thái hiện tại</label>
              <span className={`status ${statusInfo.class}`}>
                {statusInfo.text}
              </span>
            </div>
          </div>

          {/* CV Button */}
          <a
            href={app.cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cv-link-btn"
          >
            <span>Xem CV chi tiết</span>
            <ExternalLink size={18} />
          </a>
        </div>

        {/* Action Buttons */}
        {app.status === 0 && (
          <div className="modal-footer">
            <button 
              className="btn-modal btn-modal-reject" 
              onClick={() => onAction(app.applicationId, 2)}
            >
              <XCircle size={18} />
              Từ chối
            </button>
            <button 
              className="btn-modal btn-modal-accept" 
              onClick={() => onAction(app.applicationId, 1)}
            >
              <Check size={18} />
              Chấp nhận hồ sơ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationModal;