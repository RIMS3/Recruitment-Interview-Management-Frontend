import React, { useState } from "react";
import "./CreateCompany.css";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_BASE_URL;

const CreateCompany = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    taxCode: "",
    address: "",
    website: "",
    description: "",
    logoUrl: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Vui lòng nhập tên công ty");
      return;
    }
    const toastId = toast.loading("Đang tạo hồ sơ công ty...");
    try {
      const response = await fetch(`${API}/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Tạo công ty thành công!", { id: toastId });
        if (result.companyId) localStorage.setItem("companyId", result.companyId);
        if (result.employerId) localStorage.setItem("employerId", result.employerId);
        setTimeout(() => { navigate("/"); }, 1500);
      } else {
        toast.error(result.message || "Có lỗi xảy ra", { id: toastId });
      }
    } catch (error) {
      console.error("Create Company Error:", error);
      toast.error("Không thể kết nối server", { id: toastId });
    }
  };

  return (
    <div className="night-sky-wrapper">
      {/* --- NỀN VŨ TRỤ --- */}
      <div className="stars"></div>
      <div className="crescent-moon"></div>
      
      {/* Sao băng cũ */}
      <div className="shooting-star star-1"></div>
      <div className="shooting-star star-2"></div>
      <div className="shooting-star star-3"></div>

      {/* --- PHI THUYỀN UFO MỚI (Vẽ bằng CSS) --- */}
      {/* Chiếc 1: Bay từ phải sang trái, xuất hiện sau 10s */}
      <div className="ufo-container ufo-1">
        <div className="ufo-body">
          <div className="ufo-cockpit"></div>
          <div className="ufo-lights">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
      </div>

      {/* Chiếc 2: Bay chéo từ trên xuống, xuất hiện sau 25s */}
      <div className="ufo-container ufo-2">
        <div className="ufo-body blue-ufo">
          <div className="ufo-cockpit cockpit-blue"></div>
          <div className="ufo-lights lights-blue">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
      </div>

      {/* --- THẺ FORM CHÍNH --- */}
      <div className="glass-card">
        <div className="company-header-text">
          <h2 className="title">Thiết lập Hồ sơ</h2>
          <p className="subtitle">Bắt đầu hành trình tìm kiếm nhân tài cho doanh nghiệp.</p>
        </div>

        <form onSubmit={handleSubmit} className="company-form">
          <div className="form-group full-width">
            <label>Tên công ty <span className="required">*</span></label>
            <div className="input-modern">
              <input type="text" name="name" placeholder="VD: IT Locak Technology" required value={formData.name} onChange={handleChange} />
              <div className="glow-line"></div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mã số thuế</label>
              <div className="input-modern">
                <input type="text" name="taxCode" placeholder="0101234567" value={formData.taxCode} onChange={handleChange} />
                <div className="glow-line"></div>
              </div>
            </div>
            <div className="form-group">
              <label>Website</label>
              <div className="input-modern">
                <input type="text" name="website" placeholder="https://..." value={formData.website} onChange={handleChange} />
                <div className="glow-line"></div>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Địa chỉ trụ sở</label>
              <div className="input-modern">
                <input type="text" name="address" placeholder="Quận/huyện, thành phố..." value={formData.address} onChange={handleChange} />
                <div className="glow-line"></div>
              </div>
            </div>
            <div className="form-group">
              <label>Logo URL</label>
              <div className="input-modern">
                <input type="text" name="logoUrl" placeholder="Link ảnh logo" value={formData.logoUrl} onChange={handleChange} />
                <div className="glow-line"></div>
              </div>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Mô tả doanh nghiệp</label>
            <div className="input-modern textarea-modern">
              <textarea name="description" rows="2" placeholder="Lĩnh vực hoạt động, chế độ phúc lợi..." value={formData.description} onChange={handleChange} />
              <div className="glow-line"></div>
            </div>
          </div>

          <button type="submit" className="submit-company-btn">
            Hoàn tất & Lưu hồ sơ
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCompany;