import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "./EmployerOrders.css";

const EmployerOrders = () => {
  const [data, setData] = useState({ items: [], totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 6;

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders(pageNumber);
  }, [pageNumber]);

  const fetchOrders = async (page) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken"); 
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      
      const response = await fetch(`${baseUrl}/Orders?pageNumber=${page}&pageSize=${pageSize}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        console.error("Lỗi khi tải dữ liệu đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleViewDetails = (orderId) => {
    navigate(`/order-details/${orderId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  const formatTimeOnly = (dateString) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit", minute: "2-digit", hour12: false
    });
  };

  const formatDateOnly = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric"
    });
  };

  return (
    <div className="emp-order-list-container">
      <div className="emp-order-list-content">
        
        <div className="emp-order-list-header">
          <h2 className="emp-order-list-title">Lịch Sử Dịch Vụ</h2>
          <p className="emp-order-list-subtitle">Theo dõi và quản lý các gói dịch vụ bạn đã đăng ký</p>
        </div>

        {loading ? (
          <div className="emp-order-list-loading">
            <div className="emp-order-list-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="emp-order-list-wrapper">
            
            {/* Header của bảng */}
            <div className="emp-order-list-thead">
              <div className="emp-order-list-th">MÃ ĐƠN</div>
              <div className="emp-order-list-th">THỜI GIAN</div>
              <div className="emp-order-list-th">GIÁ TIỀN</div>
              <div className="emp-order-list-th">TRẠNG THÁI</div>
              <div className="emp-order-list-th emp-order-list-align-center">HÀNH ĐỘNG</div>
            </div>

            {/* Danh sách các hàng */}
            <div className="emp-order-list-tbody">
              {data.items && data.items.length > 0 ? (
                data.items.map((order, index) => (
                  <div 
                    className="emp-order-list-row" 
                    key={order.id}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Cột 1: Mã đơn */}
                    <div className="emp-order-list-td emp-order-list-td--code">
                      <span className="emp-order-list-code-text">#{order.orderCode}</span>
                    </div>
                    
                    {/* Cột 2: Thời gian */}
                    <div className="emp-order-list-td emp-order-list-td--time">
                      <span className="emp-order-list-time-main">{formatTimeOnly(order.createdAt)}</span>
                      <span className="emp-order-list-date-sub">{formatDateOnly(order.createdAt)}</span>
                    </div>
                    
                    {/* Cột 3: Giá tiền */}
                    <div className="emp-order-list-td emp-order-list-td--price">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    
                    {/* Cột 4: Trạng thái */}
                    <div className="emp-order-list-td emp-order-list-td--status">
                      <span className={`emp-order-list-badge emp-order-list-badge--${order.status}`}>
                        <span className="emp-order-list-badge-dot"></span>
                        {order.status === 1 ? "Hoàn thành" : "Đang xử lý"}
                      </span>
                    </div>
                    
                    {/* Cột 5: Nút hành động */}
                    <div className="emp-order-list-td emp-order-list-td--action">
                      <button 
                        className="emp-order-list-btn-action"
                        onClick={() => handleViewDetails(order.id)}
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="emp-order-list-empty-state">
                  <div className="emp-order-list-empty-icon">📄</div>
                  <p>Chưa có lịch sử giao dịch nào.</p>
                </div>
              )}
            </div>

            {/* Phân trang */}
            {data.totalPages > 1 && (
              <div className="emp-order-list-pagination">
                <button 
                  className="emp-order-list-page-btn"
                  disabled={pageNumber === 1} 
                  onClick={() => setPageNumber(p => p - 1)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                
                <div className="emp-order-list-page-numbers">
                  {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(num => (
                    <button 
                      key={num} 
                      className={`emp-order-list-page-num-btn ${pageNumber === num ? 'emp-order-list-page-active' : ''}`}
                      onClick={() => setPageNumber(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button 
                  className="emp-order-list-page-btn"
                  disabled={pageNumber === data.totalPages} 
                  onClick={() => setPageNumber(p => p + 1)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default EmployerOrders;