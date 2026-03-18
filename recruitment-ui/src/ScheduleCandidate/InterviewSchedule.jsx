import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2"; // Import thư viện thông báo xịn sò
import "./InterviewSchedule.css";

const InterviewSchedule = () => {
  const { token } = useParams();
  
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 1. Gọi API lấy danh sách ca phỏng vấn
  useEffect(() => {
    const fetchSlots = async () => {
      if (!token) {
        setError("Không tìm thấy mã xác thực (Token) trong đường dẫn.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/schedule/${token}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Lịch phỏng vấn không tồn tại hoặc đã hết hạn.");
        }
        
        const data = await response.json();
        setSlots(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (API_BASE_URL) {
      fetchSlots();
    }
  }, [token, API_BASE_URL]);

  // 2. Các hàm format hiển thị
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const groupedSlots = slots.reduce((acc, slot) => {
    const dateKey = formatDate(slot.startTime);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});

  // 3. Xử lý gửi dữ liệu đặt lịch lên Server (POST)
  const handleConfirmBooking = async () => {
    if (!selectedSlotId || submitting) return;
    
    const selectedSlot = slots.find((s) => s.id === selectedSlotId);
    
    // Bật popup hỏi xác nhận trước khi gửi API (Tuỳ chọn thêm để UX tốt hơn)
    const confirmResult = await Swal.fire({
      title: 'Xác nhận đặt lịch?',
      html: `Bạn đang chọn lịch vào <b>${formatTime(selectedSlot.startTime)}</b> ngày <b>${formatDate(selectedSlot.startTime)}</b>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    });

    // Nếu người dùng ấn Hủy thì dừng lại
    if (!confirmResult.isConfirmed) return;
    
    try {
      setSubmitting(true);
      
      const response = await fetch(`${API_BASE_URL}/schedule/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Token: token,
          SlotId: selectedSlotId
        }),
      });

      const result = await response.json();

      if (!response.ok || result.status === false) {
        throw new Error(result.message || "Không thể xác nhận đặt lịch. Vui lòng thử lại.");
      }

      // Thông báo THÀNH CÔNG xịn sò
      await Swal.fire({
        title: 'Thành công!',
        text: 'Lịch phỏng vấn của bạn đã được xác nhận.',
        icon: 'success',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Tuyệt vời'
      });
      
      // Chuyển hướng hoặc load lại trang sau khi user ấn "Tuyệt vời"
      // window.location.href = "/"; 
      
    } catch (err) {
      // Thông báo LỖI xịn sò
      Swal.fire({
        title: 'Rất tiếc...',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Đóng'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Các trạng thái giao diện (Loading, Error, Empty)
  if (loading) return <div className="loading-state">⏳ Đang tải thông tin lịch phỏng vấn...</div>;
  
  if (error) return (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Thử lại</button>
    </div>
  );
  
  if (slots.length === 0) return <div className="empty-state">📅 Hiện không có khung giờ nào khả dụng.</div>;

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2>Chọn lịch phỏng vấn của bạn</h2>
        <p>Vui lòng chọn khung giờ phù hợp. Mã phiên: <code>{token}</code></p>
      </div>

      <div className="schedule-body">
        {Object.entries(groupedSlots).map(([date, daySlots]) => (
          <div key={date} className="date-group">
            <h3 className="date-title">{date}</h3>
            <div className="slots-grid">
              {daySlots.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                return (
                  <div
                    key={slot.id}
                    className={`slot-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedSlotId(slot.id)}
                  >
                    <div className="slot-time">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                    <div className="slot-title">{slot.title}</div>
                    <div className="slot-location">
                      <span className="icon">📍</span> {slot.location}
                    </div>
                    {isSelected && (
                      <div className="slot-description">
                        ✨ {slot.description || "Vui lòng có mặt đúng giờ để buổi phỏng vấn diễn ra tốt nhất."}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="schedule-footer">
        <button
          className="confirm-button"
          disabled={!selectedSlotId || submitting}
          onClick={handleConfirmBooking}
        >
          {submitting ? "Đang xử lý..." : selectedSlotId ? "Xác nhận đặt lịch" : "Vui lòng chọn 1 khung giờ"}
        </button>
      </div>
    </div>
  );
};

export default InterviewSchedule;