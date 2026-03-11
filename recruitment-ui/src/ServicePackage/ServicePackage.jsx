import React, { useState, useEffect } from 'react';
import './ServicePackage.css'; // Nhúng file CSS vừa tạo

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/ServicePackages`;

const ServicePackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null, name: '', description: '', price: 0, durationDays: 30, maxPost: 10, isActive: true
  });

  // Fetch dữ liệu khi load component
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setPackages(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      alert("Không thể tải danh sách Service Package!");
    } finally {
      setLoading(false);
    }
  };

  // Mở modal Thêm mới
  const handleOpenCreate = () => {
    setFormData({ id: null, name: '', description: '', price: 0, durationDays: 30, maxPost: 10, isActive: true });
    setIsModalOpen(true);
  };

  // Mở modal Cập nhật
  const handleOpenEdit = (pkg) => {
    setFormData({ ...pkg });
    setIsModalOpen(true);
  };

  // Lưu dữ liệu (Thêm mới hoặc Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isUpdate = formData.id !== null;
    const url = isUpdate ? `${API_URL}/${formData.id}` : API_URL;
    const method = isUpdate ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchPackages(); // Tải lại danh sách
      } else {
        alert("Có lỗi xảy ra khi lưu!");
      }
    } catch (error) {
      console.error("Lỗi lưu dữ liệu:", error);
    }
  };

  // Xóa dữ liệu
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa gói dịch vụ này không?")) return;
    
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchPackages();
      } else {
        alert("Lỗi khi xóa!");
      }
    } catch (error) {
      console.error("Lỗi xóa dữ liệu:", error);
    }
  };

  return (
    <div className="sp-container">
      <div className="sp-header">
        <h2>Quản lý Gói Dịch Vụ (Service Packages)</h2>
        <button className="btn-primary" onClick={handleOpenCreate}>+ Thêm Mới</button>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div className="sp-table-wrapper">
          <table className="sp-table">
            <thead>
              <tr>
                <th>Tên Gói</th>
                <th>Giá (VNĐ)</th>
                <th>Thời gian (Ngày)</th>
                <th>Tối đa bài đăng</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id}>
                  <td><strong>{pkg.name}</strong></td>
                  <td>{pkg.price?.toLocaleString()}</td>
                  <td>{pkg.durationDays}</td>
                  <td>{pkg.maxPost}</td>
                  <td>
                    <span className={`status-badge ${pkg.isActive ? 'status-active' : 'status-inactive'}`}>
                      {pkg.isActive ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => handleOpenEdit(pkg)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDelete(pkg.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{formData.id ? 'Cập nhật Gói Dịch Vụ' : 'Thêm Gói Dịch Vụ Mới'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên gói</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea rows="2" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div style={{display: 'flex', gap: '1rem'}}>
                <div className="form-group" style={{flex: 1}}>
                  <label>Giá</label>
                  <input required type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label>Số ngày</label>
                  <input required type="number" value={formData.durationDays} onChange={(e) => setFormData({...formData, durationDays: Number(e.target.value)})} />
                </div>
              </div>
              <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                <div className="form-group" style={{flex: 1}}>
                  <label>Tối đa bài đăng</label>
                  <input required type="number" value={formData.maxPost} onChange={(e) => setFormData({...formData, maxPost: Number(e.target.value)})} />
                </div>
                <div className="form-group" style={{flex: 1, flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem'}}>
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} id="isActiveCheck" />
                  <label htmlFor="isActiveCheck" style={{marginBottom: 0}}>Hoạt động</label>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePackageManagement;