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
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useContext(AuthContext);
  const [balance, setBalance] = useState(0);

  // 1. Logic fetch số dư từ API
  useEffect(() => {
    const fetchBalance = async () => {
      const userId = localStorage.getItem("userId");
      if (user && userId) {
        try {
          // Gọi API theo đúng endpoint bạn cung cấp
          const response = await axios.get(`https://localhost:7272/api/refill/${userId}`);
          
          // Kiểm tra cấu trúc dữ liệu trả về (giả định trả về số hoặc object {amount: ...})
          const amount = typeof response.data === 'number' ? response.data : (response.data.amount || 0);
          setBalance(amount);
        } catch (error) {
          console.error("Lỗi khi lấy số dư:", error);
          setBalance(0);
        }
      }
    };

    fetchBalance();
  }, [user, location.pathname]); // Cập nhật lại khi user thay đổi hoặc khi chuyển trang

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

  return (
    <nav className="main-navbar">
      <div className="nav-content">
        <Link to="/" className="logo-text">
          <div className="navbar-logo-box">T</div>
          IT LOCAK
        </Link>

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
            </>
          )}

          {/* MENU DÀNH CHO ỨNG VIÊN */}
          {user && String(user.role) === "2" && (
            <li className={location.pathname === "/candidate/orders" ? "active" : ""} onClick={() => navigate("/candidate/orders")}>
              Lịch sử giao dịch
            </li>
          )}

          {user && String(user.role) !== "1" && (
            <li 
              className={["/manage-cv", "/employer/applications", "/admin/cvs"].includes(location.pathname) ? "active" : ""}
              onClick={handleProfileClick} 
            >
              Hồ sơ & CV
            </li>
          )}

          <li className={location.pathname === "/it-blog" ? "active" : ""} onClick={() => navigate("/it-blog")}>
            Cẩm nang
          </li>
          
          <li className={location.pathname === "/joblist" ? "active" : ""} onClick={() => navigate("/joblist")}>
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
                style={{ color: "#10b981", fontWeight: "bold" }}
              >
                Nạp Tiền
              </li>

              <li className="nav-balance-item">
                <span className="balance-label">Số Dư: </span>
                <span className="balance-value">{formatCurrency(balance)}</span>
              </li>
            </>
          )}
        </ul>

        <div className="nav-auth">
          {user ? (
            <>
              <div
                className="user-profile-nav blue-theme"
                onClick={() => {
                  if (user.role === 2) navigate("/candidate-profile"); 
                  else if (user.role === 3) navigate("/employer-profile"); 
                }}
              >
                <div className="nav-avatar">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="avatar"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="avatar-fallback"
                    style={{ display: user.avatarUrl ? "none" : "flex" }}
                  >
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <span className="welcome-text">
                  Xin chào, <strong>{user.fullName}</strong>
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
              <button className="navbar-btn-post">Đăng tuyển ngay</button>
            </>
          )}
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
            {/* Protected Routes */}
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