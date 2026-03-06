import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
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
import ApplicationList from "./Applications/ApplicationList";
import AdminDashboard from './Dashboard/AdminDashboard';
import CandidateProfile from "./CandidateProfile"; 
import EmployerProfile from "./EmployerProfile";
import UserProfile from "./UserProfile";
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useContext(AuthContext);

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
          <li onClick={() => navigate("/admin/dashboard")} style={{ cursor: "pointer", fontWeight: "bold", color: "blue" }}>
      Quản trị hệ thống
    </li>
          <li>Việc làm</li>
          <li
            onClick={() => {
              if (user?.role === 3) {
                navigate("/employer/applications");
              }
            }}
            style={{ cursor: "pointer" }}
          >
            Hồ sơ & CV
          </li>
          <li>Công cụ</li>
          <li>Cẩm nang</li>
        </ul>

        <div className="nav-auth">
          {user ? (
            <>
              <div 
                className="user-profile-nav blue-theme"
                style={{ cursor: "pointer" }} 
                onClick={() => {
                  if (user.role === 2) {
                    navigate("/candidate-profile"); // Ứng viên
                  } else if (user.role === 3) {
                    navigate("/employer-profile"); // Nhà tuyển dụng
                  }
                
                }}
              >
                <div className="nav-avatar">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="avatar"
                      onError={(e) => {
                        e.target.style.display = 'none'; 
                        e.target.nextSibling.style.display = 'flex'; 
                      }}
                    />
                  ) : null}
                  <div className="avatar-fallback" style={{ display: user.avatarUrl ? 'none' : 'flex' }}>
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
      <div className="app-container">
        <Navbar />

        <main className="app-main-content">
          <Routes>
            <Route path="/" element={<RoleGuard><HomePage />
            </RoleGuard>
            }
            />
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route
              path="/employer/applications"
              element={
                <ProtectedRoute requiredRole={3}>
                  <ApplicationList />
                </ProtectedRoute>
              }
            />
            <Route path="/joblist" element={<JobList />} />
            <Route path="/jobpostdetail/:id" element={<JobPostDetails />} />
            <Route path="/interview/:companyId" element={<InterviewPage />} />
            <Route path="/interviews" element={<InterviewPage />} />
            <Route path="/candidate-profile" element={<CandidateProfile />} />
            <Route path="/employer-profile" element={<EmployerProfile />} />
            <Route path="/user-profile" element={<UserProfile />} />
<Route 
  path="/admin/dashboard" 
  element={
    <ProtectedRoute requiredRole={1}> {/* Giả sử Admin là Role 1 */}
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
            <Route
              path="/saved-jobs"
              element={
                <ProtectedRoute>
                  <SavedJobs />
                </ProtectedRoute>
              }
            />
            <Route path="/create-company" element={<CreateCompany />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}


export default App;