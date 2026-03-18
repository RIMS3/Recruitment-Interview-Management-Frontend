import React from "react";
import "./Template3.css";

const Template3 = ({
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
    <div className="a4-paper template-3">
      <div className="t3-header">
        <h1
          className="t3-name"
          contentEditable
          suppressContentEditableWarning
          placeholder="NHẬP HỌ TÊN"
          onBlur={(e) => handleTextChange("fullName", e.target.innerText)}
        >
          {cvData.fullName}
        </h1>
        <h3
          className="t3-position"
          contentEditable
          suppressContentEditableWarning
          placeholder="Nhập vị trí ứng tuyển..."
          onBlur={(e) => handleTextChange("position", e.target.innerText)}
        >
          {cvData.position}
        </h3>
      </div>

      <div className="t3-body">
        <div className="t3-left-col">
          <div className="t3-section">
            <h2 className="t3-section-title golden-text">
              Mục tiêu nghề nghiệp
            </h2>
            <p
              className="t3-text"
              contentEditable
              suppressContentEditableWarning
              placeholder="Mục tiêu ngắn hạn và dài hạn của bạn là gì?"
              onBlur={(e) => handleTextChange("summary", e.target.innerText)}
              style={{ whiteSpace: "pre-wrap" }}
            >
              {cvData.summary}
            </p>
          </div>

          <div className="t3-section">
            <div className="t3-title-with-icon">
              <span className="t3-icon-bg">💼</span>
              <h2 className="t3-section-title golden-text">
                Kinh nghiệm làm việc
              </h2>
            </div>
            {displayExperiences.map((exp, index) => (
              <div key={`exp-${index}`} style={{ marginBottom: "15px" }}>
                <strong
                  contentEditable
                  suppressContentEditableWarning
                  placeholder="Công ty / Tổ chức"
                  onBlur={(e) =>
                    handleArrayChange(
                      "experiences",
                      index,
                      "companyName",
                      e.target.innerText,
                    )
                  }
                  style={{ display: "block", fontSize: "15px" }}
                >
                  {exp.companyName}
                </strong>
                <i
                  contentEditable
                  suppressContentEditableWarning
                  placeholder="Vị trí làm việc"
                  onBlur={(e) =>
                    handleArrayChange(
                      "experiences",
                      index,
                      "position",
                      e.target.innerText,
                    )
                  }
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    opacity: 0.8,
                  }}
                >
                  {exp.position}
                </i>
                <p
                  className="t3-text"
                  contentEditable
                  suppressContentEditableWarning
                  placeholder="- Mô tả thành tích..."
                  onBlur={(e) =>
                    handleArrayChange(
                      "experiences",
                      index,
                      "description",
                      e.target.innerText,
                    )
                  }
                  style={{ whiteSpace: "pre-wrap", margin: 0 }}
                >
                  {exp.description}
                </p>
              </div>
            ))}
          </div>

          <div className="t3-section">
            <div className="t3-title-with-icon">
              <span className="t3-icon-bg">🎓</span>
              <h2 className="t3-section-title golden-text">Học vấn</h2>
            </div>
            {displayEducations.map((edu, index) => (
              <div key={`edu-${index}`} style={{ marginBottom: "15px" }}>
                <strong
                  contentEditable
                  suppressContentEditableWarning
                  placeholder="Trường Đại học/Cao đẳng"
                  onBlur={(e) =>
                    handleArrayChange(
                      "educations",
                      index,
                      "schoolName",
                      e.target.innerText,
                    )
                  }
                  style={{ display: "block", fontSize: "15px" }}
                >
                  {edu.schoolName}
                </strong>
                <i
                  contentEditable
                  suppressContentEditableWarning
                  placeholder="Chuyên ngành"
                  onBlur={(e) =>
                    handleArrayChange(
                      "educations",
                      index,
                      "major",
                      e.target.innerText,
                    )
                  }
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    opacity: 0.8,
                  }}
                >
                  {edu.major}
                </i>
                <p
                  className="t3-text"
                  contentEditable
                  suppressContentEditableWarning
                  placeholder="- Bổ sung chi tiết khóa học..."
                  onBlur={(e) =>
                    handleArrayChange(
                      "educations",
                      index,
                      "description",
                      e.target.innerText,
                    )
                  }
                  style={{ whiteSpace: "pre-wrap", margin: 0 }}
                >
                  {edu.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="t3-right-col">
          <div className="t3-avatar-wrapper">
            <img
              src={
                cvData.fileUrl ||
                "https://placehold.co/300x300/cccccc/ffffff?text=Avatar"
              }
              alt="Avatar"
              className="t3-avatar"
              onClick={onAvatarClick}
              style={{ cursor: "pointer" }}
              title="Click để thay đổi ảnh đại diện"
            />
          </div>

          <div className="t3-contact-list">
            <div className="t3-contact-item">
              <span className="t3-icon-golden">📞</span> <strong>SĐT: </strong>{" "}
              <span
                contentEditable
                suppressContentEditableWarning
                placeholder="Nhập số..."
                onBlur={(e) =>
                  handleTextChange("phoneNumber", e.target.innerText)
                }
              >
                {cvData.phoneNumber}
              </span>
            </div>
            <div className="t3-contact-item">
              <span className="t3-icon-golden">✉️</span>{" "}
              <strong>Email: </strong>{" "}
              <span
                contentEditable
                suppressContentEditableWarning
                placeholder="Nhập mail..."
                onBlur={(e) => handleTextChange("email", e.target.innerText)}
              >
                {cvData.email}
              </span>
            </div>
            <div className="t3-contact-item">
              <span className="t3-icon-golden">📍</span>{" "}
              <strong>Địa chỉ: </strong>{" "}
              <span
                contentEditable
                suppressContentEditableWarning
                placeholder="Nhập nơi ở..."
                onBlur={(e) => handleTextChange("address", e.target.innerText)}
              >
                {cvData.address}
              </span>
            </div>

            {/* 👉 KHU VỰC NGÀY SINH GỌN NHẸ (Gõ trực tiếp) */}
            <div className="t3-contact-item">
              <span className="t3-icon-golden">📅</span>{" "}
              <strong>Ngày sinh: </strong>
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

            {/* 👉 KHU VỰC GIỚI TÍNH */}
            <div className="t3-contact-item">
              <span className="t3-icon-golden">👤</span>{" "}
              <strong>Giới tính: </strong>
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

            <div className="t3-contact-item">
              <span className="t3-icon-golden">🏳️</span>{" "}
              <strong>Quốc tịch: </strong>{" "}
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

          <div className="t3-right-section">
            <h2 className="t3-right-title">Bổ sung</h2>
            <div
              className="t3-right-item"
              style={{ display: "flex", alignItems: "center" }}
            >
              <strong style={{ marginRight: "5px" }}>Kinh nghiệm:</strong>
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
                  borderBottom: "1px dotted rgba(255,255,255,0.4)",
                  outline: "none",
                }}
              >
                {cvData.experienceYears}
              </span>
              <span style={{ marginLeft: "4px" }}> năm</span>
            </div>
            <div
              className="t3-right-item"
              style={{ display: "flex", alignItems: "center" }}
            >
              <strong style={{ marginRight: "5px" }}>Mức lương:</strong>
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
                  color: "inherit",
                  borderBottom: "1px dotted rgba(255,255,255,0.4)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template3;
