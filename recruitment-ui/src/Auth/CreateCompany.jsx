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
        method: "POST", // Nhớ thêm method POST
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Tạo công ty thành công!", { id: toastId });

        // LƯU CÁC ID QUAN TRỌNG VÀO LOCAL STORAGE
        if (result.companyId) localStorage.setItem("companyId", result.companyId);
        if (result.employerId) localStorage.setItem("employerId", result.employerId);

        console.log("Success:", result);

        setTimeout(() => {
          navigate("/"); // Về trang chủ hoặc Dashboard Nhà tuyển dụng
        }, 1500);

      } else {
        toast.error(result.message || "Có lỗi xảy ra", { id: toastId });
      }

    } catch (error) {
      console.error("Create Company Error:", error);
      toast.error("Không thể kết nối server", { id: toastId });
    }
  };

  return (
    <div className="create-company-container">
      <div className="create-company-card">
        <h2 className="title">Thiết lập Hồ sơ Công ty</h2>
        <p className="subtitle">Vui lòng cung cấp thông tin để bắt đầu đăng tin tuyển dụng</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên công ty *</label>
            <input
              type="text"
              name="name"
              placeholder="VD: IT Locak Software"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mã số thuế</label>
              <input
                type="text"
                name="taxCode"
                value={formData.taxCode}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input
                type="text"
                name="website"
                placeholder="https://..."
                value={formData.website}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Địa chỉ trụ sở</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Logo URL (Link ảnh)</label>
            <input
              type="text"
              name="logoUrl"
              placeholder="Gán link ảnh logo tại đây"
              value={formData.logoUrl}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mô tả về công ty</label>
            <textarea
              name="description"
              rows="4"
              placeholder="Giới thiệu ngắn gọn về công ty của bạn..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit-btn">
            Hoàn tất & Lưu hồ sơ
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCompany;