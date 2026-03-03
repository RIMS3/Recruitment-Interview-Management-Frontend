import React, { useState, useEffect, useContext } from 'react';
import { Mail, Lock, LogIn, Code2, Eye, EyeOff, UserPlus, User } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import './LoginStyles.css';
import { AuthContext } from "./AuthContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //THÊM: Nếu đã login rồi thì không cho vào /login nữa
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = Number(localStorage.getItem("role"));

    if (token) {
      if (role === 0) {
        navigate("/select-role");
      } else {
        navigate("/");
      }
    }
  }, [navigate]);

  // ================= GOOGLE LOGIN (GIỮ NGUYÊN) =================
  async function handleCredentialResponse(response) {
    try {
      const res = await fetch("https://localhost:7272/api/Auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken: response.credential,
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        alert(data.message || "Đăng nhập Google thất bại!");
        return;
      }

      // Lưu localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("email", data.email);
      localStorage.setItem("fullName", data.fullName);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.userId);

      // Cập nhật context
      setUser({
        id: data.userId,
        token: data.accessToken,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
      });

      // 🔥 THÊM LOGIC ROLE
      if (data.role === 0) {
        navigate("/select-role");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Google login error:", err);
      alert("Không thể kết nối server");
    }
  }

  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id:
        "319275534367-9rj78f047dfp9c5ig55fk25gbpmtvpah.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      {
        theme: "outline",
        size: "large",
        width: 340,
      }
    );
  }, []);

  // ================= LOGIN / REGISTER =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || (!isLogin && !fullName)) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const url = isLogin
        ? "https://localhost:7272/api/Auth/login"
        : "https://localhost:7272/api/Auth/register";

      const body = isLogin
        ? { email, password }
        : { fullName, email, password };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        alert(data.message || "Có lỗi xảy ra");
        setPassword("");
        return;
      }

      // LOGIN SUCCESS
      if (isLogin) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("email", data.email);
        localStorage.setItem("fullName", data.fullName);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.userId);

        setUser({
          id: data.userId,
          token: data.accessToken,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
        });

        if (data.role === 0) {
          navigate("/select-role");
        } else {
          navigate("/");
        }


      } else {
        // REGISTER SUCCESS
        alert("Đăng ký thành công!");
        setFullName("");
        setEmail("");
        setPassword("");
        setIsLogin(true);
      }

    } catch (err) {
      console.error("Server error:", err);
      alert("Không thể kết nối server");
    }
  };

  return (
    <div className="login-container">
      <div className="marquee-wrapper">
        <div className="marquee-text">
          <span>Bùi Xuân Huấn</span> - Ra xã hội làm ăn bươn trải...
        </div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-box">
            <Code2 size={32} color="#00b14f" />
          </div>
          <h1>DevHire <span className="text-gradient">IT LOCAK</span></h1>
          <p className='s'>
            {isLogin ? 'Nâng tầm sự nghiệp Software Engineer' : 'Gia nhập cộng đồng Developer tài năng'}
          </p>
        </div>

        <div className="social-group">
          <div className="google-wrapper">
            <div id="googleBtn"></div>
          </div>
        </div>

        <div className="divider">
          <span>HOẶC TIẾP TỤC VỚI</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>

          {!isLogin && (
            <div className="input-group">
              <label>Họ và tên</label>
              <div className="input-wrapper">
                <User className="input-icon-left" size={18} />
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Email công việc</label>
            <div className="input-wrapper">
              <Mail className="input-icon-left" size={18} />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <div className="label-row">
              <label>Mật khẩu</label>
              {isLogin && <a href="#forgot" className="link-sm">Quên mật khẩu?</a>}
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon-left" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="btn-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary">
            {isLogin ? (
              <>Truy cập bảng tin IT <LogIn size={18} /></>
            ) : (
              <>Tạo tài khoản ngay <UserPlus size={18} /></>
            )}
          </button>
        </form>

        <div className="footer-toggle">
          <p className="footer-text">
            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{' '}
            <span className="btn-link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;