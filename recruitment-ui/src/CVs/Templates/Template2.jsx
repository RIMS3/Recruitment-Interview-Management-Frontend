import React from "react";
import "./Template2.css";

const Template2 = ({
  cvData,
  handleTextChange,
  handleArrayChange,
  onAvatarClick,
}) => {
  const displayExperiences =
    cvData.experiences?.length > 0 ? cvData.experiences : [{}];
  const displayEducations =
    cvData.educations?.length > 0 ? cvData.educations : [{}];

  // Hàm chuyển đổi định dạng ngày từ Database (YYYY-MM-DD) sang hiển thị (DD/MM/YYYY)
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    if (dateString.includes("-") && dateString.split("-")[0].length === 4) {
      const parts = dateString.split("-");
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  return (
    <div className="a4-paper template-2">
      <div className="t2-header">
        <div className="t2-avatar-container">
          <img
            src={
              cvData.fileUrl ||
              "https://placehold.co/280x380/333/ccc?text=Avatar"
            }
            alt="Avatar"
            className="t2-avatar-img"
            onClick={onAvatarClick}
            style={{ cursor: "pointer" }}
            title="Click để thay đổi ảnh đại diện"
          />
          <div className="t2-tiktok-top">
            Following | <b>For you</b>
          </div>
          <div className="t2-tiktok-right">
            <div className="t2-icon-group">
              <span className="t2-icon red-heart">❤️</span>
              <span className="t2-icon-text">1M+</span>
            </div>
            <div className="t2-icon-group">
              <span className="t2-icon">💬</span>
            </div>
          </div>
          <div className="t2-tiktok-bottom">
            🎵{" "}
            <span
              contentEditable
              suppressContentEditableWarning
              placeholder="Vị trí ứng tuyển..."
              onBlur={(e) => handleTextChange("position", e.target.innerText)}
            >
              {cvData.position}
            </span>
          </div>
        </div>

        <div className="t2-info-container">
          <h1
            className="t2-fullname"
            contentEditable
            suppressContentEditableWarning
            placeholder="Nhập Họ Tên..."
            onBlur={(e) => handleTextChange("fullName", e.target.innerText)}
          >
            {cvData.fullName}
          </h1>
          <div className="t2-contact-list">
            <div className="t2-contact-item">
              <span className="t2-icon-circle">✉️</span> <strong>Email:</strong>{" "}
              <span
                contentEditable
                suppressContentEditableWarning
                placeholder="Nhập email..."
                onBlur={(e) => handleTextChange("email", e.target.innerText)}
              >
                {cvData.email}
              </span>
            </div>
            <div className="t2-contact-item">
              <span className="t2-icon-circle">📞</span> <strong>SĐT:</strong>{" "}
              <span
                contentEditable
                suppressContentEditableWarning
                placeholder="Nhập SĐT..."
                onBlur={(e) =>
                  handleTextChange("phoneNumber", e.target.innerText)
                }
              >
                {cvData.phoneNumber}
              </span>
            </div>

            {/* 👉 KHU VỰC NGÀY SINH GỌN NHẸ (Gõ trực tiếp) */}
            <div className="t2-contact-item">
              <span className="t2-icon-circle">📅</span>{" "}
              <strong>Ngày sinh:</strong>
              <span
                contentEditable
                suppressContentEditableWarning
                placeholder="DD/MM/YYYY"
                onBlur={(e) => handleTextChange("birthday", e.target.innerText)}
                style={{ outline: "none" }}
              >
                {formatDisplayDate(cvData.birthday)}
              </span>
            </div>

            <div className="t2-contact-item">
              <span className="t2-icon-circle">🏠</span>{" "}
              <strong>Địa chỉ:</strong>{" "}
              <span
                contentEditable
                suppressContentEditableWarning
                placeholder="Nơi ở hiện tại..."
                onBlur={(e) => handleTextChange("address", e.target.innerText)}
              >
                {cvData.address}
              </span>
            </div>

            {/* 👉 KHU VỰC GIỚI TÍNH */}
            <div className="t2-contact-item">
              <span className="t2-icon-circle">👤</span>{" "}
              <strong>Giới tính:</strong>
              <select
                value={cvData.gender || ""}
                onChange={(e) => handleTextChange("gender", e.target.value)}
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  color: "inherit",
                  cursor: "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                }}
              >
                <option value="" disabled hidden style={{ color: "black" }}>
                  Chọn
                </option>
                <option value="0" style={{ color: "black" }}>
                  Nam
                </option>
                <option value="1" style={{ color: "black" }}>
                  Nữ
                </option>
                <option value="2" style={{ color: "black" }}>
                  Khác
                </option>
              </select>
            </div>

            <div className="t2-contact-item">
              <span className="t2-icon-circle">🏳️</span>{" "}
              <strong>Quốc tịch:</strong>{" "}
              <span
                contentEditable
                suppressContentEditableWarning
                placeholder="Việt Nam"
                onBlur={(e) =>
                  handleTextChange("nationality", e.target.innerText)
                }
              >
                {cvData.nationality}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="t2-body">
        <div className="t2-col-left">
          <div className="t2-section">
            <h2 className="t2-section-title">THÔNG TIN</h2>
            <div className="t2-item">
              <h4>Số năm kinh nghiệm:</h4>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  placeholder="0"
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key) || e.target.innerText.length >= 2)
                      e.preventDefault();
                  }}
                  onBlur={(e) => {
                    const val = e.target.innerText
                      .replace(/[^0-9]/g, "")
                      .slice(0, 2);
                    e.target.innerText = val;
                    handleTextChange("experienceYears", val);
                  }}
                  style={{
                    display: "inline-block",
                    minWidth: "35px",
                    textAlign: "center",
                    borderBottom: "1px dotted rgba(255,255,255,0.2)",
                    outline: "none",
                    color: "#ccc",
                  }}
                >
                  {cvData.experienceYears}
                </span>
                <span style={{ color: "#ccc", marginLeft: "4px" }}> năm</span>
              </div>
            </div>
            <div className="t2-item">
              <h4>Mức lương (VNĐ):</h4>
              <input
                type="text"
                inputMode="numeric"
                placeholder="15000000"
                value={cvData.currentSalary || ""}
                onChange={(e) =>
                  handleTextChange(
                    "currentSalary",
                    e.target.value.replace(/[^0-9]/g, "").slice(0, 16),
                  )
                }
                /* 👉 Tăng width lên 160px */
                style={{
                  width: "230px",
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  color: "#ccc",
                  borderBottom: "1px dotted rgba(255,255,255,0.2)",
                }}
              />
            </div>
          </div>

          <div className="t2-section">
            <h2 className="t2-section-title">MỤC TIÊU</h2>
            <p
              className="t2-bullet-list"
              contentEditable
              suppressContentEditableWarning
              placeholder="Mục tiêu nghề nghiệp 3-5 năm tới..."
              onBlur={(e) => handleTextChange("summary", e.target.innerText)}
              style={{ whiteSpace: "pre-wrap", color: "#ccc" }}
            >
              {cvData.summary}
            </p>
          </div>
        </div>

        <div className="t2-col-right">
          <div className="t2-section">
            <h2 className="t2-section-title">KINH NGHIỆM LÀM VIỆC</h2>
            {displayExperiences.map((exp, index) => (
              <div key={`exp-${index}`} style={{ marginBottom: "15px" }}>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  placeholder="Tên Công ty..."
                  onBlur={(e) =>
                    handleArrayChange(
                      "experiences",
                      index,
                      "companyName",
                      e.target.innerText,
                    )
                  }
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "#fff",
                  }}
                >
                  {exp.companyName}
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  placeholder="Vị trí làm việc..."
                  onBlur={(e) =>
                    handleArrayChange(
                      "experiences",
                      index,
                      "position",
                      e.target.innerText,
                    )
                  }
                  style={{
                    color: "#aaa",
                    fontSize: "14px",
                    marginBottom: "5px",
                  }}
                >
                  {exp.position}
                </div>
                <div
                  className="t2-bullet-list"
                  contentEditable
                  suppressContentEditableWarning
                  placeholder="- Mô tả chi tiết công việc..."
                  onBlur={(e) =>
                    handleArrayChange(
                      "experiences",
                      index,
                      "description",
                      e.target.innerText,
                    )
                  }
                  style={{ whiteSpace: "pre-wrap", color: "#ccc" }}
                >
                  {exp.description}
                </div>
              </div>
            ))}
          </div>

          <div className="t2-section">
            <h2 className="t2-section-title">HỌC VẤN</h2>
            {displayEducations.map((edu, index) => (
              <div key={`edu-${index}`} style={{ marginBottom: "15px" }}>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  placeholder="Tên Trường học..."
                  onBlur={(e) =>
                    handleArrayChange(
                      "educations",
                      index,
                      "schoolName",
                      e.target.innerText,
                    )
                  }
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "#fff",
                  }}
                >
                  {edu.schoolName}
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  placeholder="Chuyên ngành..."
                  onBlur={(e) =>
                    handleArrayChange(
                      "educations",
                      index,
                      "major",
                      e.target.innerText,
                    )
                  }
                  style={{
                    color: "#aaa",
                    fontSize: "14px",
                    marginBottom: "5px",
                  }}
                >
                  {edu.major}
                </div>
                <div
                  className="t2-bullet-list"
                  contentEditable
                  suppressContentEditableWarning
                  placeholder="- Thông tin bổ sung (GPA, Giải thưởng)..."
                  onBlur={(e) =>
                    handleArrayChange(
                      "educations",
                      index,
                      "description",
                      e.target.innerText,
                    )
                  }
                  style={{ whiteSpace: "pre-wrap", color: "#ccc" }}
                >
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
