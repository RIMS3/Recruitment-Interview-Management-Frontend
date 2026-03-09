import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import axios from "axios";
import { User, Briefcase, Code2 } from "lucide-react";
import { AuthContext } from "./AuthContext";
import "./SelectRole.css";

export default function SelectRole() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  const handleSelect = async (role) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("Bạn chưa đăng nhập!");
        navigate("/login");
        return;
      }

      const res = await axios.post(
        "https://localhost:7272/api/auth/select-role",
        { role }, // ✅ Gửi trực tiếp số (backend nhận int)
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("SelectRole Response:", res.data);

      // ✅ Nếu backend trả token mới thì lưu
      if (res.data?.accessToken) {
        localStorage.setItem("accessToken", res.data.accessToken);
      }

      // ✅ Lưu role (ưu tiên backend trả về, nếu không thì dùng role vừa chọn)
      const newRole = res.data?.role ?? role;
      localStorage.setItem("role", newRole);
      
      if (res.data?.candidateId) {
      localStorage.setItem("candidateId", res.data.candidateId);
}

      // ✅ Update AuthContext an toàn
      setUser((prev) => ({
        ...prev,
        role: newRole,
        token: res.data?.accessToken ?? prev?.token,
      }));

      // ✅ Điều hướng
      if (newRole === 3) {
        navigate("/create-company");
      } else {
        navigate("/");
      }

    } catch (error) {
      console.error("Select role error:", error.response || error);
      alert("Có lỗi xảy ra khi chọn vai trò");
    }
  };

  return (
    <div className="selectrole-container">
      <div className="selectrole-card">
        <div className="selectrole-header">
          <div className="logo-box">
            <Code2 size={32} color="#00b14f" />
          </div>
          <h1>
            <span className="text-gradient">IT LOCAK</span>
          </h1>
          <p>Chọn vai trò để bắt đầu hành trình của bạn</p>
        </div>

        <div className="role-group">
          <div
            className="role-card candidate"
            onClick={() => handleSelect(2)}
          >
            <User size={40} />
            <h3>Ứng viên</h3>
            <p>Tìm kiếm việc làm IT phù hợp với bạn</p>
            <button type="button">Tiếp tục</button>
          </div>

          <div
            className="role-card employer"
            onClick={() => handleSelect(3)}
          >
            <Briefcase size={40} />
            <h3>Nhà tuyển dụng</h3>
            <p>Đăng tin tuyển dụng & tìm ứng viên tài năng</p>
            <button type="button">Tiếp tục</button>
          </div>
        </div>
      </div>
    </div>
  );
}