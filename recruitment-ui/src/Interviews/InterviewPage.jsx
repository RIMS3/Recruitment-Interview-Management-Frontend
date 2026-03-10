import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, Clock, MapPin, Building2, 
  ChevronRight, Filter, X, ChevronLeft, Plus, Edit2, Trash2, AlertTriangle 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; 
import './InterviewPage.css';

const InterviewPage = () => {
    const { companyId } = useParams();
    const today = new Date().toISOString().split('T')[0];
    
    // Lấy Base URL từ biến môi trường (Ví dụ: https://localhost:7272/api)
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    
    // States dữ liệu
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // States cho Modal Thêm/Sửa
    const [showModal, setShowModal] = useState(false);
    const [editingSlotId, setEditingSlotId] = useState(null); 
    
    // States cho Modal Xác nhận xóa hiện đại
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [slotToDelete, setSlotToDelete] = useState(null);

    // States phân trang và lọc
    const [selectedDate, setSelectedDate] = useState(today);
    const [currentPage, setCurrentPage] = useState(1);

    // States form
    const [modalDate, setModalDate] = useState(today);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");

    const fetchData = useCallback(async () => {
        if (!companyId) return;
        try {
            setLoading(true);
            // SỬA: Dùng API_BASE_URL và bỏ /api
            const response = await axios.get(`${API_BASE_URL}/interview/slots`, { 
                params: {  
                    IdCompany: companyId, 
                    ChooesDate: selectedDate,
                    CurrentPage: currentPage 
                }
            });
            setData(response.data);
        } catch (err) {
            toast.error("Không thể kết nối đến máy chủ!");
        } finally {
            setLoading(false);
        }
    }, [companyId, selectedDate, currentPage, API_BASE_URL]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenCreate = () => {
        setEditingSlotId(null);
        setModalDate(today);
        setStartTime("09:00");
        setEndTime("10:00");
        setShowModal(true);
    };

    const handleOpenEdit = (slot) => {
        setEditingSlotId(slot.idInterviewSlot);
        const sDate = new Date(slot.startTime);
        const eDate = new Date(slot.endTime);
        setModalDate(sDate.toISOString().split('T')[0]);
        setStartTime(sDate.toTimeString().substring(0, 5));
        setEndTime(eDate.toTimeString().substring(0, 5));
        setShowModal(true);
    };

    // Mở Modal xác nhận xóa thay vì dùng confirm()
    const openConfirmDelete = (slotId) => {
        setSlotToDelete(slotId);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!slotToDelete) return;
        try {
            setIsSubmitting(true);
            // SỬA: Dùng API_BASE_URL và bỏ /api
            const response = await axios.delete(`${API_BASE_URL}/interview/slots`, {
                data: { idCompany: companyId, idInterviewSlot: slotToDelete }
            });

            if (response.data === true) {
                toast.success("Đã xóa khung giờ thành công!");
                fetchData();
            } else {
                toast.error("Xóa thất bại. Khung giờ có thể đã bị đặt.");
            }
        } catch (err) {
            toast.error("Lỗi kết nối khi xóa.");
        } finally {
            setIsSubmitting(false);
            setShowDeleteModal(false);
            setSlotToDelete(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (startTime >= endTime) {
            toast.error("Giờ kết thúc phải sau giờ bắt đầu!");
            return;
        }

        try {
            setIsSubmitting(true);
            const fullStartTime = `${modalDate}T${startTime}:00`;
            const fullEndTime = `${modalDate}T${endTime}:00`;

            const payload = {
                idCompany: companyId,
                startTime: fullStartTime,
                endTime: fullEndTime
            };

            let response;
            if (editingSlotId) {
                payload.idInterviewSlot = editingSlotId;
                // SỬA: Dùng API_BASE_URL và bỏ /api
                response = await axios.put(`${API_BASE_URL}/interview/slots`, payload);
            } else {
                // SỬA: Dùng API_BASE_URL và bỏ /api
                response = await axios.post(`${API_BASE_URL}/interview/slots`, payload);
            }
            
            if (response.data === true) {
                toast.success(editingSlotId ? "Cập nhật thành công!" : "Tạo lịch thành công!");
                setShowModal(false);
                fetchData(); 
            } else {
                toast.error("Thao tác thất bại. Trùng khung giờ.");
            }
        } catch (err) {
            toast.error("Lỗi kết nối server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="interview-container">
            <Toaster position="top-right" reverseOrder={false} />
            
            <div className="max-width-wrapper">
                <header className="company-header">
                    <div className="flex-header">
                        {data?.urlLogoImage ? (
                            <img src={data.urlLogoImage} alt="logo" className="company-logo" />
                        ) : (
                            <div className="logo-placeholder"><Building2 size={24} /></div>
                        )}
                        <div>
                            <h1 className="company-name">{data?.nameCompany || "Đang tải..."}</h1>
                            <div className="company-meta">
                                <span className="flex-header" style={{gap: '4px'}}>
                                    <MapPin size={12} /> {data?.address}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="btn-primary btn-sm" onClick={handleOpenCreate}>
                        <Plus size={18} /> <span>Tạo lịch</span>
                    </button>
                </header>

                <div className="filter-toolbar">
                    <div className="filter-group">
                        <label className="filter-label"><Filter size={14} /> Lọc ngày:</label>
                        <input 
                            type="date" 
                            className="filter-date-input"
                            value={selectedDate}
                            onChange={(e) => {setSelectedDate(e.target.value); setCurrentPage(1);}}
                        />
                    </div>
                    <div className="page-info">Trang {currentPage} / {data?.numberOfPages || 1}</div>
                </div>

                {loading ? <div className="spinner"></div> : (
                    <>
                        <div className="slots-grid">
                            {data?.interviewSlotItems?.length > 0 ? (
                                data.interviewSlotItems.map((slot, index) => (
                                    <div key={index} className="slot-card">
                                        <div className="slot-card-header">
                                            <span className={`status-badge ${slot.isBooked ? 'status-booked' : 'status-free'}`}>
                                                {slot.isBooked ? 'Đã đặt' : 'Sẵn sàng'}
                                            </span>
                                            {!slot.isBooked && (
                                                <div className="action-buttons">
                                                    <button className="btn-edit-icon" onClick={() => handleOpenEdit(slot)}>
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button className="btn-delete-icon" onClick={() => openConfirmDelete(slot.idInterviewSlot)}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="time-row">
                                            <Clock size={18} />
                                            {new Date(slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            <ChevronRight size={14} />
                                            {new Date(slot.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                        <div className="date-row">
                                            <Calendar size={14} /> {new Date(slot.startTime).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">Không có lịch cho ngày này.</div>
                            )}
                        </div>

                        {data?.numberOfPages > 1 && (
                            <div className="pagination-container">
                                <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={18}/></button>
                                {[...Array(data.numberOfPages)].map((_, i) => (
                                    <button key={i} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                ))}
                                <button className="page-btn" disabled={currentPage === data.numberOfPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={18}/></button>
                            </div>
                        )}
                    </>
                )}

                {/* Modal Thêm/Sửa */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>{editingSlotId ? "Cập nhật khung giờ" : "Thiết lập khung giờ"}</h3>
                                <X size={20} className="close-icon" onClick={() => setShowModal(false)} />
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="filter-label">Chọn ngày phỏng vấn</label>
                                    <input type="date" className="filter-date-input w-full" value={modalDate} onChange={(e) => setModalDate(e.target.value)} required />
                                </div>
                                <div className="time-picker-grid">
                                    <div className="form-group">
                                        <label className="filter-label">Giờ bắt đầu</label>
                                        <input type="time" className="filter-date-input w-full" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="filter-label">Giờ kết thúc</label>
                                        <input type="time" className="filter-date-input w-full" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Đóng</button>
                                    <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
                                        {isSubmitting ? "Đang lưu..." : editingSlotId ? "Lưu thay đổi" : "Xác nhận tạo"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Xác nhận xóa hiện đại */}
                {showDeleteModal && (
                    <div className="modal-overlay">
                        <div className="modal-content modal-confirm">
                            <div className="confirm-icon-wrapper">
                                <AlertTriangle size={32} color="#ef4444" />
                            </div>
                            <h3>Xác nhận xóa?</h3>
                            <p>Bạn có chắc chắn muốn xóa khung giờ phỏng vấn này không? Hành động này không thể hoàn tác.</p>
                            <div className="modal-actions">
                                <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Hủy bỏ</button>
                                <button className="btn-danger-confirm" onClick={handleDelete} disabled={isSubmitting}>
                                    {isSubmitting ? "Đang xóa..." : "Đúng, xóa nó"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewPage;