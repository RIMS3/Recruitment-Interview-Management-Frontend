import React, { useState, useEffect, useContext } from 'react';
import { Mail, Lock, LogIn, Code2, Eye, EyeOff, UserPlus, User } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast'; // Import thư viện thông báo
import './LoginStyles.css';
import { AuthContext } from "./AuthContext";

const API = import.meta.env.VITE_API_BASE_URL;
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

    const toastId = toast.loading("Đang đăng nhập bằng Google...");

    try {
      const res = await fetch(`${API}/Auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Đăng nhập Google thất bại!", { id: toastId });
        return;
      }

    // 🔥 ĐIỀU HƯỚNG: Role 0 là chưa chọn vai trò
    if (data.role === 0) {
      navigate("/select-role");
    } else if (data.role === 1) {
        navigate("/admin/dashboard"); // Admin -> Dashboardelse {
      navigate("/");
    }
  } catch (err) {
    console.error("Google login error:", err);
      alert("Không thể kết nối server");
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

      toast.success("Đăng nhập Google thành công!", { id: toastId });

      if (data.role === 0) {
        navigate("/select-role");
      } else {
        navigate("/");
      }

    } //catch (err) {
      //console.error("Google login error:", err);
     // toast.error("Không thể kết nối server", { id: toastId });
    //}
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
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const toastId = toast.loading(isLogin ? "Đang đăng nhập..." : "Đang tạo tài khoản...");

    try {
      const url = isLogin
        ? `${API}/Auth/login`
        : `${API}/Auth/register`;

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
        toast.error(data.message || "Có lỗi xảy ra", { id: toastId });
        setPassword("");
        return;
      }

      // LOGIN SUCCESS
      if (isLogin) {
        toast.success("Đăng nhập thành công!", { id: toastId });

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("email", data.email);
        localStorage.setItem("fullName", data.fullName);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.userId);

        if (data.candidateId) {
            localStorage.setItem("candidateId", data.candidateId);
        }

        setUser({
          id: data.userId,
          candidateId: data.candidateId,
          cvId: data.cvId,
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
  // REGISTER SUCCESS -> LOGIN LUÔN

  const loginRes = await fetch(`${API}/Auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const loginData = await loginRes.json();

  if (!loginRes.ok) {
    toast.success("Đăng ký thành công! Hãy đăng nhập.", { id: toastId });
    setIsLogin(true);
    return;
  }

  // LƯU TOKEN
  localStorage.setItem("accessToken", loginData.accessToken);
  localStorage.setItem("email", loginData.email);
  localStorage.setItem("fullName", loginData.fullName);
  localStorage.setItem("role", loginData.role);
  localStorage.setItem("userId", loginData.userId);

  setUser({
    id: loginData.userId,
    candidateId: loginData.candidateId,
    cvId: loginData.cvId,
    token: loginData.accessToken,
    email: loginData.email,
    fullName: loginData.fullName,
    role: loginData.role,
  });

  toast.success("Đăng ký và đăng nhập thành công!", { id: toastId });

  // ĐIỀU HƯỚNG
  if (loginData.role === 0) {
    navigate("/select-role");
  } else {
    navigate("/");
  }
}

    } catch (err) {
      console.error("Server error:", err);
      toast.error("Không thể kết nối server", { id: toastId });
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
          <h1>DevHire <span className="text-gradient">IT LOCAL</span></h1>
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