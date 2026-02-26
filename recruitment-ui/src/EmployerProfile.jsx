import React, { useState, useEffect } from 'react';

const EmployerProfile = ({ userId }) => {
    const [profile, setProfile] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    // Sửa lại thành port thật của bạn
    const apiUrl = 'https://localhost:7272/api/employerprofiles'; 

    useEffect(() => {
        fetch(`${apiUrl}/user/${userId}`)
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                setFormData(data);
            })
            .catch(err => console.error("Lỗi tải dữ liệu Employer:", err));
    }, [userId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        fetch(`${apiUrl}/${profile.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(res => {
            if (res.ok) {
                alert("Cập nhật thông tin Nhà tuyển dụng thành công!");
                setProfile(formData);
                setIsEditing(false);
            }
        })
        .catch(err => console.error(err));
    };

    if (!profile.id) return <div style={{ padding: '20px' }}>Đang tải thông tin...</div>;

    return (
        <div style={{ padding: '30px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ color: '#2b345f', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Hồ sơ Nhà tuyển dụng</h2>
            
            {!isEditing ? (
                <div style={{ marginTop: '20px', lineHeight: '1.8' }}>
                    <p><strong>Chức vụ (Position):</strong> {profile.position || 'Chưa cập nhật'}</p>
                    <p><strong>Mã Công ty (Company ID):</strong> {profile.companyId}</p>
                    
                    <div style={{ textAlign: 'right', marginTop: '20px' }}>
                        <button onClick={() => setIsEditing(true)} style={{ padding: '10px 20px', backgroundColor: '#2b345f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Chỉnh sửa
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                    <div>
                        <label>Chức vụ hiện tại:</label>
                        <input name="position" value={formData.position || ''} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                    </div>
                    <div>
                        <label>Mã Công ty (Chỉ đọc):</label>
                        <input value={formData.companyId || ''} disabled style={{ width: '100%', padding: '8px', marginTop: '5px', backgroundColor: '#e9ecef' }} />
                        <small style={{ color: '#666' }}>Thường không tự thay đổi mã công ty ở đây.</small>
                    </div>
                    
                    <div style={{ textAlign: 'right', marginTop: '10px' }}>
                        <button onClick={() => setIsEditing(false)} style={{ padding: '10px 20px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
                            Hủy
                        </button>
                        <button onClick={handleSave} style={{ padding: '10px 20px', backgroundColor: '#2b345f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployerProfile;