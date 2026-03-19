import React from 'react';
import CandidateProfile from './CandidateProfile';
import EmployerProfile from './EmployerProfile';

const UserProfile = () => {
    // Đọc ID và Role thực tế từ Local Storage
    const userId = localStorage.getItem("userId");
    
    // Giả sử ông lưu role dưới dạng string (VD: "Candidate" hoặc "Employer")
    const role = localStorage.getItem("role"); 

    if (!userId) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', marginTop: '50px' }}>
                <h2 style={{ color: '#ff4d4f' }}>Bạn chưa đăng nhập!</h2>
                <p style={{ fontSize: '16px', color: '#555' }}>Vui lòng đăng nhập để xem hồ sơ.</p>
            </div>
        );
    }

    return (
        <div style={{ margin: '50px' }}>
            <h2>Quản lý tài khoản</h2>
            
            {/* Truyền userId xuống component con thông qua props */}
            {role === 'Candidate' && (
                <CandidateProfile userId={userId} />
            )}
            
            {role === 'Employer' && (
                <EmployerProfile userId={userId} />
            )}
        </div>
    );
};

export default UserProfile;