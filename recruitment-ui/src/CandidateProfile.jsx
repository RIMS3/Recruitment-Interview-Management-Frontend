import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from './Auth/AuthContext'; 

const CandidateProfile = () => {
    const [profile, setProfile] = useState({});
    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // TRẠNG THÁI QUẢN LÝ POPUP THÔNG BÁO
    const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
    
    const fileInputRef = useRef(null);
    const { user, setUser } = useContext(AuthContext); 
    const currentUserId = localStorage.getItem("userId"); 
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/candidateprofiles`;
 
    // Hàm gọi Popup thay thế cho alert()
    const showPopup = (message, type = 'success') => {
        setPopup({ show: true, message, type });
    };

    if (!currentUserId) {
        return (
            <div style={styles.unauthContainer}>
                <div style={styles.unauthCard}>
                    <h2 style={{ color: '#ff4d4f', fontSize: '28px', marginBottom: '10px' }}>Bạn chưa đăng nhập!</h2>
                    <p style={{ fontSize: '16px', color: '#666' }}>Vui lòng đăng nhập để xem và chỉnh sửa hồ sơ cá nhân.</p>
                </div>
            </div>
        );
    }

    useEffect(() => {
        fetch(`${apiUrl}/user/${currentUserId}`)
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                const formattedData = { ...data };
                if (formattedData.dateOfBirth) {
                    formattedData.dateOfBirth = formattedData.dateOfBirth.split('T')[0];
                }
                setFormData(formattedData);

                if (user && user.isCvPro !== data.isCvPro) {
                    setUser(prev => {
                        const updatedUser = { ...prev, isCvPro: data.isCvPro };
                        localStorage.setItem('user', JSON.stringify(updatedUser)); 
                        return updatedUser;
                    });
                }
            })
            .catch(err => console.error("Lỗi tải dữ liệu:", err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserId]);

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
                showPopup("Cập nhật ảnh đại diện thành công!", "success");
                setProfile(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
                setFormData(prev => ({ ...prev, avatarUrl: data.avatarUrl })); 
            }
        })
        .catch(err => showPopup("Lỗi tải ảnh lên!", "error"))
        .finally(() => {
            setIsUploading(false);
            e.target.value = null; 
        });
    };

    const handleInputChange = (e) => {
        const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSaveProfile = () => {
        const payload = { ...formData, gender: parseInt(formData.gender) || 0 };

        fetch(`${apiUrl}/${profile.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(res => {
            if (res.ok) {
                showPopup("Cập nhật thông tin thành công!", "success");
                setProfile(prev => ({ ...prev, ...payload })); 
                setIsEditing(false);
            } else {
                showPopup("Có lỗi khi lưu thông tin.", "error");
            }
        });
    };

    if (!profile.id) return <div style={styles.loadingScreen}>Đang tải dữ liệu hồ sơ...</div>;
    const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    return (
        <div style={styles.pageWrapper}>
            <style>{`
                .stars-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; z-index: 0; }
                .stars-bg::after { content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; box-shadow: 10vw 5vh 2px #fff, 20vw 20vh 1px #fff, 30vw 40vh 2px #fff, 40vw 10vh 1px #fff, 50vw 50vh 2px #fff, 60vw 30vh 1px #fff, 70vw 70vh 2px #fff, 80vw 20vh 1px #fff, 90vw 50vh 2px #fff, 15vw 80vh 1px #fff, 35vw 90vh 2px #fff, 55vw 85vh 1px #fff, 75vw 95vh 2px #fff, 95vw 15vh 1px #fff, 5vw 45vh 2px #fff, 25vw 65vh 1px #fff, 45vw 25vh 2px #fff, 65vw 5vh 1px #fff, 85vw 35vh 2px #fff, 12vw 32vh 1px #fff, 42vw 72vh 2px #fff, 82vw 62vh 1px #fff; width: 2px; height: 2px; border-radius: 50%; animation: twinkle 3s infinite alternate; }
                .crescent-moon { position: absolute; top: 30px; right: 40px; font-size: 60px; z-index: 1; filter: drop-shadow(0 0 15px rgba(255, 255, 224, 0.8)); animation: shakeMoon 4s infinite cubic-bezier(0.36, 0.07, 0.19, 0.97) alternate; user-select: none; }
                .shooting-star { position: absolute; top: 50%; left: 50%; width: 4px; height: 4px; background: #fff; border-radius: 50%; box-shadow: 0 0 0 4px rgba(255,255,255,0.1), 0 0 0 8px rgba(255,255,255,0.1), 0 0 20px rgba(255,255,255,1); animation: shooting 6s infinite; z-index: 0; opacity: 0; }
                .shooting-star::before { content: ''; position: absolute; top: 50%; transform: translateY(-50%); width: 200px; height: 1px; background: linear-gradient(90deg, #fff, transparent); }
                
                @keyframes twinkle { 0% { opacity: 0.2; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1.2); } }
                @keyframes shakeMoon { 0% { transform: rotate(-10deg); } 50% { transform: rotate(15deg); } 100% { transform: rotate(-5deg); } }
                @keyframes shooting { 0% { transform: translateX(400px) translateY(-300px) rotate(-45deg); opacity: 1; } 15% { transform: translateX(-600px) translateY(700px) rotate(-45deg); opacity: 0; } 100% { transform: translateX(-600px) translateY(700px) rotate(-45deg); opacity: 0; } }
                
                .light-input { transition: all 0.2s ease; border: 1px solid #d1d5db; background-color: #fff; color: #1f2937; font-family: inherit; outline: none; }
                .light-input:focus { border-color: #00b14f !important; box-shadow: 0 0 0 3px rgba(0, 177, 79, 0.15) !important; }
                .light-input::placeholder { color: #9ca3af; }
                
                .custom-scroll::-webkit-scrollbar { width: 6px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>

            <div className="stars-bg"></div>
            <div className="shooting-star"></div>
            <div className="crescent-moon">🌙</div>

            {/* HIỂN THỊ POPUP THAY THẾ ALERT */}
            {popup.show && (
                <div style={styles.popupOverlay}>
                    <div style={styles.popupBox}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>
                            {popup.type === 'success' ? '✅' : '❌'}
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>
                            {popup.type === 'success' ? 'Thành công!' : 'Thất bại!'}
                        </h3>
                        <p style={{ color: '#4b5563', marginBottom: '20px' }}>{popup.message}</p>
                        <button onClick={() => setPopup({ ...popup, show: false })} style={styles.popupButton}>
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {/* CONTAINER CHÍNH */}
            <div style={styles.container}>
                
                {/* CỘT TRÁI */}
                <div style={styles.leftSidebar}>
                    <h2 style={styles.profileTitle}>Hồ Sơ Của Tôi</h2>
                    
                    <div style={styles.avatarWrapper}>
                        <img src={profile.avatarUrl || defaultAvatar} alt="Avatar" style={{...styles.avatarImage, opacity: isUploading ? 0.5 : 1}} />
                        <button onClick={() => fileInputRef.current.click()} style={styles.cameraButton} disabled={isUploading}>📷</button>
                    </div>
                    
                    {profile.isCvPro && (
                        <div style={styles.vipBadge}>👑 THÀNH VIÊN PRO</div>
                    )}

                    <p style={styles.avatarSubtext}>
                        {isUploading ? "Đang xử lý..." : "Nhấn để thay đổi ảnh"}
                    </p>
                    <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleAvatarChange} />

                    <div style={styles.buttonGroup}>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} style={styles.editButton}>
                                ✏️ Chỉnh Sửa Hồ Sơ
                            </button>
                        ) : (
                            <>
                                <button onClick={handleSaveProfile} style={styles.saveButton}>✅ Lưu Thay Đổi</button>
                                <button onClick={() => setIsEditing(false)} style={styles.cancelButton}>❌ Hủy Bỏ</button>
                            </>
                        )}
                    </div>
                </div>

                {/* CỘT PHẢI */}
                <div style={styles.rightContent} className="custom-scroll">
                    {!isEditing ? (
                        // CHẾ ĐỘ XEM
                        <div style={styles.infoGrid}>
                            <div style={styles.infoBlock}><span style={styles.label}>📅 Ngày sinh</span><div style={styles.textValue}>{profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '--'}</div></div>
                            <div style={styles.infoBlock}><span style={styles.label}>💼 Kinh nghiệm</span><div style={styles.textValue}>{profile.experienceYears != null ? `${profile.experienceYears} năm` : '--'}</div></div>
                            <div style={styles.infoBlock}><span style={styles.label}>🎓 Cấp bậc</span><div style={styles.textValue}>{profile.jobLevel || '--'}</div></div>
                            <div style={styles.infoBlock}><span style={styles.label}>💰 Lương hiện tại</span><div style={styles.textValue}>{profile.currentSalary ? `${profile.currentSalary} triệu` : '--'}</div></div>
                            <div style={styles.infoBlock}><span style={styles.label}>🎯 Lương mong muốn</span><div style={styles.textValue}>{profile.desiredSalary ? `${profile.desiredSalary} triệu` : '--'}</div></div>
                            <div style={styles.infoBlock}><span style={styles.label}>📍 Địa chỉ</span><div style={styles.textValue}>{profile.address || '--'}</div></div>
                            
                            <div style={{ gridColumn: 'span 2', marginTop: '5px' }}>
                                <span style={styles.label}>📝 Giới thiệu bản thân</span>
                                <div style={styles.introBox}>
                                    {profile.summary || 'Bạn chưa có thông tin giới thiệu bản thân...'}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // CHẾ ĐỘ SỬA
                        <div style={styles.infoGrid}>
                            <div style={styles.inputGroup}><label style={styles.label}>📅 Ngày sinh</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleInputChange} style={styles.input} className="light-input" /></div>
                            <div style={styles.inputGroup}><label style={styles.label}>💼 Kinh nghiệm (năm)</label><input type="number" name="experienceYears" value={formData.experienceYears || ''} onChange={handleInputChange} style={styles.input} className="light-input" placeholder="VD: 3" /></div>
                            <div style={styles.inputGroup}><label style={styles.label}>🎓 Cấp bậc mong muốn</label><input type="text" name="jobLevel" value={formData.jobLevel || ''} onChange={handleInputChange} style={styles.input} className="light-input" placeholder="VD: Senior..." /></div>
                            <div style={styles.inputGroup}><label style={styles.label}>💰 Lương hiện tại (triệu)</label><input type="number" name="currentSalary" value={formData.currentSalary || ''} onChange={handleInputChange} style={styles.input} className="light-input" placeholder="VD: 20" /></div>
                            <div style={styles.inputGroup}><label style={styles.label}>🎯 Lương mong muốn (triệu)</label><input type="number" name="desiredSalary" value={formData.desiredSalary || ''} onChange={handleInputChange} style={styles.input} className="light-input" placeholder="VD: 30" /></div>
                            <div style={styles.inputGroup}><label style={styles.label}>📍 Địa chỉ</label><input type="text" name="address" value={formData.address || ''} onChange={handleInputChange} style={styles.input} className="light-input" placeholder="Nhập địa chỉ của bạn..." /></div>
                            
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={styles.label}>📝 Giới thiệu bản thân</label>
                                <textarea name="summary" value={formData.summary || ''} onChange={handleInputChange} rows="3" style={{...styles.input, resize: 'none', lineHeight: '1.6'}} className="light-input" placeholder="Tóm tắt kỹ năng, mục tiêu nghề nghiệp..."></textarea>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    // ĐÃ CHỈNH SỬA: Giảm paddingTop từ 100px xuống 20px để sát Navbar
    pageWrapper: { position: 'relative', height: '100vh', width: '100vw', background: 'radial-gradient(circle at center, #1b2735 0%, #090a0f 100%)', overflow: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '20px', boxSizing: 'border-box', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', margin: 0 },
    
    container: { display: 'flex', zIndex: 10, width: '920px', maxWidth: '95%', height: '520px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)', overflow: 'hidden' },
    
    leftSidebar: { width: '280px', backgroundColor: '#f8fafc', padding: '35px 25px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #e2e8f0' },
    profileTitle: { color: '#00b14f', margin: '0 0 25px 0', fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' },
    avatarWrapper: { position: 'relative', width: '115px', height: '115px', marginBottom: '10px' },
    avatarImage: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' },
    cameraButton: { position: 'absolute', bottom: '0', right: '0', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '50%', padding: '8px', cursor: 'pointer', boxShadow: '0 3px 6px rgba(0,0,0,0.15)', fontSize: '13px', transition: 'transform 0.2s' },
    vipBadge: { marginTop: '8px', padding: '5px 12px', background: 'linear-gradient(90deg, #bf953f, #fcf6ba, #b38728)', color: '#5c4000', borderRadius: '15px', fontWeight: 'bold', fontSize: '11px', boxShadow: '0 2px 8px rgba(191, 149, 63, 0.3)' },
    avatarSubtext: { fontSize: '12px', color: '#64748b', marginTop: '12px', textAlign: 'center' },
    buttonGroup: { marginTop: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' },
    
    rightContent: { flex: 1, padding: '35px', backgroundColor: '#ffffff', overflowY: 'auto' },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    inputGroup: { display: 'flex', flexDirection: 'column' },
    
    infoBlock: { display: 'flex', flexDirection: 'column', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' },
    label: { fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' },
    textValue: { fontSize: '15px', color: '#1e293b', fontWeight: '500', paddingLeft: '2px' },
    
    input: { width: '100%', padding: '11px 16px', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' },
    introBox: { backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', minHeight: '70px', color: '#334155', fontSize: '14px', lineHeight: '1.6' },
    
    editButton: { width: '100%', padding: '12px', backgroundColor: '#00b14f', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: '0 4px 12px rgba(0, 177, 79, 0.25)' },
    saveButton: { width: '100%', padding: '12px', backgroundColor: '#00b14f', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: '0 4px 12px rgba(0, 177, 79, 0.25)' },
    cancelButton: { width: '100%', padding: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
    
    popupOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 },
    popupBox: { backgroundColor: '#fff', padding: '30px 40px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', minWidth: '300px', transform: 'scale(1)', animation: 'popIn 0.3s ease-out' },
    popupButton: { padding: '10px 25px', backgroundColor: '#00b14f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', fontSize: '14px' },
    
    loadingScreen: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', background: '#090a0f', color: '#00b14f', fontSize: '18px' },
    unauthContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', background: '#090a0f' },
    unauthCard: { padding: '40px', backgroundColor: '#fff', borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }
};

export default CandidateProfile;