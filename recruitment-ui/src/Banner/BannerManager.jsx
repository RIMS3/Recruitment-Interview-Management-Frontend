import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit, Plus, X, Upload, Loader2 } from 'lucide-react';
import './BannerManager.css'; // Đảm bảo bạn đã có file CSS này cùng thư mục

// Vite sẽ tự động lấy link từ .env.development (khi chạy local) 
// hoặc .env.production (khi build) và nối thêm /Banners
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/Banners`;

const BannerManager = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBanner, setCurrentBanner] = useState(null);
    const [formData, setFormData] = useState({ title: '', imageFile: null });
    const [preview, setPreview] = useState(null);

    // 1. Lấy danh sách Banner (GET)
    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_BASE_URL);
            setBanners(response.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    // 2. Xử lý khi chọn ảnh để Preview
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, imageFile: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    // 3. Thêm/Sửa Banner (POST/PUT)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('Title', formData.title);
        
        if (formData.imageFile) {
            data.append('ImageFile', formData.imageFile);
        }

        try {
            if (currentBanner) {
                await axios.put(`${API_BASE_URL}/${currentBanner.id}`, data);
                alert("Cập nhật thành công!");
            } else {
                await axios.post(API_BASE_URL, data);
                alert("Thêm mới thành công!");
            }
            closeModal();
            fetchBanners();
        } catch (error) {
            alert("Có lỗi xảy ra, vui lòng kiểm tra lại backend (hoặc CORS)!");
            console.error(error);
        }
    };

    // 4. Xóa Banner (DELETE)
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa banner này?")) {
            try {
                await axios.delete(`${API_BASE_URL}/${id}`);
                fetchBanners();
            } catch (error) {
                alert("Xóa thất bại!");
                console.error(error);
            }
        }
    };

    // 5. Quản lý Trạng thái Modal
    const openModal = (banner = null) => {
        if (banner) {
            setCurrentBanner(banner);
            setFormData({ title: banner.title, imageFile: null });
            setPreview(banner.imageUrl);
        } else {
            setCurrentBanner(null);
            setFormData({ title: '', imageFile: null });
            setPreview(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setPreview(null);
    };

    return (
        <div className="bm-container">
            <div className="bm-header">
                <h2>Quản lý Banner</h2>
                <button className="bm-btn-add" onClick={() => openModal()}>
                    <Plus size={18} /> Thêm Banner
                </button>
            </div>

            {loading ? (
                <div className="bm-loading">
                    <Loader2 className="spinner" size={40} />
                    <p>Đang tải dữ liệu API từ: {API_BASE_URL}</p>
                </div>
            ) : (
                <div className="bm-grid">
                    {banners.map((item) => (
                        <div key={item.id} className="bm-card">
                            <div className="bm-img-wrapper">
                                <img src={item.imageUrl} alt={item.title} className="bm-img" />
                            </div>
                            <div className="bm-info">
                                <h3 className="bm-title" title={item.title}>{item.title}</h3>
                                <div className="bm-actions">
                                    <button className="bm-btn-icon edit" onClick={() => openModal(item)}>
                                        <Edit size={18} />
                                    </button>
                                    <button className="bm-btn-icon delete" onClick={() => handleDelete(item.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {banners.length === 0 && (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666' }}>
                            Chưa có banner nào. Hãy thêm mới!
                        </p>
                    )}
                </div>
            )}

            {/* Modal Form */}
            {isModalOpen && (
                <div className="bm-modal-overlay">
                    <div className="bm-modal-content">
                        <div className="bm-modal-header">
                            <h3>{currentBanner ? 'Sửa Banner' : 'Thêm Banner Mới'}</h3>
                            <button type="button" className="bm-close-btn" onClick={closeModal}><X size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="bm-form">
                            <div className="bm-form-group">
                                <label>Tiêu đề banner</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="Nhập tiêu đề..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div className="bm-form-group">
                                <label>Hình ảnh</label>
                                <div className="bm-upload-area">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                        required={!currentBanner} // Bắt buộc chọn ảnh nếu là thêm mới
                                    />
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="bm-preview-img" />
                                    ) : (
                                        <div className="bm-upload-placeholder">
                                            <Upload size={32} />
                                            <p>Click để chọn ảnh</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button type="submit" className="bm-btn-submit">
                                {currentBanner ? 'Cập Nhật' : 'Lưu Banner'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BannerManager;