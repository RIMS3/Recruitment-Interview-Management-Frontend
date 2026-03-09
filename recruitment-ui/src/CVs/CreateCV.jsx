import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import html2pdf from 'html2pdf.js'; // 👉 THÊM: Import thư viện xuất PDF
import Template1 from './Templates/Template1';
import Template2 from './Templates/Template2';
import Template3 from './Templates/Template3';
import './CreateCV.css';

const CreateCV = () => {
  const { cvId } = useParams();
  const location = useLocation();

  const initialTemplate = location.state?.selectedTemplate || 'tpl-1';
  const [activeTemplateId, setActiveTemplateId] = useState(initialTemplate); 
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 👉 THÊM: Tạo ref để "móc" vào khung CV cần xuất PDF
  const cvRef = useRef(null); 

  // 1. STATE CHUẨN ĐỂ PUT JSON LÊN BACKEND
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
    educations: [],
    experiences: [],
    projects: [],
    certificates: [],
    skills: []
  });

  // 2. TẢI DỮ LIỆU TỪ DB LÊN (GET)
  useEffect(() => {
    const fetchCVData = async () => {
      try {
        const response = await fetch(`https://localhost:7272/api/cvs/${cvId}`);
        if (response.ok) {
          const data = await response.json();
          
          setCvData(prev => ({
            ...prev,
            ...data,
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            address: data.address || "",
            birthday: data.birthday ? data.birthday.split('T')[0] : "",
            gender: data.gender || "",
            nationality: data.nationality || "",
            field: data.field || "",
            educationSummary: data.educationSummary || "",
            currentSalary: data.currentSalary || "",
            experienceYears: data.experienceYears || "",
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

  // 👉 THÊM: HÀM XỬ LÝ XUẤT PDF
  const handleExportPDF = () => {
    const element = cvRef.current; // Lấy thẻ div chứa CV
    if (!element) return;

    // Đặt tên file thân thiện (Bỏ dấu cách thay bằng dấu _)
    const fileName = cvData.fullName 
      ? `CV_${cvData.fullName.trim().replace(/\s+/g, '_')}.pdf` 
      : 'My_CV.pdf';

    const opt = {
      margin:       0,
      filename:     fileName,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true }, // Cực quan trọng để load ảnh Avatar từ server khác
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Biến hóa HTML thành PDF và tải về
    html2pdf().set(opt).from(element).save();
  };

  // 3. LƯU DỮ LIỆU BẰNG JSON (PUT /editor)
  const handleSaveCV = async () => {
    if (cvId.startsWith('mock-cv')) {
        alert("⚠️ Đang ở chế độ xem trước. Hãy quay lại chọn mẫu để tạo CV thật!");
        return;
    }

    setIsSaving(true);
    try {
      let safeGender = null;
      if (cvData.gender !== null && cvData.gender !== undefined && cvData.gender !== "") {
          const gStr = String(cvData.gender).toLowerCase().trim();
          if (gStr === "nam" || gStr === "0") safeGender = 0;
          else if (gStr === "nữ" || gStr === "nu" || gStr === "1") safeGender = 1;
          else if (!isNaN(gStr)) safeGender = parseInt(gStr);
      }

      let safeBirthday = null;
      if (cvData.birthday && cvData.birthday.trim() !== "") {
          let bStr = cvData.birthday.trim();
          if (bStr.includes('/')) {
              let parts = bStr.split('/');
              if (parts.length === 3) {
                  let day = parts[0].padStart(2, '0');
                  let month = parts[1].padStart(2, '0');
                  let year = parts[2];
                  safeBirthday = `${year}-${month}-${day}`;
              } else { safeBirthday = bStr; }
          } 
          else if (bStr.includes('-') && bStr.split('-')[0].length < 4) {
              let parts = bStr.split('-');
              let day = parts[0].padStart(2, '0');
              let month = parts[1].padStart(2, '0');
              let year = parts[2];
              safeBirthday = `${year}-${month}-${day}`;
          }
          else { safeBirthday = bStr; }
      }

      let safeSalary = (cvData.currentSalary === "" || cvData.currentSalary === undefined) ? null : Number(cvData.currentSalary);
      let safeExpYears = (cvData.experienceYears === "" || cvData.experienceYears === undefined) ? null : Number(cvData.experienceYears);

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
        gender: safeGender,
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
      const response = await fetch(`https://localhost:7272/api/cvs/${cvId}/editor`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("🎉 Đã lưu CV thành công!");
      } else {
        const err = await response.text();
        throw new Error(`API báo lỗi: ${response.status} - ${err}`);
      }
    } catch (error) {
      console.error("Lỗi khi lưu CV:", error);
      alert("❌ Lưu thất bại! Hãy kiểm tra lại Console (F12).");
    } finally {
      setIsSaving(false);
    }
  };

  const renderTemplate = () => {
    if (isLoading) return <div className="loading-spinner">Đang tải dữ liệu CV...</div>;

    switch (activeTemplateId) {
      case 'tpl-1': return <Template1 cvData={cvData} handleTextChange={handleTextChange} handleArrayChange={handleArrayChange} />;
      case 'tpl-2': return <Template2 cvData={cvData} handleTextChange={handleTextChange} handleArrayChange={handleArrayChange} />;
      case 'tpl-3': return <Template3 cvData={cvData} handleTextChange={handleTextChange} handleArrayChange={handleArrayChange} />;
      default: return <Template1 cvData={cvData} handleTextChange={handleTextChange} handleArrayChange={handleArrayChange} />;
    }
  };

  return (
    <div className="create-cv-layout">
      {/* Header nổi (Sticky Bar) chứa Tên CV và Nút Lưu / Nút PDF */}
      <header className="workspace-header">
        <div className="header-container">
          <input 
            type="text" 
            className="cv-name-input" 
            value={cvData.fullName || ""} 
            placeholder="Nhập tên CV của bạn..."
            onChange={(e) => handleTextChange('fullName', e.target.value)} 
            disabled={isLoading}
          />
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* 👉 THÊM: Nút bấm Xuất PDF */}
            <button 
              className="btn-export" 
              onClick={handleExportPDF}
              style={{
                backgroundColor: '#ef4444', 
                color: 'white', 
                border: 'none', 
                padding: '10px 24px', 
                borderRadius: '6px', 
                fontSize: '15px', 
                fontWeight: '600', 
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(239, 68, 68, 0.2)',
                transition: 'all 0.2s ease'
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

      {/* Khu vực giấy A4 hiển thị CV */}
      <main className="cv-workspace">
        {/* 👉 THÊM: Gắn ref vào div bọc template để làm mốc chụp PDF */}
        <div ref={cvRef}>
          {renderTemplate()}
        </div>
      </main>
    </div>
  );
};

export default CreateCV;