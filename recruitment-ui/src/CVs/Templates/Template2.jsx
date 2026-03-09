import React from 'react';
import './Template2.css';

const Template2 = ({ cvData, handleTextChange, handleArrayChange }) => {
  const displayExperiences = cvData.experiences?.length > 0 ? cvData.experiences : [{}];
  const displayEducations = cvData.educations?.length > 0 ? cvData.educations : [{}];

  return (
    <div className="a4-paper template-2">
      <div className="t2-header">
        <div className="t2-avatar-container">
          <img src={cvData.fileUrl || "https://placehold.co/280x380/333/ccc?text=Avatar"} alt="Avatar" className="t2-avatar-img" />
          <div className="t2-tiktok-top">Following | <b>For you</b></div>
          <div className="t2-tiktok-right">
            <div className="t2-icon-group"><span className="t2-icon red-heart">❤️</span><span className="t2-icon-text">1M+</span></div>
            <div className="t2-icon-group"><span className="t2-icon">💬</span></div>
          </div>
          <div className="t2-tiktok-bottom">
            🎵 <span contentEditable suppressContentEditableWarning placeholder="Vị trí ứng tuyển..." onBlur={(e) => handleTextChange('position', e.target.innerText)}>{cvData.position}</span>
          </div>
        </div>

        <div className="t2-info-container">
          <h1 className="t2-fullname" contentEditable suppressContentEditableWarning placeholder="Nhập Họ Tên..." onBlur={(e) => handleTextChange('fullName', e.target.innerText)}>
            {cvData.fullName}
          </h1>
          <div className="t2-contact-list">
            <div className="t2-contact-item"><span className="t2-icon-circle">✉️</span> <strong>Email:</strong> <span contentEditable suppressContentEditableWarning placeholder="Nhập email..." onBlur={(e) => handleTextChange('email', e.target.innerText)}>{cvData.email}</span></div>
            <div className="t2-contact-item"><span className="t2-icon-circle">📞</span> <strong>SĐT:</strong> <span contentEditable suppressContentEditableWarning placeholder="Nhập SĐT..." onBlur={(e) => handleTextChange('phoneNumber', e.target.innerText)}>{cvData.phoneNumber}</span></div>
            <div className="t2-contact-item"><span className="t2-icon-circle">📅</span> <strong>Ngày sinh:</strong> <span contentEditable suppressContentEditableWarning placeholder="DD/MM/YYYY" onBlur={(e) => handleTextChange('birthday', e.target.innerText)}>{cvData.birthday}</span></div>
            <div className="t2-contact-item"><span className="t2-icon-circle">🏠</span> <strong>Địa chỉ:</strong> <span contentEditable suppressContentEditableWarning placeholder="Nơi ở hiện tại..." onBlur={(e) => handleTextChange('address', e.target.innerText)}>{cvData.address}</span></div>
            <div className="t2-contact-item"><span className="t2-icon-circle">👤</span> <strong>Giới tính:</strong> <span contentEditable suppressContentEditableWarning placeholder="Nam/Nữ" onBlur={(e) => handleTextChange('gender', e.target.innerText)}>{cvData.gender}</span></div>
            <div className="t2-contact-item"><span className="t2-icon-circle">🏳️</span> <strong>Quốc tịch:</strong> <span contentEditable suppressContentEditableWarning placeholder="Việt Nam" onBlur={(e) => handleTextChange('nationality', e.target.innerText)}>{cvData.nationality}</span></div>
          </div>
        </div>
      </div>

      <div className="t2-body">
        <div className="t2-col-left">
          <div className="t2-section">
            <h2 className="t2-section-title">THÔNG TIN</h2>
            <div className="t2-item">
              <h4>Số năm kinh nghiệm:</h4>
              <p contentEditable suppressContentEditableWarning placeholder="VD: 2 năm" onBlur={(e) => handleTextChange('experienceYears', e.target.innerText)}>{cvData.experienceYears}</p>
            </div>
            <div className="t2-item">
              <h4>Mức lương mong muốn:</h4>
              <p contentEditable suppressContentEditableWarning placeholder="VD: Thỏa thuận" onBlur={(e) => handleTextChange('currentSalary', e.target.innerText)}>{cvData.currentSalary}</p>
            </div>
          </div>
          
          <div className="t2-section">
            <h2 className="t2-section-title">MỤC TIÊU</h2>
            <p className="t2-bullet-list" contentEditable suppressContentEditableWarning placeholder="Mục tiêu nghề nghiệp 3-5 năm tới..." onBlur={(e) => handleTextChange('summary', e.target.innerText)} style={{whiteSpace: 'pre-wrap', color: '#ccc'}}>
              {cvData.summary}
            </p>
          </div>
        </div>

        <div className="t2-col-right">
          <div className="t2-section">
            <h2 className="t2-section-title">KINH NGHIỆM LÀM VIỆC</h2>
            {displayExperiences.map((exp, index) => (
              <div key={`exp-${index}`} style={{ marginBottom: '15px' }}>
                <div contentEditable suppressContentEditableWarning placeholder="Tên Công ty..." onBlur={(e) => handleArrayChange('experiences', index, 'companyName', e.target.innerText)} style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>
                  {exp.companyName}
                </div>
                <div contentEditable suppressContentEditableWarning placeholder="Vị trí làm việc..." onBlur={(e) => handleArrayChange('experiences', index, 'position', e.target.innerText)} style={{ color: '#aaa', fontSize: '14px', marginBottom: '5px' }}>
                  {exp.position}
                </div>
                <div className="t2-bullet-list" contentEditable suppressContentEditableWarning placeholder="- Mô tả chi tiết công việc..." onBlur={(e) => handleArrayChange('experiences', index, 'description', e.target.innerText)} style={{ whiteSpace: 'pre-wrap', color: '#ccc' }}>
                  {exp.description}
                </div>
              </div>
            ))}
          </div>

          <div className="t2-section">
            <h2 className="t2-section-title">HỌC VẤN</h2>
            {displayEducations.map((edu, index) => (
              <div key={`edu-${index}`} style={{ marginBottom: '15px' }}>
                <div contentEditable suppressContentEditableWarning placeholder="Tên Trường học..." onBlur={(e) => handleArrayChange('educations', index, 'schoolName', e.target.innerText)} style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>
                  {edu.schoolName}
                </div>
                <div contentEditable suppressContentEditableWarning placeholder="Chuyên ngành..." onBlur={(e) => handleArrayChange('educations', index, 'major', e.target.innerText)} style={{ color: '#aaa', fontSize: '14px', marginBottom: '5px' }}>
                  {edu.major}
                </div>
                <div className="t2-bullet-list" contentEditable suppressContentEditableWarning placeholder="- Thông tin bổ sung (GPA, Giải thưởng)..." onBlur={(e) => handleArrayChange('educations', index, 'description', e.target.innerText)} style={{ whiteSpace: 'pre-wrap', color: '#ccc' }}>
                  {edu.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template2;