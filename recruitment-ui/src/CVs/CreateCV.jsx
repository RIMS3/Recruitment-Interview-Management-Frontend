import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js'; 
import Template1 from './Templates/Template1';
import Template2 from './Templates/Template2';
import Template3 from './Templates/Template3';
import './CreateCV.css';

const CreateCV = () => {
  const { cvId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialTemplate = location.state?.selectedTemplate || 'tpl-1';
  const [activeTemplateId, setActiveTemplateId] = useState(initialTemplate); 
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const cvRef = useRef(null); 
  const fileInputRef = useRef(null); 

  // --- THÊM STATE QUẢN LÝ POPUP ---
  const [popup, setPopup] = useState({
    isOpen: false,
    type: 'alert', // 'alert' hoặc 'error'
    message: ''
  });

  const [cvData, setCvData] = useState({
    cvId: cvId,
    candidateId: "",
    fullName: "",
    position: "",
    summary: "",
    email: "",
    phoneNumber: "",
    address: "",
    birthday: "",
    gender: "",
    nationality: "",
    field: "",
    educationSummary: "",
    currentSalary: "",
    experienceYears: "",
    fileUrl: "", 
    educations: [],
    experiences: [],
    projects: [],
    certificates: [],
    skills: []
  });

  // --- HÀM HELPER ĐỂ MỞ/ĐÓNG POPUP ---
  const showPopup = (message, type = 'alert') => {
    setPopup({ isOpen: true, message, type });
  };

  const closePopup = () => {
    setPopup({ ...popup, isOpen: false });
  };

  useEffect(() => {
    const fetchCVData = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cvs/${cvId}/editor`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          setCvData(prev => ({
            ...prev,
            ...data,
            email: data.email || "",
            phoneNumber: data.phoneNumber === '[BẢN NHÁP]' ? "" : (data.phoneNumber || ""),
            address: data.address || "",
            birthday: data.birthday ? data.birthday.split('T')[0] : "",
            gender: data.gender !== null ? String(data.gender) : "",
            nationality: data.nationality || "",
            field: data.field || "",
            
            summary: data.summary || "",
            educationSummary: data.summary || "", 
            
            currentSalary: data.currentSalary !== null ? String(data.currentSalary) : "",
            experienceYears: data.experienceYears !== null ? String(data.experienceYears) : "",
            fileUrl: data.fileUrl || "",
            
            educations: data.educations || [],
            experiences: data.experiences || [],
            projects: data.projects || [],
            certificates: data.certificates || [],
            skills: data.skills || []
          }));

          if (data.templateId) {
            setActiveTemplateId(data.templateId);
          }
        }
      } catch (error) {
        console.warn("Lỗi API, không thể tải CV:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!cvId.startsWith('mock-cv')) fetchCVData();
    else setIsLoading(false);
  }, [cvId]);

  const handleTextChange = (field, value) => {
    setCvData(prevData => ({ ...prevData, [field]: value }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setCvData(prevData => {
      const newArray = [...(prevData[arrayName] || [])];
      if (!newArray[index]) newArray[index] = {}; 
      newArray[index][field] = value; 
      return { ...prevData, [arrayName]: newArray };
    });
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setCvData(prev => ({ ...prev, fileUrl: previewUrl }));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cvs/${cvId}/avatar`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setCvData(prev => ({ ...prev, fileUrl: data.fileUrl }));
      } else {
        showPopup("Lỗi khi upload ảnh lên server!", "error");
      }
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      showPopup("Đã xảy ra lỗi khi upload ảnh.", "error");
    }
  };

  const handleExportPDF = () => {
    const element = cvRef.current; 
    if (!element) return;

    const fileName = cvData.fullName 
      ? `CV_${cvData.fullName.trim().replace(/\s+/g, '_')}.pdf` 
      : 'My_CV.pdf';

    const opt = {
      margin:       0,
      filename:     fileName,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true }, 
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleSaveCV = async () => {
    if (cvId.startsWith('mock-cv')) {
        showPopup("⚠️ Đang ở chế độ xem trước. Hãy quay lại chọn mẫu để tạo CV thật!", "error");
        return;
    }

    if (!cvData.fullName || cvData.fullName.trim() === "") {
        showPopup("❌ Vui lòng nhập Họ và tên!", "error");
        return; 
    }

    if (cvData.birthday && cvData.birthday.trim() !== "") {
        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/; 
        const dateRegexDB = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/; 
        const bStr = cvData.birthday.trim();
        
        if (!dateRegex.test(bStr) && !dateRegexDB.test(bStr)) {
            showPopup("❌ Định dạng Ngày sinh không hợp lệ!\nVui lòng nhập đúng định dạng: DD/MM/YYYY (Ví dụ: 26/05/1996)", "error");
            return;
        }
    }

    if (cvData.experienceYears && Number(cvData.experienceYears) >= 100) {
        showPopup("❌ Số năm kinh nghiệm phải nhỏ hơn 100!", "error");
        return;
    }

    if (cvData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cvData.email.trim())) {
            showPopup("❌ Định dạng Email không hợp lệ!", "error");
            return;
        }
    }

    if (cvData.phoneNumber) {
        const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
        if (!phoneRegex.test(cvData.phoneNumber.replace(/\s+/g, ''))) {
            showPopup("❌ Số điện thoại không hợp lệ (Phải là số ĐT Việt Nam 10 số)!", "error");
            return;
        }
    }

    for (let i = 0; i < (cvData.experiences || []).length; i++) {
        const exp = cvData.experiences[i];
        if ((exp.position || exp.description) && (!exp.companyName || exp.companyName.trim() === "")) {
            showPopup(`❌ Kinh nghiệm làm việc #${i + 1}: Vui lòng nhập Tên Công ty/Tổ chức!`, "error");
            return;
        }
    }

    setIsSaving(true);
    try {
      let safeSalary = (cvData.currentSalary === "" || cvData.currentSalary === undefined) ? null : Number(cvData.currentSalary);
      let safeExpYears = (cvData.experienceYears === "" || cvData.experienceYears === undefined) ? null : Number(cvData.experienceYears);

      let safeBirthday = null;
      if (cvData.birthday && cvData.birthday.trim() !== "") {
          let bStr = cvData.birthday.trim();
          if (bStr.includes('/')) {
              let parts = bStr.split('/');
              safeBirthday = `${parts[2]}-${parts[1]}-${parts[0]}`; 
          } else {
              safeBirthday = bStr;
          }
      }

      const payload = {
        cvId: cvId,
        templateId: activeTemplateId, 
        candidateId: cvData.candidateId || localStorage.getItem('candidateId'), 
        fullName: cvData.fullName || "",
        position: cvData.position || "",
        summary: cvData.summary || "",
        email: cvData.email || "",
        phoneNumber: cvData.phoneNumber || "",
        address: cvData.address || "",
        nationality: cvData.nationality || "",
        field: cvData.field || "",
        gender: cvData.gender !== "" ? Number(cvData.gender) : null,
        birthday: safeBirthday, 
        currentSalary: safeSalary,
        experienceYears: safeExpYears,
        educations: (cvData.educations || []).map(item => ({
            id: item.id || undefined, 
            schoolName: item.schoolName || "",
            major: item.major || "",
            startDate: item.startDate || null,
            endDate: item.endDate || null,
            description: item.description || ""
        })),
        experiences: (cvData.experiences || []).map(item => ({
            id: item.id || undefined,
            companyName: item.companyName || "",
            position: item.position || "",
            startDate: item.startDate || null,
            endDate: item.endDate || null,
            description: item.description || ""
        })),
        projects: (cvData.projects || []).map(item => ({
            id: item.id || undefined,
            projectName: item.projectName || "",
            role: item.role || "",
            startDate: item.startDate || null,
            endDate: item.endDate || null,
            description: item.description || ""
        })),
        certificates: (cvData.certificates || []).map(item => ({
            id: item.id || undefined,
            certificateName: item.certificateName || "",
            organization: item.organization || "",
            issueDate: item.issueDate || null,
            expiredDate: item.expiredDate || null
        })),
        skills: (cvData.skills || []).map(item => ({
            skillName: item.skillName || "",
            level: item.level ? Number(item.level) : 0 
        }))
      };

      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cvs/${cvId}/editor`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showPopup("🎉 Đã lưu CV thành công!", "success");
      } else {
        let errorMsg = "Lỗi không xác định từ server.";
        try {
            const errorData = await response.json(); 
            if (errorData.errors) {
                errorMsg = Object.values(errorData.errors).flat().join('\n');
            } else if (errorData.message) {
                errorMsg = errorData.message;
            } else {
                errorMsg = JSON.stringify(errorData);
            }
        } catch (e) {
            errorMsg = await response.text(); 
        }
        throw new Error(errorMsg); 
      }
    } catch (error) {
      console.error("Lỗi khi lưu CV:", error);
      showPopup(`❌ Lưu thất bại!\n\nChi tiết lỗi:\n${error.message}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const renderTemplate = () => {
    if (isLoading) return <div className="loading-spinner">Đang tải dữ liệu CV...</div>;

    const templateProps = { 
      cvData, 
      handleTextChange, 
      handleArrayChange, 
      onAvatarClick: handleAvatarClick 
    };

    switch (activeTemplateId) {
      case 'tpl-1': return <Template1 {...templateProps} />;
      case 'tpl-2': return <Template2 {...templateProps} />;
      case 'tpl-3': return <Template3 {...templateProps} />;
      default: return <Template1 {...templateProps} />;
    }
  };

  return (
    <div className="create-cv-layout">
      <input 
        type="file" 
        accept="image/*" 
        style={{ display: 'none' }} 
        ref={fileInputRef} 
        onChange={handleAvatarChange} 
      />

      <header className="workspace-header">
        <div className="header-container">
          {/* NÚT QUAY LẠI VÀ INPUT TÊN CV */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
            <button 
              onClick={() => navigate('/manage-cv')} 
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'transparent', border: 'none', color: '#666',
                cursor: 'pointer', fontSize: '15px', fontWeight: '500', padding: '8px 12px',
                borderRadius: '6px', transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#333'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#666'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Quay lại
            </button>

            <input 
              type="text" 
              className="cv-name-input" 
              value={cvData.fullName || ""} 
              placeholder="Nhập tên CV của bạn..."
              onChange={(e) => handleTextChange('fullName', e.target.value)} 
              disabled={isLoading}
              style={{ flex: 1, maxWidth: '300px' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn-export" 
              onClick={handleExportPDF}
              style={{
                backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px 24px', 
                borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(239, 68, 68, 0.2)', transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => { e.target.style.backgroundColor = '#dc2626'; e.target.style.transform = 'translateY(-1px)'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = '#ef4444'; e.target.style.transform = 'translateY(0)'; }}
            >
              📄 Xuất PDF
            </button>

            <button 
              className={`btn-save ${(isSaving || isLoading) ? 'disabled' : ''}`} 
              onClick={handleSaveCV}
              disabled={isSaving || isLoading}
            >
              {isSaving ? '⏳ Đang xử lý...' : '💾 Lưu CV ngay'}
            </button>
          </div>
        </div>
      </header>

      <main className="cv-workspace">
        <div ref={cvRef}>
          {renderTemplate()}
        </div>
      </main>

      {/* RENDER POPUP */}
      {popup.isOpen && (
        <div className="custom-popup-overlay">
          <div className="custom-popup-box">
            <h4 className="custom-popup-title" style={{ color: popup.type === 'error' ? '#d9534f' : '#333' }}>
              {popup.type === 'error' ? 'Lỗi' : 'Thông báo'}
            </h4>
            <p className="custom-popup-message" style={{ whiteSpace: 'pre-wrap' }}>{popup.message}</p>
            <div className="custom-popup-actions">
              <button 
                className={`btn-popup-confirm ${popup.type === 'error' ? 'btn-danger' : 'btn-primary'}`}
                onClick={closePopup}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCV;