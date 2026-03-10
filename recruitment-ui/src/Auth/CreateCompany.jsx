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

    const toastId = toast.loading("Đang tạo công ty...");

    try {
      const response = await fetch("https://localhost:7272/api/companies", {
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

        console.log(result);

        setTimeout(() => {
          navigate("/");
        }, 1200);

      } else {

        toast.error(result.message || "Có lỗi xảy ra", { id: toastId });

      }

    } catch (error) {

      console.error(error);
      toast.error("Không thể kết nối server", { id: toastId });

    }
  };

  return (
    <div className="create-company-container">
      <div className="create-company-card">
        <h2 className="title">Create Company Profile</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Tax Code</label>
            <input
              type="text"
              name="taxCode"
              value={formData.taxCode}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Website</label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Logo URL</label>
            <input
              type="text"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit-btn">
            Create Company
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCompany;