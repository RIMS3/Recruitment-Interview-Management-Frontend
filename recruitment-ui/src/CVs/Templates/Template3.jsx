import React from 'react';
import './Template3.css';

const Template3 = ({ cvData, handleTextChange, handleArrayChange }) => {
  const displayExperiences = cvData.experiences?.length > 0 ? cvData.experiences : [{}];
  const displayEducations = cvData.educations?.length > 0 ? cvData.educations : [{}];

  return (
    <div className="a4-paper template-3">
      <div className="t3-header">
        <h1 className="t3-name" contentEditable suppressContentEditableWarning placeholder="NHẬP HỌ TÊN" onBlur={(e) => handleTextChange('fullName', e.target.innerText)}>
          {cvData.fullName}
        </h1>
        <h3 className="t3-position" contentEditable suppressContentEditableWarning placeholder="Nhập vị trí ứng tuyển..." onBlur={(e) => handleTextChange('position', e.target.innerText)}>
          {cvData.position}
        </h3>
      </div>

      <div className="t3-body">
        <div className="t3-left-col">
          <div className="t3-section">
            <h2 className="t3-section-title golden-text">Mục tiêu nghề nghiệp</h2>
            <p className="t3-text" contentEditable suppressContentEditableWarning placeholder="Mục tiêu ngắn hạn và dài hạn của bạn là gì?" onBlur={(e) => handleTextChange('summary', e.target.innerText)} style={{whiteSpace: 'pre-wrap'}}>
              {cvData.summary}
            </p>
          </div>

          <div className="t3-section">
            <div className="t3-title-with-icon"><span className="t3-icon-bg">💼</span><h2 className="t3-section-title golden-text">Kinh nghiệm làm việc</h2></div>
            {displayExperiences.map((exp, index) => (
              <div key={`exp-${index}`} style={{ marginBottom: '15px' }}>
                <strong contentEditable suppressContentEditableWarning placeholder="Công ty / Tổ chức" onBlur={(e) => handleArrayChange('experiences', index, 'companyName', e.target.innerText)} style={{ display: 'block', fontSize: '15px' }}>
                  {exp.companyName}
                </strong>
                <i contentEditable suppressContentEditableWarning placeholder="Vị trí làm việc" onBlur={(e) => handleArrayChange('experiences', index, 'position', e.target.innerText)} style={{ display: 'block', marginBottom: '5px', opacity: 0.8 }}>
                  {exp.position}
                </i>
                <p className="t3-text" contentEditable suppressContentEditableWarning placeholder="- Mô tả thành tích..." onBlur={(e) => handleArrayChange('experiences', index, 'description', e.target.innerText)} style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                  {exp.description}
                </p>
              </div>
            ))}
          </div>

          <div className="t3-section">
            <div className="t3-title-with-icon"><span className="t3-icon-bg">🎓</span><h2 className="t3-section-title golden-text">Học vấn</h2></div>
            {displayEducations.map((edu, index) => (
              <div key={`edu-${index}`} style={{ marginBottom: '15px' }}>
                <strong contentEditable suppressContentEditableWarning placeholder="Trường Đại học/Cao đẳng" onBlur={(e) => handleArrayChange('educations', index, 'schoolName', e.target.innerText)} style={{ display: 'block', fontSize: '15px' }}>
                  {edu.schoolName}
                </strong>
                <i contentEditable suppressContentEditableWarning placeholder="Chuyên ngành" onBlur={(e) => handleArrayChange('educations', index, 'major', e.target.innerText)} style={{ display: 'block', marginBottom: '5px', opacity: 0.8 }}>
                  {edu.major}
                </i>
                <p className="t3-text" contentEditable suppressContentEditableWarning placeholder="- Bổ sung chi tiết khóa học..." onBlur={(e) => handleArrayChange('educations', index, 'description', e.target.innerText)} style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                  {edu.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="t3-right-col">
          <div className="t3-avatar-wrapper">
            <img src={cvData.fileUrl || "https://placehold.co/300x300/cccccc/ffffff?text=Avatar"} alt="Avatar" className="t3-avatar" />
          </div>

          <div className="t3-contact-list">
            <div className="t3-contact-item"><span className="t3-icon-golden">📞</span> <strong>SĐT: </strong> <span contentEditable suppressContentEditableWarning placeholder="Nhập số..." onBlur={(e) => handleTextChange('phoneNumber', e.target.innerText)}>{cvData.phoneNumber}</span></div>
            <div className="t3-contact-item"><span className="t3-icon-golden">✉️</span> <strong>Email: </strong> <span contentEditable suppressContentEditableWarning placeholder="Nhập mail..." onBlur={(e) => handleTextChange('email', e.target.innerText)}>{cvData.email}</span></div>
            <div className="t3-contact-item"><span className="t3-icon-golden">📍</span> <strong>Địa chỉ: </strong> <span contentEditable suppressContentEditableWarning placeholder="Nhập nơi ở..." onBlur={(e) => handleTextChange('address', e.target.innerText)}>{cvData.address}</span></div>
            <div className="t3-contact-item"><span className="t3-icon-golden">📅</span> <strong>Ngày sinh: </strong> <span contentEditable suppressContentEditableWarning placeholder="Nhập ngày..." onBlur={(e) => handleTextChange('birthday', e.target.innerText)}>{cvData.birthday}</span></div>
            <div className="t3-contact-item"><span className="t3-icon-golden">👤</span> <strong>Giới tính: </strong> <span contentEditable suppressContentEditableWarning placeholder="Nam/Nữ" onBlur={(e) => handleTextChange('gender', e.target.innerText)}>{cvData.gender}</span></div>
            <div className="t3-contact-item"><span className="t3-icon-golden">🏳️</span> <strong>Quốc tịch: </strong> <span contentEditable suppressContentEditableWarning placeholder="Việt Nam" onBlur={(e) => handleTextChange('nationality', e.target.innerText)}>{cvData.nationality}</span></div>
          </div>

          <div className="t3-right-section">
            <h2 className="t3-right-title">Bổ sung</h2>
            <div className="t3-right-item">
              <strong>Kinh nghiệm:</strong> <span contentEditable suppressContentEditableWarning placeholder="Số năm" onBlur={(e) => handleTextChange('experienceYears', e.target.innerText)}>{cvData.experienceYears}</span>
            </div>
            <div className="t3-right-item">
              <strong>Mức lương:</strong> <span contentEditable suppressContentEditableWarning placeholder="Mức lương" onBlur={(e) => handleTextChange('currentSalary', e.target.innerText)}>{cvData.currentSalary}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template3;