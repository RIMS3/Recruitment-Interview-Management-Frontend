import React from 'react';
import { X, Briefcase, GraduationCap, Code, MapPin, DollarSign } from 'lucide-react';
import './ApplicationModal.css';

const ApplicationModal = ({ isOpen, onClose, app }) => {
  if (!isOpen || !app) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="btn-close" onClick={onClose}><X /></button>
        
        <div className="modal-header">
          <div className="avatar">{app.fullName[0]}</div>
          <div>
            <h2>{app.candidateName}</h2>
            <p className="indigo-text">{app.jobTitle}</p>
          </div>
        </div>

        <div className="modal-body">
          <div className="sidebar-info">
            <div className="info-box">
              <p><MapPin size={14}/> {app.address || "Chưa cập nhật"}</p>
              <p><DollarSign size={14}/> {app.currentSalary?.toLocaleString()} VND</p>
            </div>
            <a href={app.fileUrl} target="_blank" className="btn-download">Xem CV Gốc (PDF)</a>
          </div>

          <div className="main-info">
            <section>
              <h3><Briefcase size={18}/> Kinh nghiệm</h3>
              <div className="detail-card">
                <strong>{app.experienceYears} năm kinh nghiệm</strong>
                <p>{app.position}</p>
              </div>
            </section>
            
            <section>
              <h3><GraduationCap size={18}/> Học vấn</h3>
              <div className="detail-card">{app.educationSummary}</div>
            </section>
            
            <section>
              <h3><Code size={18}/> Kỹ năng chuyên môn</h3>
              <div className="skills-flex">
                {app.field?.split(',').map((s, i) => <span key={i} className="skill-tag">{s.trim()}</span>)}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;