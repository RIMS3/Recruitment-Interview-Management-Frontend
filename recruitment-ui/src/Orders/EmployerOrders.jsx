import React, { useState, useEffect } from 'react';
import './EmployerOrders.css';

const OrderDashboard = () => {
  // State cho danh sách
  const [orders, setOrders] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  // State cho chi tiết
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6; 

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // 1. Fetch danh sách order khi component mount
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('accessToken'); 
      
      if (!token) {
        setListError('Không tìm thấy Access Token. Vui lòng đăng nhập lại.');
        setLoadingList(false);
        return;
      }

      try {
        const response = await fetch(`${baseUrl}/Orders`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 404) throw new Error('Lỗi 404: Không tìm thấy API trên Backend.');
        if (response.status === 401) throw new Error('Phiên đăng nhập hết hạn.');
        if (!response.ok) throw new Error('Lỗi khi tải danh sách đơn hàng.');
        
        const data = await response.json();
        setOrders(data); 
      } catch (err) {
        setListError(err.message);
      } finally {
        setLoadingList(false);
      }
    };

    fetchOrders();
  }, [baseUrl]);

  // 2. Fetch chi tiết 1 order khi click
  const fetchOrderDetail = async (id) => {
    const token = localStorage.getItem('accessToken');
    
    setSelectedOrderId(id); // Chuyển màn hình ngay lập tức
    setLoadingDetail(true);
    setDetailError(null);
    setOrderDetail(null);

    try {
      const response = await fetch(`${baseUrl}/Orders/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Không thể tải chi tiết đơn hàng.');
      
      const data = await response.json();
      setOrderDetail(data);
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  // 3. Logic Phân trang
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedOrderId(null);
    setOrderDetail(null);
  };

  const getStatusText = (status) => {
    switch(status) {
      case 1: return <span className="status-badge success">✨ Hoàn thành</span>;
      case 0: return <span className="status-badge pending">⏳ Chờ xử lý</span>;
      default: return <span className="status-badge">❓ Không xác định</span>;
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="gradient-text">Quản Lý Đơn Hàng</h1>
        <p>Giao diện hiện đại dành cho quản trị viên</p>
      </header>

      <div className="dashboard-content">
        
        {/* --- MÀN HÌNH DANH SÁCH --- */}
        {!selectedOrderId && (
          <div className="order-list-section slide-in-bottom">
            <div className="section-title-wrap">
              <h2>📦 Danh sách Order</h2>
              <span className="order-count">{orders.length} đơn hàng</span>
            </div>
            
            {loadingList && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Đang kết nối dữ liệu...</p>
              </div>
            )}
            
            {listError && (
              <div className="error-box bounce-in">
                <p>⚠️ {listError}</p>
              </div>
            )}
            
            {!loadingList && !listError && orders.length === 0 && (
              <div className="empty-box">
                <div className="empty-icon">📭</div>
                <p>Chưa có dữ liệu đơn hàng.</p>
              </div>
            )}

            <div className="order-grid">
              {currentOrders.map((order, index) => (
                <div 
                  key={order.id} 
                  className="order-card stagger-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => fetchOrderDetail(order.id)}
                >
                  <div className="order-card-icon">🚀</div>
                  <div className="order-card-info">
                    <h3>{order.orderCode || order.id.substring(0,8)}</h3>
                    <p>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                  </div>
                  <div className="order-card-action">
                    <span className="view-link">Chi tiết ➔</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button 
                  className="page-nav-btn"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
                
                <div className="page-numbers">
                  {[...Array(totalPages).keys()].map(number => (
                    <button
                      key={number + 1}
                      onClick={() => paginate(number + 1)}
                      className={`page-number-btn ${currentPage === number + 1 ? 'active' : ''}`}
                    >
                      {number + 1}
                    </button>
                  ))}
                </div>

                <button 
                  className="page-nav-btn"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- MÀN HÌNH CHI TIẾT --- */}
        {selectedOrderId && (
          <div className="order-detail-section slide-in-right">
            <button className="back-btn" onClick={handleBackToList}>
              <span>⬅</span> Quay lại danh sách
            </button>

            {loadingDetail && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Đang tải chi tiết...</p>
              </div>
            )}

            {detailError && (
              <div className="error-box bounce-in">
                <p>⚠️ {detailError}</p>
              </div>
            )}

            {orderDetail && !loadingDetail && !detailError && (
              <div className="detail-card fade-in">
                <div className="detail-header-card">
                  <div className="header-left">
                    <h2>Mã đơn: <span className="highlight-text">{orderDetail.orderCode || orderDetail.id.substring(0,8)}</span></h2>
                    <p className="employer-id">ID: {orderDetail.employerId}</p>
                  </div>
                  <div className="header-right">
                    {getStatusText(orderDetail.status)}
                  </div>
                </div>
                
                <div className="detail-body">
                  <div className="timeline-row">
                    <div className="timeline-item">
                      <div className="tl-icon">📅</div>
                      <div className="tl-content">
                        <label>Ngày Tạo</label>
                        <p>{new Date(orderDetail.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="tl-icon">💳</div>
                      <div className="tl-content">
                        <label>Thanh Toán</label>
                        <p>{orderDetail.paidAt ? new Date(orderDetail.paidAt).toLocaleString('vi-VN') : 'Chờ xử lý'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="items-section">
                    <h3>Gói Dịch Vụ Đã Đặt</h3>
                    <div className="items-list">
                      {orderDetail.orderItems && orderDetail.orderItems.map((item, index) => (
                        <div key={item.id} className="item-row stagger-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                          <div className="item-icon-bg">🔖</div>
                          <div className="item-details">
                            <p className="item-id">Gói: {item.servicePackageId.substring(0, 8)}...</p>
                            <p className="item-qty">Số lượng: <span>x{item.quantity}</span></p>
                          </div>
                          <div className="item-price">
                            ${item.price.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="total-section glass-panel">
                    <span>Tổng cộng</span>
                    <span className="total-amount">${orderDetail.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDashboard;