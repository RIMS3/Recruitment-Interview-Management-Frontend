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
          <li>Việc làm</li>
          <li>Hồ sơ & CV</li>
          <li>Công cụ</li>
          <li>Cẩm nang</li>
        </ul>

        <div className="nav-auth">
          {user ? (
            <>
              <span style={{ marginRight: "15px" }}>
                Xin chào {user.fullName}
              </span>

              <button
                className="navbar-btn-login"
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
              <button
                className="navbar-btn-login"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </button>

              <button className="navbar-btn-post">
                Đăng tuyển ngay
              </button>
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
             <Route path="/"element={<RoleGuard><HomePage />
                </RoleGuard>
              }
            />
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/joblist" element={<JobList />} />
            <Route path="/jobpostdetail/:id" element={<JobPostDetails />} />
            <Route path="/interview/:companyId" element={<InterviewPage />} />
            <Route path="/interviews" element={<InterviewPage />} />

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