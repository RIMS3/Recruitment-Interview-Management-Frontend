import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, Clock, MapPin, Building2, 
  ChevronRight, X, ChevronLeft, Plus, Edit2, Trash2, 
  AlertTriangle, Filter, CheckCircle2, History
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; 
import './InterviewPage.css';

const InterviewPage = () => {
    const { companyId } = useParams();
    const today = new Date().toISOString().split('T')[0];
    
    // Lấy URL từ biến môi trường Vite
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSlotId, setEditingSlotId] = useState(null); 
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [slotToDelete, setSlotToDelete] = useState(null);
    const [selectedDate, setSelectedDate] = useState(today);
    const [currentPage, setCurrentPage] = useState(1);

    const [modalDate, setModalDate] = useState(today);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");

    // Hàm gọi API dùng chung
    const fetchData = useCallback(async () => {
        if (!companyId) return;
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/interview/slots`, { 
                params: { 
                    IdCompany: companyId, 
                    ChooesDate: selectedDate, 
                    CurrentPage: currentPage 
                }
            });
            setData(response.data);
        } catch (err) {
            console.error("Fetch Error:", err);
            toast.error("Không thể tải dữ liệu từ hệ thống.");
        } finally {
            setLoading(false);
        }
    }, [companyId, selectedDate, currentPage, API_BASE_URL]);

    useEffect(() => { 
        fetchData(); 
    }, [fetchData]);

    const handleOpenCreate = () => {
        setEditingSlotId(null);
        setModalDate(selectedDate);
        setStartTime("09:00");
        setEndTime("10:00");
        setShowModal(true);
    };

    const handleOpenEdit = (slot) => {
        setEditingSlotId(slot.idInterviewSlot);
        const sDate = new Date(slot.startTime);
        const eDate = new Date(slot.endTime);
        
        // Format YYYY-MM-DD
        setModalDate(sDate.toISOString().split('T')[0]);
        // Format HH:mm
        setStartTime(sDate.toTimeString().substring(0, 5));
        setEndTime(eDate.toTimeString().substring(0, 5));
        setShowModal(true);
    };

    const handleDelete = async () => {
        try {
            setIsSubmitting(true);
            const response = await axios.delete(`${API_BASE_URL}/interview/slots`, {
                data: { idCompany: companyId, idInterviewSlot: slotToDelete }
            });
            if (response.data) {
                toast.success("Đã xóa khung giờ thành công");
                fetchData();
            }
        } catch (err) { 
            toast.error("Lỗi khi xóa khung giờ"); 
        } finally { 
            setIsSubmitting(false); 
            setShowDeleteModal(false); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (startTime >= endTime) return toast.error("Giờ kết thúc phải sau giờ bắt đầu");
        
        try {
            setIsSubmitting(true);
            const payload = {
                idCompany: companyId,
                startTime: `${modalDate}T${startTime}:00`,
                endTime: `${modalDate}T${endTime}:00`,
                ...(editingSlotId && { idInterviewSlot: editingSlotId })
            };

            const res = editingSlotId 
                ? await axios.put(`${API_BASE_URL}/interview/slots`, payload)
                : await axios.post(`${API_BASE_URL}/interview/slots`, payload);
            
            if (res.data) {
                toast.success(editingSlotId ? "Cập nhật thành công" : "Tạo mới thành công");
                setShowModal(false);
                fetchData();
            }
        } catch (err) { 
            toast.error("Lỗi hệ thống khi lưu dữ liệu"); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    return (
        <div className="feature-wrapper">
            <Toaster position="top-right" />
            
            {/* Header Feature */}
            <div className="feature-header">
                <div className="header-left">
                    <div className="icon-badge"><Calendar size={24} /></div>
                    <div>
                        <h1>Quản lý khung giờ phỏng vấn</h1>
                        <p>{data?.nameCompany || 'Đang tải...'} • {data?.address || 'Địa chỉ'}</p>
                    </div>
                </div>
                <button className="btn-add-main" onClick={handleOpenCreate}>
                    <Plus size={20} /> Thiết lập khung giờ
                </button>
            </div>

            {/* Toolbar Lọc */}
            <div className="feature-toolbar">
                <div className="search-box">
                    <Filter size={18} />
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => {setSelectedDate(e.target.value); setCurrentPage(1);}}
                    />
                </div>
                <div className="feature-stats">
                    <div className="stat-item">
                        <CheckCircle2 size={16} color="#10b981" /> 
                        <span>{data?.interviewSlotItems?.length || 0} Khung giờ</span>
                    </div>
                </div>
            </div>

            {/* List Hiển thị Chi Tiết */}
            <div className="feature-content">
                {loading ? (
                    <div className="loader-box"><div className="spinner"></div></div>
                ) : (
                    <div className="slots-list">
                        {data?.interviewSlotItems?.length > 0 ? (
                            data.interviewSlotItems.map((slot, idx) => {
                                const start = new Date(slot.startTime);
                                const end = new Date(slot.endTime);
                                const duration = Math.round((end - start) / 60000);
                                
                                return (
                                    <div key={slot.idInterviewSlot || idx} className={`slot-item-row ${slot.isBooked ? 'booked' : ''}`}>
                                        <div className="slot-main-info">
                                            <div className="time-block">
                                                <Clock size={18} />
                                                <span className="time-range">
                                                    {start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})} 
                                                    - 
                                                    {end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}
                                                </span>
                                            </div>
                                            <div className="date-block">
                                                <span className="day-name">{start.toLocaleDateString('vi-VN', {weekday: 'long'})}</span>
                                                <span className="full-date">{start.toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </div>

                                        <div className="slot-details">
                                            <span className="duration-pill">{duration} phút</span>
                                            <div className={`status-indicator ${slot.isBooked ? 'is-booked' : 'is-available'}`}>
                                                <div className="dot"></div>
                                                {slot.isBooked ? 'Đã được đặt lịch' : 'Vẫn còn trống'}
                                            </div>
                                        </div>

                                        <div className="slot-actions">
                                            {!slot.isBooked ? (
                                                <>
                                                    <button className="btn-icon edit" onClick={() => handleOpenEdit(slot)} title="Chỉnh sửa">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className="btn-icon delete" onClick={() => {setSlotToDelete(slot.idInterviewSlot); setShowDeleteModal(true);}} title="Xóa">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button className="btn-view-candidate">Chi tiết ứng viên</button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-feature">
                                <History size={48} />
                                <p>Chưa có lịch phỏng vấn nào được thiết lập cho ngày này.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Phân trang */}
            {data?.numberOfPages > 1 && (
                <div className="pagination-minimal">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                        <ChevronLeft size={20}/>
                    </button>
                    <span>Trang {currentPage} / {data.numberOfPages}</span>
                    <button disabled={currentPage === data.numberOfPages} onClick={() => setCurrentPage(p => p + 1)}>
                        <ChevronRight size={20}/>
                    </button>
                </div>
            )}

            {/* Modal Thêm/Sửa */}
            {showModal && (
                <div className="overlay-modern">
                    <div className="modal-modern">
                        <div className="modal-head">
                            <h3>{editingSlotId ? "Cập nhật khung giờ" : "Tạo khung giờ mới"}</h3>
                            <X size={20} className="close" onClick={() => setShowModal(false)} />
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-body">
                                <div className="form-row">
                                    <label>Ngày phỏng vấn</label>
                                    <input type="date" value={modalDate} onChange={(e) => setModalDate(e.target.value)} required />
                                </div>
                                <div className="form-grid">
                                    <div><label>Bắt đầu</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required /></div>
                                    <div><label>Kết thúc</label><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required /></div>
                                </div>
                            </div>
                            <div className="modal-foot">
                                <button type="button" className="btn-text" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Đang lưu..." : "Xác nhận"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Xóa */}
            {showDeleteModal && (
                <div className="overlay-modern">
                    <div className="modal-confirm-modern">
                        <div className="warn-icon"><AlertTriangle size={32} /></div>
                        <h3>Xóa khung giờ này?</h3>
                        <p>Dữ liệu sẽ bị xóa vĩnh viễn và ứng viên sẽ không thể tìm thấy khung giờ này nữa.</p>
                        <div className="modal-foot">
                            <button className="btn-text" onClick={() => setShowDeleteModal(false)}>Quay lại</button>
                            <button className="btn-danger-final" onClick={handleDelete} disabled={isSubmitting}>
                                {isSubmitting ? "Đang xóa..." : "Xác nhận xóa"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewPage;