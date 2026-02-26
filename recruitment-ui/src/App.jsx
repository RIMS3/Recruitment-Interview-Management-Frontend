import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './Home/HomePage'; 
import LoginPage from './Auth/LoginForm'; 
import './App.css'; 
import InterviewPage from './Interviews/InterviewPage'
import UserProfile from './UserProfile';
// Tách Navbar thành component riêng để sử dụng hook useLocation
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Danh sách các đường dẫn KHÔNG hiển thị Navbar
  const hideNavbarPaths = ['/login'];

  if (hideNavbarPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="main-navbar">
      <div className="nav-content">
        <Link title="Trang chủ" to="/" className="logo-text">
          <div className="logo-box">T</div>
          IT LOCAK
        </Link>
        
        <ul className="nav-menu">
          <li>Việc làm</li>
          <li>Hồ sơ & CV</li>
          <li>Công cụ</li>
          <li>Cẩm nang</li>
        </ul>

        <div className="nav-auth">
          <button className="btn-login" onClick={() => navigate('/login')}>
            Đăng nhập
          </button>
          <button className="btn-post">Đăng tuyển ngay</button>
          {/* Thêm một nút để bạn dễ dàng test chuyển sang trang Profile */}
          <button style={{marginLeft: '10px'}} onClick={() => navigate('/profile')}>
            Hồ sơ cá nhân
          </button>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Navbar giờ đây nằm bên trong Router để có thể sử dụng useLocation */}
        <Navbar />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
{/* Đây là nơi chúng ta tích hợp trang UserProfile */}
            <Route path="/profile" element={<UserProfile />} />
          
            <Route path="/interview/:companyId" element={<InterviewPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;