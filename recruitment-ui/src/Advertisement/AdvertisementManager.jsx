import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit, Plus, X, Upload, Loader2, Link as LinkIcon, Clock, MonitorPlay } from 'lucide-react';
import './AdvertisementManager.css';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/Advertisements`;

const AdvertisementManager = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAd, setCurrentAd] = useState(null);
    const [formData, setFormData] = useState({ title: '', duration: 5, linkUrl: '', isPopup: false, imageFile: null });
    const [preview, setPreview] = useState(null);

    const fetchAds = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_BASE_URL);
            setAds(response.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAds(); }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, imageFile: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('Title', formData.title);
        data.append('Duration', formData.duration);
        data.append('IsPopup', formData.isPopup); // Gửi cờ IsPopup xuống Backend
        
        if (formData.linkUrl) data.append('LinkUrl', formData.linkUrl);
        if (formData.imageFile) data.append('ImageFile', formData.imageFile);

        try {
            if (currentAd) {
                await axios.put(`${API_BASE_URL}/${currentAd.id}`, data);
                alert("Cập nhật quảng cáo thành công!");
            } else {
                await axios.post(API_BASE_URL, data);
                alert("Thêm mới quảng cáo thành công!");
            }
            closeModal();
            fetchAds();
        } catch (error) {
            alert("Có lỗi xảy ra, vui lòng kiểm tra lại kết nối!");
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa quảng cáo này?")) {
            try {
                await axios.delete(`${API_BASE_URL}/${id}`);
                fetchAds();
            } catch (error) {
                alert("Xóa thất bại!");
            }
        }
    };

    const openModal = (ad = null) => {
        if (ad) {
            setCurrentAd(ad);
            setFormData({ 
                title: ad.title, 
                duration: ad.duration, 
                linkUrl: ad.linkUrl || '', 
                isPopup: ad.isPopup || false,
                imageFile: null 
            });
            setPreview(ad.imageUrl);
        } else {
            setCurrentAd(null);
            setFormData({ title: '', duration: 5, linkUrl: '', isPopup: false, imageFile: null });
            setPreview(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setPreview(null);
    };

    return (
        <div className="am-container">
            <div className="am-header">
                <h2>Quản lý Quảng Cáo</h2>
                <button className="am-btn-add" onClick={() => openModal()}>
                    <Plus size={18} /> Thêm Quảng Cáo
                </button>
            </div>

            {loading ? (
                <div className="am-loading">
                    <Loader2 className="spinner" size={40} />
                    <p>Đang tải dữ liệu...</p>
                </div>
            ) : (
                <div className="am-grid">
                    {ads.map((item) => (
                        <div key={item.id} className="am-card" style={{ position: 'relative' }}>
                            {/* HUY HIỆU BÁO ĐANG HIỂN THỊ Ở POPUP */}
                            {item.isPopup && (
                                <span style={{ position: 'absolute', top: 10, left: 10, background: '#ffc107', color: '#000', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4, zIndex: 2}}>
                                    <MonitorPlay size={14} /> POPUP
                                </span>
                            )}
                            <div className="am-img-wrapper">
                                <img src={item.imageUrl} alt={item.title} className="am-img" />
                            </div>
                            <div className="am-info">
                                <h3 className="am-title" title={item.title}>{item.title}</h3>
                                
                                <div className="am-meta-info" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px'}}>
                                    <span className="am-meta-item" title="Thời gian hiển thị">
                                        <Clock size={14} /> {item.duration}s
                                    </span>
                                    {item.linkUrl && (
                                        <span className="am-meta-item am-link-item" title={item.linkUrl}>
                                            <LinkIcon size={14} /> {item.linkUrl}
                                        </span>
                                    )}
                                </div>

                                <div className="am-actions">
                                    <button className="am-btn-icon edit" onClick={() => openModal(item)}><Edit size={18} /></button>
                                    <button className="am-btn-icon delete" onClick={() => handleDelete(item.id)}><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {ads.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666' }}>Chưa có quảng cáo nào.</p>}
                </div>
            )}

            {isModalOpen && (
                <div className="am-modal-overlay">
                    <div className="am-modal-content">
                        <div className="am-modal-header">
                            <h3>{currentAd ? 'Sửa Quảng Cáo' : 'Thêm Quảng Cáo Mới'}</h3>
                            <button type="button" className="am-close-btn" onClick={closeModal}><X size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="am-form">
                            <div className="am-form-group">
                                <label>Tiêu đề</label>
                                <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                            </div>

                            <div className="am-form-row">
                                <div className="am-form-group half">
                                    <label>Thời gian (giây)</label>
                                    <input type="number" min="1" required value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
                                </div>
                                <div className="am-form-group half">
                                    <label>Đường dẫn click (Tùy chọn)</label>
                                    <input type="url" placeholder="https://..." value={formData.linkUrl} onChange={(e) => setFormData({...formData, linkUrl: e.target.value})} />
                                </div>
                            </div>

                            {/* CHECKBOX CHỌN POPUP */}
                            <div className="am-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', marginBottom: '10px'}}>
                                <input 
                                    type="checkbox" 
                                    id="isPopupCheck"
                                    checked={formData.isPopup}
                                    onChange={(e) => setFormData({...formData, isPopup: e.target.checked})}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer'}}
                                />
                                <label htmlFor="isPopupCheck" style={{ margin: 0, cursor: 'pointer' }}>Hiển thị trong Popup (Giữa màn hình)</label>
                            </div>

                            <div className="am-form-group">
                                <label>Hình ảnh</label>
                                <div className="am-upload-area">
                                    <input type="file" accept="image/*" onChange={handleFileChange} required={!currentAd} />
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="am-preview-img" />
                                    ) : (
                                        <div className="am-upload-placeholder"><Upload size={32} /><p>Click hoặc kéo thả ảnh</p></div>
                                    )}
                                </div>
                            </div>

                            <button type="submit" className="am-btn-submit">
                                {currentAd ? 'Cập Nhật' : 'Lưu Quảng Cáo'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvertisementManager;