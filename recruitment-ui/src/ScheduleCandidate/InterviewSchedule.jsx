import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./InterviewSchedule.css";

const InterviewSchedule = () => {
  // Lấy 'token' từ URL (phải khớp với :token trong App.js)
  const { token } = useParams();
  
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Lấy Base URL từ biến môi trường của Vite
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 1. Gọi API lấy danh sách ca phỏng vấn dựa trên token
  useEffect(() => {
    const fetchSlots = async () => {
      if (!token) {
        setError("Không tìm thấy mã xác thực (Token) trong đường dẫn.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Endpoint: https://itlocak.xyz/api/schedule/{token}
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

  // Nhóm các slot theo ngày để hiển thị đẹp hơn
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
    
    try {
      setSubmitting(true);
      
      const response = await fetch(`${API_BASE_URL}/schedule/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          slotId: selectedSlotId
        }),
      });

      if (!response.ok) {
        throw new Error("Không thể xác nhận đặt lịch. Vui lòng thử lại.");
      }

      alert(`Thành công! Bạn đã đặt lịch vào lúc ${formatTime(selectedSlot.startTime)} - ${formatDate(selectedSlot.startTime)}`);
      
      // Có thể chuyển hướng user về trang chủ hoặc thông báo thành công
      // window.location.href = "/"; 
      
    } catch (err) {
      alert(err.message);
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