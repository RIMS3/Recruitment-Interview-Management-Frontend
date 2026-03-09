import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';
import './CVTemplates.css';

const CVTemplates = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isCallingApi, setIsCallingApi] = useState(false);

  const [templates, setTemplates] = useState([
    { id: 'tpl-1', name: 'Mẫu Sang trọng (Xanh rêu)', imgUrl: 'https://placehold.co/300x420/8c9e82/ffffff?text=Loading...' },
    { id: 'tpl-2', name: 'Mẫu TikTok (Dark Mode)', imgUrl: 'https://placehold.co/300x420/111111/ffffff?text=Loading...' },
    { id: 'tpl-3', name: 'Mẫu Hiện đại (Vàng xám)', imgUrl: 'https://placehold.co/300x420/FDF7E7/333333?text=Loading...' }
  ]);

  // Tải danh sách ảnh mẫu từ Backend
  useEffect(() => {
    const fetchTemplateImages = async () => {
      try {
        const response = await fetch('https://localhost:7272/api/cvs/images');
        if (response.ok) {
          const imageUrls = await response.json(); 
          setTemplates(prevTemplates => prevTemplates.map((tpl, index) => {
            const matchedUrl = imageUrls.find(url => url.includes(`template${index + 1}.png`)) 
                               || imageUrls[index] 
                               || tpl.imgUrl;
            return { ...tpl, imgUrl: matchedUrl };
          }));
        }
      } catch (error) {
        console.error("Lỗi khi load ảnh templates từ API:", error);
      }
    };
    fetchTemplateImages();
  }, []);

  const handleSelectTemplate = async (templateId) => {
    setIsCallingApi(true);

    try {
      // 1. Lấy Token đăng nhập
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("⚠️ Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!");
        setIsCallingApi(false);
        return;
      }

      // 2. GỌI API LẤY CANDIDATE ID TỪ BACKEND
      // Lưu ý: Đảm bảo bạn đã viết API này bên Backend C# nhé
      const profileRes = await fetch('https://localhost:7272/api/cvs/my-candidate-id', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Truyền token để Backend nhận diện user
          'Content-Type': 'application/json'
        }
      });

      if (!profileRes.ok) {
        alert("⚠️ Không tìm thấy thông tin Ứng viên trên hệ thống!");
        setIsCallingApi(false);
        return;
      }

      const profileData = await profileRes.json();
      const realCandidateId = profileData.candidateId || profileData.id; 

      if (!realCandidateId) {
        alert("⚠️ Dữ liệu Ứng viên trả về không hợp lệ!");
        setIsCallingApi(false);
        return;
      }

      console.log("Đã lấy được ID từ API:", realCandidateId);

      // 3. GỌI API POST TẠO CV MỚI
      const formData = new FormData();
      formData.append('candidateId', realCandidateId); 
      formData.append('fullName', user?.fullName || 'CV chưa đặt tên'); 
      formData.append('position', 'Vị trí ứng tuyển');
      formData.append('email', user?.email || '');
      formData.append('isDefault', 'true');
      
      // ✅ BỔ SUNG DÒNG NÀY ĐỂ BÁO CHO BACKEND BIẾT BẠN CHỌN MẪU NÀO
      formData.append('templateId', templateId); 

      const response = await fetch('https://localhost:7272/api/cvs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` 
        },
        body: formData 
      });

      if (response.ok) {
        const data = await response.json();
        // Chuyển hướng sang trang Edit với ID thật vừa được tạo
        navigate(`/create-cv/${data.id}`, { state: { selectedTemplate: templateId } });
      } else {
        const errorText = await response.text();
        console.error("Lỗi từ Backend:", errorText);
        throw new Error(`Gọi API tạo CV thất bại: ${errorText}`);
      }

    } catch (error) {
      console.error("Lỗi khi xử lý chọn mẫu:", error);
      alert("Có lỗi xảy ra khi tạo bản nháp CV. Vui lòng kiểm tra Console (F12).");
    } finally {
      setIsCallingApi(false);
    }
  };

  return (
    <div className="template-container">
      <div className="template-header">
        <p className="breadcrumb">Trang chủ {'>'} Mẫu CV tiếng Việt</p>
        <h1>Mẫu CV xin việc tiếng Việt chuẩn 2026</h1>
      </div>

      {isCallingApi && <div className="loading-overlay">Đang khởi tạo CV...</div>}

      <div className="template-grid">
        {templates.map(tpl => (
          <div className="template-card" key={tpl.id}>
            <div className="template-img-wrapper">
              <img src={tpl.imgUrl} alt={tpl.name} />
              <div className="template-overlay">
                <button 
                  className="btn-use-template"
                  onClick={() => handleSelectTemplate(tpl.id)}
                  disabled={isCallingApi}
                >
                  Dùng mẫu này
                </button>
              </div>
            </div>
            <p className="template-name">{tpl.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CVTemplates;