import React, { useState, useEffect, useRef } from 'react';

const CandidateProfile = () => {
    const [profile, setProfile] = useState({});
    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const fileInputRef = useRef(null);

    const currentUserId = localStorage.getItem("userId"); 
    const apiUrl = "https://localhost:7272/api/candidateprofiles";

    // 2. TẠO MÀNG BẢO VỆ: CHẶN NGƯỜI CHƯA ĐĂNG NHẬP
    if (!currentUserId) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', marginTop: '50px' }}>
                <h2 style={{ color: '#ff4d4f' }}>Bạn chưa đăng nhập!</h2>
                <p style={{ fontSize: '16px', color: '#555' }}>Vui lòng đăng nhập để xem và chỉnh sửa hồ sơ cá nhân của bạn.</p>
                {/* Bạn có thể dùng useNavigate hoặc thẻ <a> để dẫn họ về trang /login ở đây */}
            </div>
        );
    }

    useEffect(() => {
        fetch(`${apiUrl}/user/${currentUserId}`)
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                // Cắt bỏ phần giờ phút, chỉ lấy ngày tháng năm để đưa vào input type="date"
                const formattedData = { ...data };
                if (formattedData.dateOfBirth) {
                    formattedData.dateOfBirth = formattedData.dateOfBirth.split('T')[0];
                }
                setFormData(formattedData);
            })
            .catch(err => console.error("Lỗi tải dữ liệu:", err));
    }, [currentUserId]);

    // Xử lý Upload Ảnh
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataFile = new FormData();
        formDataFile.append("file", file);

        setIsUploading(true);
        fetch(`${apiUrl}/${profile.id}/avatar`, {
            method: 'POST',
            body: formDataFile,
        })
        .then(res => res.json())
        .then(data => {
            if (data.avatarUrl) {
                alert("Cập nhật ảnh đại diện thành công!");
                
                // 1. Cập nhật ảnh lên màn hình
                setProfile(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
                
                // 2. Ghi chú ảnh mới vào bản nháp để khi lưu chữ không bị mất ảnh
                setFormData(prev => ({ ...prev, avatarUrl: data.avatarUrl })); 
            }
        })
        .catch(err => alert("Lỗi tải ảnh lên!"))
        .finally(() => {
            setIsUploading(false);
            e.target.value = null; 
        });
    };

    // Xử lý nhập form chữ
    const handleInputChange = (e) => {
        const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    // Xử lý lưu thông tin (PUT)
    const handleSaveProfile = () => {
        // Đảm bảo Gender là số nguyên theo Enum C#
        const payload = { ...formData, gender: parseInt(formData.gender) || 0 };

        fetch(`${apiUrl}/${profile.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(res => {
            if (res.ok) {
                alert("Cập nhật thông tin thành công!");
                // Chỉ đè phần thông tin chữ mới lên, giữ nguyên avatar
                setProfile(prev => ({ ...prev, ...payload })); 
                setIsEditing(false);
            } else {
                alert("Có lỗi khi lưu thông tin.");
            }
        });
    };

    if (!profile.id) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải dữ liệu hồ sơ...</div>;
    const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    return (
        <div style={styles.container}>
            <h2 style={{ color: '#00b14f', textAlign: 'center', marginBottom: '30px' }}>Hồ sơ Ứng viên</h2>
            
            {/* KHU VỰC AVATAR */}
            <div style={styles.avatarSection}>
                <div style={styles.avatarWrapper}>
                    <img src={profile.avatarUrl || defaultAvatar} alt="Avatar" style={{...styles.avatarImage, opacity: isUploading ? 0.5 : 1}} />
                    <button onClick={() => fileInputRef.current.click()} style={styles.cameraButton} disabled={isUploading}>📷</button>
                </div>
                <p style={{ fontSize: '13px', color: '#888' }}>{isUploading ? "Đang xử lý..." : "Đổi ảnh đại diện"}</p>
                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>

            {/* KHU VỰC THÔNG TIN */}
            {!isEditing ? (
                // Chế độ xem
                <div style={styles.infoGrid}>
                    <p><strong>Ngày sinh:</strong> {profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : 'Chưa có'}</p>
                    <p><strong>Địa chỉ:</strong> {profile.address || 'Chưa có'}</p>
                    <p><strong>Kinh nghiệm:</strong> {profile.experienceYears != null ? `${profile.experienceYears} năm` : 'Chưa có'}</p>
                    <p><strong>Cấp bậc:</strong> {profile.jobLevel || 'Chưa có'}</p>
                    <p><strong>Lương hiện tại:</strong> {profile.currentSalary ? `${profile.currentSalary} triệu` : 'Chưa có'}</p>
                    <p><strong>Lương mong muốn:</strong> {profile.desiredSalary ? `${profile.desiredSalary} triệu` : 'Chưa có'}</p>
                    <div style={{ gridColumn: 'span 2' }}>
                        <p><strong>Giới thiệu bản thân:</strong></p>
                        <p style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>{profile.summary || 'Chưa cập nhật'}</p>
                    </div>
                    <div style={{ gridColumn: 'span 2', textAlign: 'center', marginTop: '15px' }}>
                        <button onClick={() => setIsEditing(true)} style={styles.editButton}>Chỉnh sửa hồ sơ</button>
                    </div>
                </div>
            ) : (
                // Chế độ sửa
                <div style={styles.infoGrid}>
                    <div><label>Ngày sinh:</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleInputChange} style={styles.input} /></div>
                    <div><label>Địa chỉ:</label><input type="text" name="address" value={formData.address || ''} onChange={handleInputChange} style={styles.input} /></div>
                    <div><label>Kinh nghiệm (năm):</label><input type="number" name="experienceYears" value={formData.experienceYears || ''} onChange={handleInputChange} style={styles.input} /></div>
                    <div><label>Cấp bậc mong muốn:</label><input type="text" name="jobLevel" value={formData.jobLevel || ''} onChange={handleInputChange} style={styles.input} /></div>
                    <div><label>Lương hiện tại (triệu):</label><input type="number" name="currentSalary" value={formData.currentSalary || ''} onChange={handleInputChange} style={styles.input} /></div>
                    <div><label>Lương mong muốn (triệu):</label><input type="number" name="desiredSalary" value={formData.desiredSalary || ''} onChange={handleInputChange} style={styles.input} /></div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label>Giới thiệu bản thân:</label>
                        <textarea name="summary" value={formData.summary || ''} onChange={handleInputChange} rows="4" style={styles.input}></textarea>
                    </div>
                    <div style={{ gridColumn: 'span 2', textAlign: 'center', marginTop: '15px' }}>
                        <button onClick={() => setIsEditing(false)} style={styles.cancelButton}>Hủy bỏ</button>
                        <button onClick={handleSaveProfile} style={styles.saveButton}>Lưu thay đổi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// CSS dùng chung
const styles = {
    container: { maxWidth: '800px', margin: '40px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontFamily: 'Arial, sans-serif' },
    avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' },
    avatarWrapper: { position: 'relative', width: '130px', height: '130px' },
    avatarImage: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #00b14f' },
    cameraButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '50%', padding: '8px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', backgroundColor: '#f9f9f9', padding: '25px', borderRadius: '8px' },
    input: { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' },
    editButton: { padding: '10px 25px', backgroundColor: '#00b14f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    saveButton: { padding: '10px 25px', backgroundColor: '#00b14f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    cancelButton: { padding: '10px 25px', backgroundColor: '#e0e0e0', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginRight: '15px' }
};

export default CandidateProfile;