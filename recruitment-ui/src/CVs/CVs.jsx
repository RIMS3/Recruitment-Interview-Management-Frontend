import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./CVs.css";
import { AuthContext } from "../Auth/AuthContext";

import Template1 from "./Templates/Template1";
import Template2 from "./Templates/Template2";
import Template3 from "./Templates/Template3";

// =========================================================================
// COMPONENT CON: RENDER CV THẬT VÀ THU NHỎ LẠI (LIVE PREVIEW)
// =========================================================================
const CVThumbnail = ({ cvSummary }) => {
  const [fullCvData, setFullCvData] = useState(null);
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(0.3);

  // NẾU LÀ CV IMPORT (PDF/Word), KHÔNG CẦN FETCH DỮ LIỆU EDITOR NỮA
  const isImported = cvSummary.importedCvUrl || !cvSummary.templateId;

  useEffect(() => {
    if (isImported) return; // Bỏ qua fetch nếu là CV Import

    const fetchFullCv = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/cvs/${cvSummary.id}/editor`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setFullCvData(data);
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết CV preview", error);
      }
    };
    fetchFullCv();
  }, [cvSummary.id, isImported]);

  useEffect(() => {
    const updateScale = () => {
      if (wrapperRef.current) {
        const cardWidth = wrapperRef.current.offsetWidth;
        setScale(cardWidth / 794);
      }
    };

    setTimeout(updateScale, 50);
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const renderTemplate = () => {
    // RENDER PLACEHOLDER CHO CV IMPORT
    if (isImported)
      return (
        <div className="imported-cv-placeholder">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>CV Tải lên (PDF/Word)</span>
        </div>
      );

    if (!fullCvData)
      return (
        <div className="preview-loading">
          <div className="spinner"></div>
          <span>Đang tải CV...</span>
        </div>
      );

    const noop = () => {};
    const props = {
      cvData: fullCvData,
      handleTextChange: noop,
      handleArrayChange: noop,
      onAvatarClick: noop,
    };

    switch (cvSummary.templateId) {
      case "tpl-1":
        return <Template1 {...props} />;
      case "tpl-2":
        return <Template2 {...props} />;
      case "tpl-3":
        return <Template3 {...props} />;
      default:
        return <Template1 {...props} />;
    }
  };

  return (
    <div className="cv-preview-wrapper" ref={wrapperRef}>
      <div
        className="cv-preview-scaler"
        style={{ transform: `scale(${scale})` }}
      >
        {renderTemplate()}
      </div>
    </div>
  );
};

// =========================================================================
// COMPONENT CHÍNH: QUẢN LÝ CV (MANAGE CV)
// =========================================================================
const CVManagement = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchingJob, setIsSearchingJob] = useState(false);

  // --- STATE QUẢN LÝ GIỚI HẠN TẠO CV ---
  const [canCreateNew, setCanCreateNew] = useState(true);
  const [cvCountInfo, setCvCountInfo] = useState({ current: 0, isPro: false });

  // --- STATE QUẢN LÝ IMPORT CV ---
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  // --- STATE QUẢN LÝ POPUP THAY CHO ALERT/CONFIRM ---
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "alert", // 'alert' hoặc 'confirm'
    message: "",
    onConfirm: null,
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Đưa hàm fetch ra ngoài để tái sử dụng khi Import xong
  const fetchMyCVs = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      let realCandidateId = user?.candidateId;

      if (!realCandidateId) {
        const profileResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/cvs/my-candidate-id`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          realCandidateId = profileData.candidateId;
        } else {
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/cvs/candidate/${realCandidateId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setCvs(data.cvs || []);
        setCanCreateNew(data.canCreateNew);
        setCvCountInfo({ current: data.currentCvCount, isPro: data.isCvPro });
      }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCVs();
  }, [user]);

  const handleCreateCV = () => navigate("/cv-templates");
  const handleToggleJobSearch = () => setIsSearchingJob(!isSearchingJob);

  // =========================================================================
  // XỬ LÝ IMPORT CV
  // =========================================================================
  const handleImportClick = () => {
    if (!canCreateNew) {
      showAlert("Bạn đã đạt giới hạn tạo CV. Hãy nâng cấp CV Pro để tiếp tục!");
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    event.target.value = null; // Reset value để có thể chọn lại file cũ nếu lỗi

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      showAlert("Vui lòng chọn file PDF hoặc Word (.doc, .docx)");
      return;
    }

    setIsImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/cvs/import`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (response.ok) {
        showAlert("Tải CV lên hệ thống thành công!");
        fetchMyCVs(); // Tải lại danh sách CV
      } else {
        const errorData = await response.json();
        showAlert(errorData.message || "Có lỗi xảy ra khi tải CV.");
      }
    } catch (error) {
      console.error("Lỗi API import CV:", error);
      showAlert("Không thể kết nối đến máy chủ.");
    } finally {
      setIsImporting(false);
    }
  };

  // Lấy chữ cái đầu của tên làm Avatar
  const getInitial = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  // =========================================================================
  // HELPER MỞ/ĐÓNG POPUP & XÓA CV
  // =========================================================================
  const showAlert = (message) => {
    setPopup({ isOpen: true, type: "alert", message, onConfirm: null });
  };

  const showConfirm = (message, onConfirmCallback) => {
    setPopup({
      isOpen: true,
      type: "confirm",
      message,
      onConfirm: onConfirmCallback,
    });
  };

  const closePopup = () => {
    setPopup((prev) => ({ ...prev, isOpen: false }));
  };

  const requestDeleteCV = (cvId) => {
    showConfirm(
      "Bạn có chắc chắn muốn xóa bản CV này không? Hành động này không thể hoàn tác.",
      () => {
        executeDeleteCV(cvId);
      },
    );
  };

  const executeDeleteCV = async (cvId) => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/cvs/${cvId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        showAlert(data.message || "Xóa CV thành công!");

        setCvs((prevCvs) => {
          const updatedCvs = prevCvs.filter((cv) => cv.id !== cvId);
          const newCount = updatedCvs.length;

          if (!cvCountInfo.isPro && newCount < 2) {
            setCanCreateNew(true);
          }
          setCvCountInfo((prev) => ({ ...prev, current: newCount }));

          return updatedCvs;
        });
      } else {
        showAlert("Có lỗi xảy ra khi xóa CV. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Lỗi gọi API xóa CV:", error);
      showAlert("Không thể kết nối đến máy chủ.");
    }
  };

  // =========================================================================
  // XỬ LÝ XEM/TẢI CV IMPORT
  // =========================================================================
  const handleViewImportedCv = async (cvId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/cvs/${cvId}/view-import`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        // Mở URL file PDF/Word sang một Tab mới
        window.open(data.url, "_blank");
      } else {
        const err = await response.json();
        showAlert(err.message || "Không thể lấy liên kết file CV.");
      }
    } catch (error) {
      console.error("Lỗi xem file Import:", error);
      showAlert("Không thể kết nối đến máy chủ.");
    }
  };

  return (
    <div className="topcv-container">
      {/* BANNER GỢI Ý VIỆC LÀM */}
      <div className="banner-wrapper">
        <div className="banner">
          <div className="banner-content">
            <span className="banner-icon">💡</span>
            <span>
              Hãy chia sẻ nhu cầu công việc để nhận gợi ý việc làm tốt nhất và
              phù hợp nhất với bạn.
            </span>
          </div>
          <button className="btn-update-job">Cập nhật nhu cầu →</button>
        </div>
      </div>

      <main className="main-content">
        <section className="cv-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">CV đã tạo trên hệ thống</h2>
              <p className="section-subtitle">
                Quản lý và chỉnh sửa các bản CV của bạn
              </p>
            </div>

            {/* KHU VỰC NÚT TẠO CV MỚI VÀ IMPORT CV */}
            <div className="header-actions">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  className="btn-import-cv"
                  onClick={handleImportClick}
                  disabled={!canCreateNew || isImporting}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  {isImporting ? "Đang tải lên..." : "Import CV"}
                </button>

                <button
                  className="btn-create-cv"
                  onClick={handleCreateCV}
                  disabled={!canCreateNew}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Tạo CV mới
                </button>
              </div>

              {!canCreateNew && (
                <div className="limit-warning-container">
                  <span className="limit-warning-text">
                    Bạn đang có {cvCountInfo.current} CV. Hãy nâng cấp CV Pro để
                    tạo không giới hạn!
                  </span>
                  <button
                    className="btn-upgrade-pro"
                    onClick={() => navigate("/upgrade-cv-pro")}
                  >
                    ⭐ Nâng cấp ngay
                  </button>
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="empty-state">
              <div className="spinner-large"></div>
              <p>Đang tải danh sách CV của bạn...</p>
            </div>
          ) : cvs.length === 0 ? (
            <div className="empty-state">
              <img
                src="https://cdn-icons-png.flaticon.com/512/7486/7486747.png"
                alt="Empty CV"
                className="empty-img"
              />
              <h3>Bạn chưa có bản CV nào</h3>
              <p>
                Hãy tạo hoặc import ngay một bản CV chuyên nghiệp để gây ấn
                tượng với nhà tuyển dụng nhé!
              </p>
              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button className="btn-import-cv" onClick={handleImportClick}>
                  Import CV
                </button>
                <button className="btn-create-cv" onClick={handleCreateCV}>
                  Tạo CV ngay
                </button>
              </div>
            </div>
          ) : (
            <div className="cv-grid">
              {cvs.map((cv) => {
                const isImported = cv.importedCvUrl || !cv.templateId;

                return (
                  <div className="cv-card" key={cv.id}>
                    {/* Cập nhật Link: Nếu là CV Import thì hiển thị thông báo thay vì chuyển trang */}
                    <div
                      className="cv-image-link"
                      onClick={() => {
                        if (!isImported) {
                          navigate(`/create-cv/${cv.id}`);
                        } else {
                          handleViewImportedCv(cv.id); // Gọi hàm mở file ở tab mới
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <CVThumbnail cvSummary={cv} />
                      {/* Hiệu ứng lớp phủ khi Hover */}
                      <div className="cv-hover-overlay">
                        <span className="edit-badge">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {isImported ? (
                              <>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </>
                            ) : (
                              <>
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </>
                            )}
                          </svg>
                          {isImported ? "Tài liệu Import" : "Chỉnh sửa CV"}
                        </span>
                      </div>
                    </div>
                    <div className="cv-info">
                      <h3
                        className="cv-title"
                        title={cv.fullName || "CV chưa đặt tên"}
                      >
                        {cv.fullName || "CV chưa đặt tên"}
                      </h3>
                      <p className="cv-position">
                        {cv.position || "Chưa cập nhật vị trí ứng tuyển"}
                      </p>
                      <div className="cv-meta">
                        <span className="cv-date">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          Cập nhật: {formatDate(cv.updatedAt)}
                        </span>

                        <button
                          className="btn-delete-cv"
                          onClick={() => requestDeleteCV(cv.id)}
                          title="Xóa CV này"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="sidebar">
          <div className="profile-card box-shadow">
            <div className="profile-info">
              <div className="avatar-lg">{getInitial(user?.fullName)}</div>
              <div className="profile-text">
                <p className="welcome-text">Chào mừng trở lại,</p>
                <h3 className="profile-name">
                  {user ? user.fullName : "Ứng viên"}
                </h3>
                <span className="badge-verified">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Tài khoản xác thực
                </span>
              </div>
            </div>
          </div>

          <div className="status-card box-shadow">
            <div className="toggle-row">
              <div className="toggle-text-group">
                <span className="toggle-label">Trạng thái tìm việc</span>
                <span
                  className={`status-badge ${isSearchingJob ? "active" : ""}`}
                >
                  {isSearchingJob ? "Đang bật" : "Đang tắt"}
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isSearchingJob}
                  onChange={handleToggleJobSearch}
                />
                <span className="slider round green"></span>
              </label>
            </div>
            <div className="divider"></div>
            <p className="description">
              Bật trạng thái tìm việc để nhận được nhiều cơ hội việc làm tốt
              nhất từ các nhà tuyển dụng hàng đầu trên hệ thống.
            </p>
          </div>
        </aside>
      </main>

      {/* RENDER POPUP TẠI ĐÂY */}
      {popup.isOpen && (
        <div className="custom-popup-overlay">
          <div className="custom-popup-box">
            <h4 className="custom-popup-title">
              {popup.type === "confirm" ? "Xác nhận" : "Thông báo"}
            </h4>
            <p className="custom-popup-message">{popup.message}</p>
            <div className="custom-popup-actions">
              {popup.type === "confirm" && (
                <button className="btn-popup-cancel" onClick={closePopup}>
                  Hủy
                </button>
              )}
              <button
                className={`btn-popup-confirm ${popup.type === "alert" ? "btn-primary" : "btn-danger"}`}
                onClick={() => {
                  if (popup.onConfirm) popup.onConfirm();
                  closePopup();
                }}
              >
                {popup.type === "confirm" ? "Xóa" : "Đóng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVManagement;
