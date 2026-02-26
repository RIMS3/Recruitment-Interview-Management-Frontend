import React, { useState, useEffect } from 'react';

const CandidateProfile = ({ userId }) => {
    const [profile, setProfile] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    // Sửa lại thành port thật của bạn (VD: 7272)
    const apiUrl = 'https://localhost:7272/api/candidateprofiles'; 

    useEffect(() => {
        fetch(`${apiUrl}/user/${userId}`)
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                // Xử lý cắt chuỗi ngày tháng (nếu có giờ phút) để gắn vào input type="date"
                const formattedData = { ...data };
                if (formattedData.dateOfBirth) {
                    formattedData.dateOfBirth = formattedData.dateOfBirth.split('T')[0];
                }
                setFormData(formattedData);
            })
            .catch(err => console.error("Lỗi khi tải dữ liệu:", err));
    }, [userId]);

    const handleChange = (e) => {
        const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSave = () => {
        // Ép kiểu Gender về số nguyên trước khi gửi
        const payload = { ...formData, gender: parseInt(formData.gender) || 0 };

        fetch(`${apiUrl}/${profile.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (res.ok) {
                alert("Cập nhật hồ sơ thành công!");
                setProfile(payload);
                setIsEditing(false);
            } else {
                alert("Có lỗi xảy ra khi cập nhật!");
            }
        })
        .catch(err => console.error(err));
    };

    // Hàm phụ trợ: Dịch giới tính từ số sang chữ
    const getGenderText = (genderCode) => {
        if (genderCode === 1) return "Nam";
        if (genderCode === 2) return "Nữ";
        if (genderCode === 3) return "Khác";
        return "Chưa cập nhật";
    };

    if (!profile.id) return <div style={{ padding: '20px' }}>Đang tải dữ liệu hồ sơ...</div>;

    return (
        <div style={{ padding: '30px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: '#00b14f', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Hồ sơ Ứng viên</h2>
            
            {!isEditing ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                    <p><strong>Ngày sinh:</strong> {profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : 'Chưa cập nhật'}</p>
                    <p><strong>Giới tính:</strong> {getGenderText(profile.gender)}</p>
                    <p><strong>Địa chỉ:</strong> {profile.address || 'Chưa cập nhật'}</p>
                    <p><strong>Kinh nghiệm:</strong> {profile.experienceYears != null ? `${profile.experienceYears} năm` : 'Chưa cập nhật'}</p>
                    <p><strong>Cấp bậc mong muốn:</strong> {profile.jobLevel || 'Chưa cập nhật'}</p>
                    <p><strong>Lương hiện tại:</strong> {profile.currentSalary ? `${profile.currentSalary.toLocaleString()} VNĐ` : 'Chưa cập nhật'}</p>
                    <p><strong>Lương mong muốn:</strong> {profile.desiredSalary ? `${profile.desiredSalary.toLocaleString()} VNĐ` : 'Chưa cập nhật'}</p>
                    <div style={{ gridColumn: 'span 2' }}>
                        <p><strong>Tóm tắt bản thân:</strong></p>
                        <p style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
                            {profile.summary || 'Chưa có thông tin giới thiệu.'}
                        </p>
                    </div>
                    <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                        <button onClick={() => setIsEditing(true)} style={{ padding: '10px 20px', backgroundColor: '#00b14f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Chỉnh sửa hồ sơ
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                    <div>
                        <label>Ngày sinh:</label>
                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                    </div>
                    <div>
                        <label>Giới tính:</label>
                        <select name="gender" value={formData.gender || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                            <option value={0}>-- Chọn giới tính --</option>
                            <option value={1}>Nam</option>
                            <option value={2}>Nữ</option>
                            <option value={3}>Khác</option>
                        </select>
                    </div>
                    <div>
                        <label>Địa chỉ:</label>
                        <input name="address" value={formData.address || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                    </div>
                    <div>
                        <label>Kinh nghiệm (năm):</label>
                        <input type="number" name="experienceYears" value={formData.experienceYears || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                    </div>
                    <div>
                        <label>Lương hiện tại (VNĐ):</label>
                        <input type="number" name="currentSalary" value={formData.currentSalary || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                    </div>
                    <div>
                        <label>Lương mong muốn (VNĐ):</label>
                        <input type="number" name="desiredSalary" value={formData.desiredSalary || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label>Cấp bậc hiện tại / mong muốn (Ví dụ: Intern, Fresher, Middle):</label>
                        <input name="jobLevel" value={formData.jobLevel || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label>Tóm tắt bản thân:</label>
                        <textarea name="summary" value={formData.summary || ''} onChange={handleChange} rows="5" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                    </div>
                    
                    <div style={{ gridColumn: 'span 2', textAlign: 'right', marginTop: '10px' }}>
                        <button onClick={() => setIsEditing(false)} style={{ padding: '10px 20px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
                            Hủy
                        </button>
                        <button onClick={handleSave} style={{ padding: '10px 20px', backgroundColor: '#00b14f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateProfile;