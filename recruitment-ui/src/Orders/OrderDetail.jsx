import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./OrderDetail.css";

const OrderDetail = () => {
  const { id } = useParams(); // Lấy OrderId từ URL
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken"); // Đổi thành key token của bạn nếu cần
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      // Gọi API lấy chi tiết 1 đơn hàng (Bạn cần đảm bảo backend có API GET /api/Orders/{id})
      const response = await fetch(`${baseUrl}/Orders/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setOrder(result);
      } else {
        console.error("Không tìm thấy đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="spinner"></div>
        <p>Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="detail-error">
        <h2>Không tìm thấy đơn hàng!</h2>
        <button onClick={() => navigate(-1)} className="btn-back">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      {/* Header */}
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Quay lại danh sách
        </button>
        <h2>Chi tiết đơn hàng <span className="highlight-text">#{order.orderCode}</span></h2>
      </div>

      <div className="dashboard-grid">
        {/* Cột chính bên trái */}
        <div className="main-column">
          
          {/* Status Cards */}
          <div className="status-cards-row">
            <div className="status-card">
              <div className="icon-wrapper order-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              </div>
              <div>
                <h4>Trạng thái đơn</h4>
                <span className={`badge ${order.status === 1 ? 'badge-success' : 'badge-warning'}`}>
                  {order.status === 1 ? "Hoàn thành" : "Chờ xử lý"}
                </span>
              </div>
            </div>

            <div className="status-card">
              <div className="icon-wrapper payment-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              </div>
              <div>
                <h4>Thanh toán</h4>
                <span className={`badge ${order.paidAt ? 'badge-success' : 'badge-danger'}`}>
                  {order.paidAt ? "Đã thanh toán" : "Chưa thanh toán"}
                </span>
              </div>
            </div>
          </div>

          {/* Table Sản phẩm */}
          <div className="card item-list-card">
            <div className="card-header">
              <h3>Gói dịch vụ đã đăng ký</h3>
              <span className="date-text">{formatDate(order.createdAt)}</span>
            </div>
            
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>GÓI DỊCH VỤ</th>
                    <th>THỜI HẠN</th>
                    <th>BÀI ĐĂNG TỐI ĐA</th>
                    <th>ĐƠN GIÁ</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems && order.orderItems.length > 0 ? (
                    order.orderItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="product-info">
                            <div className="product-icon">📦</div>
                            <div>
                              <p className="product-name">{item.servicePackage?.name}</p>
                              <p className="product-desc">{item.servicePackage?.description || "Không có mô tả"}</p>
                            </div>
                          </div>
                        </td>
                        <td>{item.servicePackage?.durationDays} ngày</td>
                        <td>{item.servicePackage?.maxPost} bài</td>
                        <td className="font-semibold">{formatCurrency(item.price)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center empty-row">Không có chi tiết gói dịch vụ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="table-footer">
              <div className="total-row">
                <span>Tổng cộng:</span>
                <span className="total-price">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột thông tin bên phải */}
        <div className="sidebar-column">
          <div className="card summary-card">
            <div className="card-header border-bottom">
              <h3>Tóm tắt giao dịch</h3>
            </div>
            <div className="card-body">
              <div className="summary-item">
                <span className="text-muted">Mã đơn hàng:</span>
                <span className="font-semibold text-main">{order.orderCode}</span>
              </div>
              <div className="summary-item">
                <span className="text-muted">Ngày tạo đơn:</span>
                <span className="text-main">{formatDate(order.createdAt)}</span>
              </div>
              <div className="summary-item">
                <span className="text-muted">Ngày thanh toán:</span>
                <span className="text-main">{formatDate(order.paidAt)}</span>
              </div>
            </div>
          </div>

          <div className="card info-card">
            <div className="card-header border-bottom">
              <h3>Hỗ trợ khách hàng</h3>
            </div>
            <div className="card-body">
              <p className="support-text">
                Nếu bạn có bất kỳ thắc mắc nào về gói dịch vụ <strong>{order.orderItems?.[0]?.servicePackage?.name}</strong>, vui lòng liên hệ với bộ phận CSKH.
              </p>
              <button className="btn-outline-primary mt-3">Liên hệ hỗ trợ</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetail;