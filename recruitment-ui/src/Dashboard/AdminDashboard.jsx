import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, FileText, CheckCircle, 
  XCircle 
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line, Legend 
} from 'recharts';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    totalEmployers: 0,
    openJobs: 0,
    closedJobs: 0,
    totalCVs: 0,
    applicationsToday: 0,
    applicationsWeek: 0,
    applicationsMonth: 0
  });

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. LẤY TOKEN TỪ LOCAL STORAGE
        const token = localStorage.getItem("accessToken");

        // 2. GẮN TOKEN VÀO HEADER KHI GỌI API
        const response = await axios.get("https://localhost:7272/api/Admin/dashboard-stats", {
          headers: {
            Authorization: `Bearer ${token}` // <--- Thêm dòng này
          }
        });
        
        const data = response.data;
        
        setStats({
          totalCandidates: data.totalCandidates,
          totalEmployers: data.totalEmployers,
          openJobs: data.openJobs,
          closedJobs: data.closedJobs,
          totalCVs: data.totalCvs,
          applicationsToday: data.applicationsToday,
          applicationsWeek: data.applicationsWeek,
          applicationsMonth: data.applicationsMonth
        });

        setChartData(data.weeklyChart);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="stat-card">
      <div className={`icon-container ${color}`}>
        <Icon size={24} />
      </div>
      <div className="stat-info">
        <h3>{title}</h3>
        <p>{loading ? "..." : value.toLocaleString()}</p>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Bảng điều khiển Admin</h1>
        <p>Chào mừng bạn trở lại, hệ thống đang hoạt động ổn định.</p>
      </header>

      {/* Thống kê tổng quan */}
      <div className="stats-grid">
        <StatCard title="Tổng ứng viên" value={stats.totalCandidates} icon={Users} color="blue" />
        <StatCard title="Nhà tuyển dụng" value={stats.totalEmployers} icon={Briefcase} color="purple" />
        <StatCard title="Job đang mở" value={stats.openJobs} icon={CheckCircle} color="green" />
        <StatCard title="Job đã đóng" value={stats.closedJobs} icon={XCircle} color="red" />
        <StatCard title="Tổng CV đã nộp" value={stats.totalCVs} icon={FileText} color="orange" />
      </div>

      {/* Thống kê lượt ứng tuyển theo thời gian */}
      <div className="time-stats">
        <div className="time-card">
          <span className="label">Hôm nay</span>
          <span className="value">+{stats.applicationsToday}</span>
        </div>
        <div className="time-card">
          <span className="label">Tuần này</span>
          <span className="value">+{stats.applicationsWeek}</span>
        </div>
        <div className="time-card">
          <span className="label">Tháng này</span>
          <span className="value">+{stats.applicationsMonth}</span>
        </div>
      </div>

      {/* Biểu đồ phân tích */}
      <div className="charts-section">
        <div className="chart-container">
          <h2>Phân tích lượt ứng tuyển trong tuần</h2>
          <div style={{ width: '100%', height: 350 }}>
            {loading ? (
              <div className="loading-placeholder">Đang tải dữ liệu...</div>
            ) : (
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="applications" 
                    name="Số lượt ứng tuyển" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;