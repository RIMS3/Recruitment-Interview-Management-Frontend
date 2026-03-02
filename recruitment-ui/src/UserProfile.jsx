import React from 'react';
import CandidateProfile from './CandidateProfile';
import EmployerProfile from './EmployerProfile';

const UserProfile = () => {
    // TẠM THỜI: Giả lập dữ liệu user đang đăng nhập. 
    // Sau này bạn sẽ lấy từ Login/Context/LocalStorage.
    const loggedInUser = {
        userId: "A1234567-B123-C123-D123-E00000000005", 
        role: "Candidate" // Đổi thành "Employer" để test giao diện nhà tuyển dụng
    };

    return (
        <div style={{ margin: '50px' }}>
            <h2>Quản lý tài khoản</h2>
            
            {loggedInUser.role === 'Candidate' && (
                <CandidateProfile userId={loggedInUser.userId} />
            )}
            
            {loggedInUser.role === 'Employer' && (
                <EmployerProfile userId={loggedInUser.userId} />
            )}
        </div>
    );
};

export default UserProfile;