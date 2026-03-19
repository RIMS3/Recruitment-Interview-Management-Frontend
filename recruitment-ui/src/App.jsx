import React, { useContext, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import { Toaster } from "react-hot-toast";

// Import Components
import HomePage from "./Home/HomePage";
import LoginPage from "./Auth/LoginForm";
import "./App.css";
import JobList from "./JobPost/JobList";
import InterviewPage from "./Interviews/InterviewPage";
// CHÚ Ý: Đảm bảo đường dẫn import này khớp với cấu trúc thư mục thực tế của bạn
import InterviewSchedule from "./ScheduleCandidate/InterviewSchedule";
import { AuthContext } from "./Auth/AuthContext";
import JobPostDetails from "./JobPostDetails/JobPostDetails";
import SavedJobs from "./SavedJobs/SavedJobs";
import SelectRole from "./Auth/SelectRole";
import ProtectedRoute from "./Auth/ProtectedRoute";
import RoleGuard from "./Auth/RoleGuard";
import CreateCompany from "./Auth/CreateCompany";
import CVs from "./CVs/CVs";
import CVTemplates from "./CVs/CVTemplates";
import CreateCV from "./CVs/CreateCV";
import ApplicationList from "./Applications/ApplicationList";
import AdminDashboard from "./Dashboard/AdminDashboard";
import CandidateProfile from "./CandidateProfile";
import EmployerProfile from "./EmployerProfile";
import UserProfile from "./UserProfile";
import ListAppliedJobs from "./AppliJobs/ListAppliedJobs";
import BannerManager from "./Banner/BannerManager";
import CVViewer from "./CVs/CVViewer";
import JobManager from "./CRUDJobpost/JobManager";
import AdvertisementManager from "./Advertisement/AdvertisementManager";
import ServicePackage from "./ServicePackage/ServicePackage";
import EmployerServicePackages from "./ServicePackage/EmployerServicePackages";
import ServicePackageCheckout from "./ServicePackage/ServicePackageCheckout";
import OrderHistory from "./Orders/OrderHistory";
import OrderDetail from "./Orders/OrderDetail";
import ITBlog from "./Blog/ITBlog";
import UpgradeCvPro from "./CVs/UpgradeCvPro";
import DepositPage from "./Coin/DepositPage";
import TaiXiuGame from "./Game/TaiXiuGame";

import ResetPassword from "./Password/ResetPassword";
import ChangePassword from "./Password/ChangePassword";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useContext(AuthContext);
  const [balance, setBalance] = useState(0);

  // --- STATE QUẢN LÝ MENU MOBILE ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Đóng menu mobile tự động khi chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // 1. LOGIC FETCH SỐ DƯ VÀ CHECK VIP TỰ ĐỘNG MỌI LÚC MỌI NƠI
  useEffect(() => {
    let isMounted = true;

    const fetchGlobalData = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("accessToken");
      const role = localStorage.getItem("role");

      // Khai báo Base URL từ file môi trường Vite
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

      if (!userId) return;

      try {
        // A. Lấy Số Dư
        const resBalance = await axios.get(`${apiUrl}/refill/${userId}`);
        if (isMounted) {
          const amount = typeof resBalance.data === 'number' ? resBalance.data : (resBalance.data.amount || 0);
          setBalance(amount);
        }

        // B. Lấy thông tin Profile (Nếu là Ứng viên - Role 2)
        if (String(role) === "2" && token) {
          const resProfile = await axios.get(`${apiUrl}/candidateprofiles/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (isMounted && resProfile.data) {
            if (user && (resProfile.data.isCvPro !== user.isCvPro || resProfile.data.avatarUrl !== user.avatarUrl)) {
              const updatedUser = { 
                ...user, 
                isCvPro: resProfile.data.isCvPro !== undefined ? resProfile.data.isCvPro : user.isCvPro,
                avatarUrl: resProfile.data.avatarUrl !== undefined ? resProfile.data.avatarUrl : user.avatarUrl
              };
              setUser(updatedUser); 
              localStorage.setItem("user", JSON.stringify(updatedUser)); 
            }
          }
        } 
        // C. Lấy thông tin Profile (Nếu là Nhà tuyển dụng - Role 3) để cập nhật Avatar
        else if (String(role) === "3" && token) {
          const resProfile = await axios.get(`${apiUrl}/employerprofiles/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (isMounted && resProfile.data) {
            if (user && resProfile.data.avatarUrl !== user.avatarUrl) {
              const updatedUser = { 
                ...user, 
                avatarUrl: resProfile.data.avatarUrl !== undefined ? resProfile.data.avatarUrl : user.avatarUrl
              };
              setUser(updatedUser); 
              localStorage.setItem("user", JSON.stringify(updatedUser)); 
            }
          }
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu toàn cục:", error);
      }
    };

    fetchGlobalData();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, user?.id]);

  const handleProfileClick = () => {
    const role = localStorage.getItem("role");
    if (role === "2") {
      navigate("/manage-cv");
    } else if (role === "3") {
      navigate("/employer/applications");
    } else if (role === "1") {
      navigate("/admin/cvs");
    } else {
      navigate("/login");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const hideNavbarPaths = ["/login"];
  if (hideNavbarPaths.includes(location.pathname)) {
    return null;
  }

  // Khai báo ảnh mặc định dựa trên Role (3 = icon công ty, còn lại = icon người)
  const defaultAvatarSrc = String(user?.role) === "3" 
    ? "https://cdn-icons-png.flaticon.com/512/2231/2231505.png" 
    : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  return (
    <nav className={`main-navbar ${user?.isCvPro ? 'navbar-pro' : ''}`}>
      <div className="nav-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingLeft: '15px' }}>
        
        <Link to="/" className="logo-text" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', margin: 0 }}>
          <div className="navbar-logo-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}>T</div>
          <span className="logo-main-text" style={{ display: 'flex', alignItems: 'center', margin: 0, lineHeight: 1 }}>IT LOCAK</span>
          {user?.isCvPro && <span className="logo-pro-text" style={{ display: 'flex', alignItems: 'center', margin: 0, lineHeight: 1 }}>Pro</span>}
        </Link>

        <div 
          className="mobile-menu-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </div>

        {isMobileMenuOpen && (
          <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
        )}

        <div className={`nav-right-panel ${isMobileMenuOpen ? 'open' : ''}`}>
          <ul className="nav-menu">
            {/* MENU DÀNH CHO ADMIN */}
            {user && String(user.role) === "1" && (
              <>
                <li className={location.pathname === "/admin/dashboard" ? "active" : ""} onClick={() => navigate("/admin/dashboard")}>
                  Quản trị hệ thống
                </li>
                <li className={location.pathname === "/admin/advertisements" ? "active" : ""} onClick={() => navigate("/admin/advertisements")}>
                  Quảng Cáo
                </li>
                <li className={location.pathname === "/admin/service-packages" ? "active" : ""} onClick={() => navigate("/admin/service-packages")}>
                  Gói Dịch Vụ
                </li>
              </>
            )}

            {/* MENU DÀNH CHO NHÀ TUYỂN DỤNG */}
            {user && String(user.role) === "3" && (
              <>
                <li className={location.pathname === "/employer/buy-services" ? "active" : ""} onClick={() => navigate("/employer/buy-services")}>
                  Mua Dịch Vụ
                </li>
                <li className={location.pathname === "/employer/orders" ? "active" : ""} onClick={() => navigate("/employer/orders")}>
                  Lịch sử giao dịch
                </li>
                <li className={location.pathname === "/employer/manage-jobs" ? "active" : ""} onClick={() => navigate("/employer/manage-jobs")}>
                  Đăng tin
                </li>
                 <li 
                   className={location.pathname.startsWith("/scheduled") ? "active" : ""} 
                   onClick={() => {
                     const currentCompanyId = localStorage.getItem("IdCompany");
                     if (currentCompanyId && currentCompanyId !== "null") {
                       navigate(`/scheduled/${currentCompanyId}`);
                     } else {
                       console.warn("Chưa có ID công ty");
                     }
                   }}
                 >
                   Quản lý lịch Phỏng Vấn 
                 </li>
              </>
            )}

            {/* MENU DÀNH CHO ỨNG VIÊN */}
            {user && String(user.role) === "2" && (
             <>
               {!user?.isCvPro ? (
                 <li
                   onClick={() => navigate('/upgrade-cv-pro')}
                   className="btn-upgrade-nav"
                 >
                   ⭐ Nâng cấp ngay
                 </li>
               ) : (
                 <li className="badge-vip-nav" title="Bạn đang sở hữu gói CV Pro">
                   IT LOCAK Pro
                 </li>
               )}
               <li className={location.pathname === "/candidate/orders" ? "active" : ""} onClick={() => navigate("/candidate/orders")}>
                 Lịch sử giao dịch
               </li>
             </>
            )}

            {user && String(user.role) !== "1" && (
              <li
                className={["/manage-cv", "/employer/applications", "/admin/cvs"].includes(location.pathname) ? "active" : ""}
                onClick={handleProfileClick}
              >
                Hồ sơ & CV
              </li>
            )}

            <li
              className={location.pathname === "/joblist" ? "active" : ""}
              onClick={() => navigate("/joblist")}
              style={{ cursor: "pointer" }}
            >
              Việc làm
            </li>

            <li className={location.pathname === "/game" ? "active" : ""} onClick={() => navigate("/game")}>
              Game
            </li>
            
            {/* PHẦN NẠP TIỀN & SỐ DƯ */}
            {user && (
              <>
                <li
                  className={location.pathname === "/naptien" ? "active" : ""}
                  onClick={() => navigate("/naptien")}
                  style={{ color: user?.isCvPro ? "#f3c246" : "#10b981", fontWeight: "bold" }}
                >
                  Gift Code
                </li>
                <li className="nav-balance-item">
                  <span className="balance-label">Số Dư: </span>
                  <span className="balance-value">{formatCurrency(balance)}</span>
                </li>
              </>
            )}

           <li className={location.pathname === "/change-password" ? "active" : ""} onClick={() => navigate("/change-password")}>
                 Đổi mật khẩu
               </li>
          </ul>

          <div className="nav-auth">
            {user ? (
              <>
                <div
                  className={`user-profile-nav ${user?.isCvPro ? 'vip-theme' : 'blue-theme'}`}
                  onClick={() => {
                    if (user.role === 2) navigate("/candidate-profile");
                    else if (user.role === 3) navigate("/employer-profile");
                  }}
                >
                  <div className={`nav-avatar ${user?.isCvPro ? 'vip-avatar' : ''}`}>
                    {/* SỬ DỤNG defaultAvatarSrc ĐÃ KHAI BÁO BÊN TRÊN */}
                    <img
                      src={user?.avatarUrl || defaultAvatarSrc}
                      alt="avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = defaultAvatarSrc;
                      }}
                    />
                  </div>
                  <span className="welcome-text">
                    Xin chào, <strong className={user?.isCvPro ? 'vip-text' : ''}>{user.fullName}</strong>
                  </span>
                </div>

                <button
                  className="navbar-btn-logout"
                  onClick={() => {
                    localStorage.clear();
                    setUser(null);
                    navigate("/");
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="navbar-btn-login" onClick={() => navigate("/login")}>
                  Đăng nhập
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <Toaster
        position="top-center"
        containerStyle={{ zIndex: 99999 }}
        toastOptions={{
          duration: 3000,
          style: { fontSize: "16px", padding: "16px 24px" },
        }}
      />
      <div className="app-container">
        <Navbar />

        <main className="app-main-content">
          <Routes>
            <Route path="/" element={<RoleGuard><HomePage /></RoleGuard>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/joblist" element={<JobList />} />
            <Route path="/jobpostdetail/:id" element={<JobPostDetails />} /> 
            <Route path="/candidate-profile" element={<CandidateProfile />} />
            <Route path="/employer-profile" element={<EmployerProfile />} />
            <Route path="/it-blog" element={<ITBlog />} />
            <Route path="/upgrade-cv-pro" element={<UpgradeCvPro />} />
            <Route path="/naptien" element={<DepositPage />} />
            <Route path="/applied-jobs" element={<ListAppliedJobs />} />
            <Route path="/create-company" element={<CreateCompany />} />
            <Route path="/game" element={<TaiXiuGame />} />
            
            <Route path="/reset-password" element={< ResetPassword />} />
             <Route path="/change-password" element={< ChangePassword />} />
            {/* role employer */}
            <Route path="/scheduled/:companyId" element={<InterviewPage />} />

            {/* role candidate */}
            <Route path="/interview-schedule/:token" element={<InterviewSchedule />} />
            
            <Route path="/manage-cv" element={<ProtectedRoute requiredRole={2}><CVs /></ProtectedRoute>} />
            <Route path="/employer/applications" element={<ProtectedRoute requiredRole={3}><ApplicationList /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole={1}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/saved-jobs" element={<ProtectedRoute><SavedJobs /></ProtectedRoute>} />
            <Route path="/cv-templates" element={<ProtectedRoute><CVTemplates /></ProtectedRoute>} />
            <Route path="/create-cv/:cvId" element={<ProtectedRoute><CreateCV /></ProtectedRoute>} />
            <Route path="/admin/banners" element={<ProtectedRoute requiredRole={1}><BannerManager /></ProtectedRoute>} />
            <Route path="/cv-preview/:cvId" element={<ProtectedRoute requiredRole={[2, 3]}><CVViewer /></ProtectedRoute>} />
            <Route path="/employer/manage-jobs" element={<ProtectedRoute requiredRole={3}><JobManager /></ProtectedRoute>} />
            <Route path="/admin/advertisements" element={<ProtectedRoute requiredRole={1}><AdvertisementManager /></ProtectedRoute>} />
            <Route path="/admin/service-packages" element={<ProtectedRoute requiredRole={1}><ServicePackage /></ProtectedRoute>} />
            <Route path="/employer/buy-services" element={<ProtectedRoute requiredRole={3}><EmployerServicePackages /></ProtectedRoute>} />
            <Route path="/employer/checkout" element={<ProtectedRoute requiredRole={3}><ServicePackageCheckout /></ProtectedRoute>} />
            <Route path="/employer/orders" element={<ProtectedRoute requiredRole={3}><OrderHistory /></ProtectedRoute>} />
            <Route path="/candidate/orders" element={<ProtectedRoute requiredRole={2}><OrderHistory /></ProtectedRoute>} />
            <Route path="/order-details/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;