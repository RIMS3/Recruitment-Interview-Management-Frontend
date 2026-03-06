import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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

  // 1. STATE CHUẨN ĐỂ PUT JSON LÊN BACKEND (Đã bổ sung full các trường)
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
        // Đã sửa lỗi typo api/cFvs thành api/cvs
        const response = await fetch(`https://localhost:7272/api/cvs/${cvId}`);
        if (response.ok) {
          const data = await response.json();
          
          setCvData(prev => ({
            ...prev,
            ...data,
            // Đổ các trường thông tin cá nhân (Nếu null thì cho thành chuỗi rỗng)
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            address: data.address || "",
            birthday: data.birthday ? data.birthday.split('T')[0] : "", // Format ngày nếu cần
            gender: data.gender || "",
            nationality: data.nationality || "",
            field: data.field || "",
            educationSummary: data.educationSummary || "",
            currentSalary: data.currentSalary || "",
            experienceYears: data.experienceYears || "",
            
            // Đảm bảo dữ liệu mảng từ BE trả về nếu null thì vẫn là mảng rỗng để không lủng UI
            educations: data.educations || [],
            experiences: data.experiences || [],
            projects: data.projects || [],
            certificates: data.certificates || [],
            skills: data.skills || []
          }));
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

  // Hàm cập nhật các trường text cơ bản
  const handleTextChange = (field, value) => {
    setCvData(prevData => ({ ...prevData, [field]: value }));
  };

  // Hàm cập nhật các mảng dữ liệu (Học vấn, Kinh nghiệm...)
  const handleArrayChange = (arrayName, index, field, value) => {
    setCvData(prevData => {
      const newArray = [...(prevData[arrayName] || [])];
      if (!newArray[index]) newArray[index] = {}; 
      newArray[index][field] = value; 
      return { ...prevData, [arrayName]: newArray };
    });
  };

// 3. LƯU DỮ LIỆU BẰNG JSON (PUT /editor)
  const handleSaveCV = async () => {
    if (cvId.startsWith('mock-cv')) {
        alert("⚠️ Đang ở chế độ xem trước. Hãy quay lại chọn mẫu để tạo CV thật!");
        return;
    }

    setIsSaving(true);
    try {
      // --- BỘ LỌC AN TOÀN CHO C# ---
      // 1. Xử lý Giới tính: C# cần INT (0 hoặc 1). Nếu người dùng gõ chữ "nam"/"nữ" thì tự động dịch ra số.
      let safeGender = null;
      if (cvData.gender !== null && cvData.gender !== undefined && cvData.gender !== "") {
          const gStr = String(cvData.gender).toLowerCase().trim();
          if (gStr === "nam" || gStr === "0") safeGender = 0;
          else if (gStr === "nữ" || gStr === "nu" || gStr === "1") safeGender = 1;
          else if (!isNaN(gStr)) safeGender = parseInt(gStr);
      }

      // 2. Xử lý Ngày sinh: C# cần DateOnly chuẩn ISO (YYYY-MM-DD).
      let safeBirthday = null;
      if (cvData.birthday && cvData.birthday.trim() !== "") {
          let bStr = cvData.birthday.trim();
          
          // Nếu người dùng nhập dấu '/' (Ví dụ: 12/12/2022)
          if (bStr.includes('/')) {
              let parts = bStr.split('/');
              if (parts.length === 3) {
                  // Giả định định dạng là DD/MM/YYYY -> Đảo lại thành YYYY-MM-DD
                  let day = parts[0].padStart(2, '0');
                  let month = parts[1].padStart(2, '0');
                  let year = parts[2];
                  safeBirthday = `${year}-${month}-${day}`;
              } else {
                  safeBirthday = bStr;
              }
          } 
          // Nếu người dùng nhập dấu '-' theo kiểu DD-MM-YYYY (Ví dụ: 12-12-2022)
          else if (bStr.includes('-') && bStr.split('-')[0].length < 4) {
              let parts = bStr.split('-');
              let day = parts[0].padStart(2, '0');
              let month = parts[1].padStart(2, '0');
              let year = parts[2];
              safeBirthday = `${year}-${month}-${day}`;
          }
          else {
              safeBirthday = bStr; // Nếu đã chuẩn YYYY-MM-DD thì giữ nguyên
          }
      }
      // 3. Xử lý Lương & Kinh nghiệm: Ép về số, rỗng thành null
      let safeSalary = (cvData.currentSalary === "" || cvData.currentSalary === undefined) ? null : Number(cvData.currentSalary);
      let safeExpYears = (cvData.experienceYears === "" || cvData.experienceYears === undefined) ? null : Number(cvData.experienceYears);


      // ĐÓNG GÓI PAYLOAD GỬI ĐI
      const payload = {
        cvId: cvId,
        candidateId: cvData.candidateId || localStorage.getItem('candidateId'), 
        fullName: cvData.fullName || "",
        position: cvData.position || "",
        summary: cvData.summary || "",
        
        email: cvData.email || "",
        phoneNumber: cvData.phoneNumber || "",
        address: cvData.address || "",
        nationality: cvData.nationality || "",
        field: cvData.field || "",
        
        // Dùng các biến đã được lọc an toàn ở trên
        gender: safeGender,
        birthday: safeBirthday,
        currentSalary: safeSalary,
        experienceYears: safeExpYears,

        // --- CÁC MẢNG DỮ LIỆU ---
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

      console.log("🚀 CHUẨN BỊ GỬI PAYLOAD LÊN BACKEND:", JSON.stringify(payload, null, 2));

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
        console.error("Lỗi từ backend:", err);
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
    if (isLoading) return <div style={{padding: '50px', textAlign:'center'}}>Đang tải...</div>;

    switch (activeTemplateId) {
      case 'tpl-1': return <Template1 cvData={cvData} handleTextChange={handleTextChange} handleArrayChange={handleArrayChange} />;
      case 'tpl-2': return <Template2 cvData={cvData} handleTextChange={handleTextChange} handleArrayChange={handleArrayChange} />;
      case 'tpl-3': return <Template3 cvData={cvData} handleTextChange={handleTextChange} handleArrayChange={handleArrayChange} />;
      default: return <Template1 cvData={cvData} handleTextChange={handleTextChange} handleArrayChange={handleArrayChange} />;
    }
  };

  return (
    <div className="create-cv-layout">
      <aside className="cv-sidebar">
        <button className={`menu-btn ${activeTemplateId === 'tpl-1' ? 'active' : ''}`} onClick={() => setActiveTemplateId('tpl-1')}>Dùng Mẫu 1</button>
        <button className={`menu-btn ${activeTemplateId === 'tpl-2' ? 'active' : ''}`} onClick={() => setActiveTemplateId('tpl-2')}>Dùng Mẫu 2</button>
        <button className={`menu-btn ${activeTemplateId === 'tpl-3' ? 'active' : ''}`} onClick={() => setActiveTemplateId('tpl-3')}>Dùng Mẫu 3</button>
      </aside>

      <main className="cv-workspace">
        <div className="workspace-header">
          <input 
            type="text" 
            className="cv-name-input" 
            value={cvData.fullName || ""} 
            placeholder="CV chưa đặt tên"
            onChange={(e) => handleTextChange('fullName', e.target.value)} 
          />
          <button 
            className="btn-save" 
            onClick={handleSaveCV}
            disabled={isSaving || isLoading}
            style={{ opacity: (isSaving || isLoading) ? 0.7 : 1, cursor: (isSaving || isLoading) ? 'not-allowed' : 'pointer' }}
          >
            {isSaving ? '⏳ Đang lưu...' : '💾 Lưu CV'}
          </button>
        </div>
        {renderTemplate()}
      </main>
    </div>
  );
};

export default CreateCV;