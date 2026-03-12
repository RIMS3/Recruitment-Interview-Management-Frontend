import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Mở comment này khi bạn dùng React Router
import "./EmployerOrders.css";

const EmployerOrders = () => {
  const [data, setData] = useState({ items: [], totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 5;

 const navigate = useNavigate(); // Mở comment này khi dùng React Router

  useEffect(() => {
    fetchOrders(pageNumber);
  }, [pageNumber]);

  const fetchOrders = async (page) => {
    setLoading(true);
    try {
      // Thay 'your_token_key' bằng key bạn dùng để lưu token trong localStorage
      const token = localStorage.getItem("accessToken"); 
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      
      // Chỉnh lại route API cho khớp với Controller của bạn
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
      setLoading(false);
    }
  };

  const handleViewDetails = (orderId) => {
    console.log("Chuyển sang trang chi tiết của Order:", orderId);
     navigate(`/order-details/${orderId}`); // Mở comment này để chuyển trang thực tế
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="order-container">
      <div className="order-header">
        <h2>Lịch Sử Giao Dịch</h2>
        <p>Quản lý các gói dịch vụ bạn đã đăng ký</p>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <div className="order-list">
            {data.items && data.items.length > 0 ? (
              data.items.map((order) => (
                <div className="order-card" key={order.id}>
                  <div className="order-card-header">
                    <span className="order-code">#{order.orderCode}</span>
                    <span className={`order-status status-${order.status}`}>
                      {order.status === 1 ? "Hoàn thành" : "Chờ xử lý"}
                    </span>
                  </div>
                  
                  <div className="order-card-body">
                    <div className="order-info">
                      <span className="label">Ngày tạo:</span>
                      <span className="value">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="order-info">
                      <span className="label">Tổng tiền:</span>
                      <span className="value price">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <button 
                      className="btn-details"
                      onClick={() => handleViewDetails(order.id)}
                    >
                      Xem chi tiết
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">Chưa có đơn hàng nào.</div>
            )}
          </div>

          {/* Pagination Controls */}
          {data.totalPages > 1 && (
            <div className="pagination">
              <button 
                className="btn-page" 
                disabled={pageNumber === 1} 
                onClick={() => setPageNumber(p => p - 1)}
              >
                Trước
              </button>
              <span className="page-info">
                Trang {pageNumber} / {data.totalPages}
              </span>
              <button 
                className="btn-page" 
                disabled={pageNumber === data.totalPages} 
                onClick={() => setPageNumber(p => p + 1)}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmployerOrders;