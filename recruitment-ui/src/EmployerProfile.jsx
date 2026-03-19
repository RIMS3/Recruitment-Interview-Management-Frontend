import React, { useState, useEffect, useRef } from 'react';

// BỎ prop { userId } đi
const EmployerProfile = () => {
    // TỰ LẤY ID TỪ LOCAL STORAGE TẠI ĐÂY
    const userId = localStorage.getItem("userId");

    const [profile, setProfile] = useState({});
    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef(null);

    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/employerprofiles`;

    useEffect(() => {
        // Chặn lỗi: Nếu chưa có userId thì không gọi API
        if (!userId || userId === "undefined") {
            console.warn("Chưa có userId, ngừng gọi API");
            return;
        }

        fetch(`${apiUrl}/user/${userId}`)
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                setFormData(data);
            })
            .catch(err => console.error("Lỗi tải dữ liệu công ty:", err));
    }, [userId, apiUrl]);

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
                    alert("Cập nhật Logo công ty thành công!");
                    setProfile(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
                    setFormData(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
                }
            })
            .catch(err => alert("Lỗi tải Logo lên!"))
            .finally(() => {
                setIsUploading(false);
                e.target.value = null;
            });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = () => {
        fetch(`${apiUrl}/${profile.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        }).then(res => {
            if (res.ok) {
                alert("Cập nhật thông tin thành công!");
                setProfile(prev => ({ ...prev, ...formData }));
                setIsEditing(false);
            } else {
                alert("Có lỗi khi lưu thông tin.");
            }
        });
    };

    if (!profile.id) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải dữ liệu doanh nghiệp...</div>;
    
    const defaultLogo = "https://cdn-icons-png.flaticon.com/512/2231/2231505.png";

    return (
        <div style={styles.container}>
            <h2 style={{ color: '#0044cc', textAlign: 'center', marginBottom: '30px' }}>Hồ sơ Doanh nghiệp</h2>

            <div style={styles.avatarSection}>
                <div style={styles.avatarWrapper}>
                    <img src={profile.avatarUrl || defaultLogo} alt="Company Logo" style={{ ...styles.avatarImage, borderRadius: '12px', opacity: isUploading ? 0.5 : 1 }} />
                    <button onClick={() => fileInputRef.current.click()} style={styles.cameraButton} disabled={isUploading}>📷</button>
                </div>
                <p style={{ fontSize: '13px', color: '#888' }}>{isUploading ? "Đang xử lý..." : "Đổi Logo Công ty"}</p>
                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>

            {!isEditing ? (
                <div style={styles.infoGrid}>
                    <p style={{ gridColumn: 'span 2', fontSize: '18px', color: '#0044cc' }}><strong>{profile.companyName || 'Tên công ty chưa cập nhật'}</strong></p>
                    <p><strong>Mã số thuế:</strong> {profile.taxCode || 'Chưa có'}</p>
                    <p><strong>Website:</strong> <a href={profile.website} target="_blank" rel="noreferrer">{profile.website || 'Chưa có'}</a></p>
                    <p><strong>Địa chỉ trụ sở:</strong> {profile.address || 'Chưa có'}</p>
                    <p><strong>Quy mô nhân sự:</strong> {profile.companySize || 'Chưa có'}</p>
                    <p><strong>Chức vụ của bạn:</strong> {profile.position || 'Chưa có'}</p>
                    <div style={{ gridColumn: 'span 2' }}>
                        <p><strong>Giới thiệu công ty:</strong></p>
                        <p style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>{profile.description || 'Chưa cập nhật'}</p>
                    </div>
                    <div style={{ gridColumn: 'span 2', textAlign: 'center', marginTop: '15px' }}>
                        <button onClick={() => setIsEditing(true)} style={{ ...styles.editButton, backgroundColor: '#0044cc' }}>Chỉnh sửa hồ sơ</button>
                    </div>
                </div>
            ) : (
                <div style={styles.infoGrid}>
                    <div style={{ gridColumn: 'span 2' }}><label>Tên công ty:</label><input type="text" name="companyName" value={formData.companyName || ''} onChange={handleInputChange} style={styles.input} /></div>
                    <div><label>Mã số thuế:</label><input type="text" name="taxCode" value={formData.taxCode || ''} onChange={handleInputChange} style={styles.input} /></div>
                    <div><label>Website:</label><input type="text" name="website" value={formData.website || ''} onChange={handleInputChange} style={styles.input} /></div>
                    <div><label>Địa chỉ trụ sở:</label><input type="text" name="address" value={formData.address || ''} onChange={handleInputChange} style={styles.input} /></div>
                    <div><label>Quy mô (Ví dụ: 50-100 người):</label><input type="text" name="companySize" value={formData.companySize || ''} onChange={handleInputChange} style={styles.input} /></div>
                    <div><label>Chức vụ của bạn:</label><input type="text" name="position" value={formData.position || ''} onChange={handleInputChange} style={styles.input} /></div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label>Mô tả chi tiết doanh nghiệp:</label>
                        <textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows="5" style={styles.input}></textarea>
                    </div>
                    <div style={{ gridColumn: 'span 2', textAlign: 'center', marginTop: '15px' }}>
                        <button onClick={() => setIsEditing(false)} style={styles.cancelButton}>Hủy bỏ</button>
                        <button onClick={handleSaveProfile} style={{ ...styles.saveButton, backgroundColor: '#0044cc' }}>Lưu thay đổi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { maxWidth: '800px', margin: '40px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontFamily: 'Arial, sans-serif' },
    avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' },
    avatarWrapper: { position: 'relative', width: '130px', height: '130px' },
    avatarImage: { width: '100%', height: '100%', objectFit: 'cover', border: '2px solid #ddd' },
    cameraButton: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '50%', padding: '8px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', backgroundColor: '#f9f9f9', padding: '25px', borderRadius: '8px' },
    input: { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' },
    editButton: { padding: '10px 25px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    saveButton: { padding: '10px 25px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    cancelButton: { padding: '10px 25px', backgroundColor: '#e0e0e0', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginRight: '15px' }
};

export default EmployerProfile;