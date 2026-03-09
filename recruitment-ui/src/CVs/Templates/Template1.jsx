import React from 'react';
import './Template1.css';

const Template1 = ({ cvData, handleTextChange, handleArrayChange, onAvatarClick }) => {
  const displayExperiences = cvData.experiences?.length > 0 ? cvData.experiences : [{}];
  const displayEducations = cvData.educations?.length > 0 ? cvData.educations : [{}];

  return (
    <div className="a4-paper template-1">
      <div className="t1-left-pane">
        <div className="t1-left-header">
          <h1 className="t1-name" contentEditable suppressContentEditableWarning placeholder="Nhập Họ và Tên..." onBlur={(e) => handleTextChange('fullName', e.target.innerText)}>
            {cvData.fullName}
          </h1>
          <h3 className="t1-position" contentEditable suppressContentEditableWarning placeholder="VD: Giám đốc Nhân sự" onBlur={(e) => handleTextChange('position', e.target.innerText)}>
            {cvData.position}
          </h3>
        </div>

        <div className="t1-left-body">
          <div className="t1-contact-list">
            <div className="t1-contact-item"><strong>📅 Ngày sinh: </strong> <span contentEditable suppressContentEditableWarning placeholder="26/05/1996" onBlur={(e) => handleTextChange('birthday', e.target.innerText)}>{cvData.birthday}</span></div>
            <div className="t1-contact-item"><strong>📞 SĐT: </strong> <span contentEditable suppressContentEditableWarning placeholder="0987 654 321" onBlur={(e) => handleTextChange('phoneNumber', e.target.innerText)}>{cvData.phoneNumber}</span></div>
            <div className="t1-contact-item"><strong>✉️ Email: </strong> <span contentEditable suppressContentEditableWarning placeholder="email@gmail.com" onBlur={(e) => handleTextChange('email', e.target.innerText)}>{cvData.email}</span></div>
            <div className="t1-contact-item"><strong>📍 Địa chỉ: </strong> <span contentEditable suppressContentEditableWarning placeholder="Cầu Giấy, Hà Nội" onBlur={(e) => handleTextChange('address', e.target.innerText)}>{cvData.address}</span></div>
            <div className="t1-contact-item"><strong>👤 Giới tính: </strong> <span contentEditable suppressContentEditableWarning placeholder="Nam / Nữ" onBlur={(e) => handleTextChange('gender', e.target.innerText)}>{cvData.gender}</span></div>
            <div className="t1-contact-item"><strong>🏳️ Quốc tịch: </strong> <span contentEditable suppressContentEditableWarning placeholder="Việt Nam" onBlur={(e) => handleTextChange('nationality', e.target.innerText)}>{cvData.nationality}</span></div>
          </div>

          <div className="t1-left-section">
            <h2 className="t1-left-title">THÔNG TIN BỔ SUNG</h2>
            <div className="t1-left-item">
              <strong>Kinh nghiệm: </strong>
              <span contentEditable suppressContentEditableWarning placeholder="VD: 3 năm" onBlur={(e) => handleTextChange('experienceYears', e.target.innerText)}>{cvData.experienceYears}</span>
            </div>
            <div className="t1-left-item">
              <strong>Mức lương: </strong>
              <span contentEditable suppressContentEditableWarning placeholder="VD: 15.000.000 VNĐ" onBlur={(e) => handleTextChange('currentSalary', e.target.innerText)}>{cvData.currentSalary}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="t1-right-pane">
        <div className="t1-right-header">
          <img 
            src={cvData.fileUrl || "https://placehold.co/300x300/cccccc/ffffff?text=Avatar"} 
            alt="Avatar" 
            className="t1-avatar" 
            onClick={onAvatarClick}
            style={{ cursor: 'pointer' }}
            title="Click để thay đổi ảnh đại diện"
          />
        </div>

        <div className="t1-right-body">
          <div className="t1-right-section">
            <div className="t1-right-title-wrap">
              <h2 className="t1-right-title">MỤC TIÊU NGHỀ NGHIỆP</h2>
              <div className="t1-right-line"></div>
            </div>
            <p className="t1-right-text" contentEditable suppressContentEditableWarning placeholder="Nhập tóm tắt mục tiêu nghề nghiệp của bạn tại đây..." onBlur={(e) => handleTextChange('summary', e.target.innerText)}>
              {cvData.summary}
            </p>
          </div>

          <div className="t1-right-section">
            <div className="t1-right-title-wrap">
              <h2 className="t1-right-title">KINH NGHIỆM LÀM VIỆC</h2>
              <div className="t1-right-line"></div>
            </div>
            {displayExperiences.map((exp, index) => (
              <div key={`exp-${index}`} style={{ marginBottom: '15px' }}>
                <strong contentEditable suppressContentEditableWarning placeholder="Tên Công ty / Tổ chức" onBlur={(e) => handleArrayChange('experiences', index, 'companyName', e.target.innerText)} style={{ display: 'block', fontSize: '15px', color: '#333' }}>
                  {exp.companyName}
                </strong>
                <i contentEditable suppressContentEditableWarning placeholder="Vị trí đảm nhiệm (VD: Backend Developer)" onBlur={(e) => handleArrayChange('experiences', index, 'position', e.target.innerText)} style={{ display: 'block', color: '#666', marginBottom: '4px' }}>
                  {exp.position}
                </i>
                <p className="t1-right-text" contentEditable suppressContentEditableWarning placeholder="- Mô tả công việc và thành tích..." onBlur={(e) => handleArrayChange('experiences', index, 'description', e.target.innerText)} style={{ whiteSpace: 'pre-wrap' }}>
                  {exp.description}
                </p>
              </div>
            ))}
          </div>

          <div className="t1-right-section">
            <div className="t1-right-title-wrap">
              <h2 className="t1-right-title">HỌC VẤN</h2>
              <div className="t1-right-line"></div>
            </div>
            {displayEducations.map((edu, index) => (
              <div key={`edu-${index}`} style={{ marginBottom: '15px' }}>
                <strong contentEditable suppressContentEditableWarning placeholder="Tên Trường học" onBlur={(e) => handleArrayChange('educations', index, 'schoolName', e.target.innerText)} style={{ display: 'block', fontSize: '15px', color: '#333' }}>
                  {edu.schoolName}
                </strong>
                <i contentEditable suppressContentEditableWarning placeholder="Chuyên ngành đào tạo" onBlur={(e) => handleArrayChange('educations', index, 'major', e.target.innerText)} style={{ display: 'block', color: '#666', marginBottom: '4px' }}>
                  {edu.major}
                </i>
                <p className="t1-right-text" contentEditable suppressContentEditableWarning placeholder="- Xếp loại, điểm GPA hoặc đồ án..." onBlur={(e) => handleArrayChange('educations', index, 'description', e.target.innerText)} style={{ whiteSpace: 'pre-wrap' }}>
                  {edu.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Template1;