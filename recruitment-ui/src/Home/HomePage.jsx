import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, ChevronRight, ChevronLeft, Zap, Facebook, 
  Linkedin, Mail, Phone, TrendingUp, Award, 
  Users, ArrowRight, Loader2 
} from 'lucide-react';
import './HomePage.css';

// --- COMPONENT: HIỆU ỨNG CHẠY SỐ ---
const CountUpNumber = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsStarted(true);
      },
      { threshold: 0.3 }
    );
    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isStarted) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [isStarted, end, duration]);

  const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return <h4 ref={elementRef}>{formatNumber(count)}+</h4>;
};

const HomePage = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);

  // --- LẤY ROLE CỦA USER HIỆN TẠI ---
  const userRole = localStorage.getItem("role");

  // CALL API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const baseUrl = import.meta.env.VITE_API_BASE_URL;

        const [jobsRes, bannersRes] = await Promise.all([
          fetch(`${baseUrl}/jobs`),
          fetch(`${baseUrl}/Banners`)
        ]);

        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData);
        }

        if (bannersRes.ok) {
          const bannersData = await bannersRes.json();
          setBanners(bannersData || []); 
        }

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Logic tự động chuyển Slide Banner theo thời gian cài đặt
  useEffect(() => {
    if (banners.length <= 1) return;

    const currentDuration = (banners[currentBanner]?.duration || 5) * 1000;
    const timer = setTimeout(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, currentDuration);

    return () => clearTimeout(timer);
  }, [banners, currentBanner]);

  // Hàm chuyển ảnh thủ công
  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // --- HÀM XỬ LÝ KHI CLICK VÀO BANNER ---
  const handleBannerClick = () => {
    if (userRole === "1") {
      navigate("/admin/banners");
    }
  };

  const formatSalary = (min, max) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-badge">🚀 Nền tảng tuyển dụng thế hệ mới</div>
          <h1 className="hero-title">Tìm kiếm công việc <span className="text-gradient">Software Engineer</span> tốt nhất</h1>
          <p className="hero-subtitle">Hơn 2,000+ vị trí đang chờ bạn ứng tuyển ngay hôm nay.</p>
          
          <div className="search-box-wrapper">
            <div className="search-main-modern">
              <div className="input-with-icon">
                <Search className="icon" size={20} />
                <input type="text" placeholder="Vị trí, kỹ năng hoặc tên công ty..." />
              </div>
              <div className="divider"></div>
              <div className="input-with-icon">
                <MapPin className="icon" size={20} />
                <select>
                  <option>Tất cả địa điểm</option>
                  <option>Hanoi</option>
                  <option>HCM City</option>
                  <option>Da Nang</option>
                </select>
              </div>
              <button className="btn-search-prime" onClick={() => navigate('/joblist')}>Tìm kiếm ngay</button>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Slider */}
      <div className="container">
        <div className="banner-slider-modern">
          {banners.length > 0 ? (
            <>
              {banners.map((banner, index) => (
                <div 
                  key={banner.id || index} 
                  className={`banner-slide ${index === currentBanner ? 'active' : ''}`}
                  style={{ 
                    backgroundImage: `url(${banner.imageUrl})`,
                    cursor: userRole === "1" ? "pointer" : "default" // Chỉ hiện bàn tay nếu là Admin
                  }}
                  onClick={handleBannerClick} // Gắn sự kiện click
                >
                  <div className="banner-text-overlay">
                    <h2>{banner.title}</h2>
                  </div>
                </div>
              ))}

              {/* Mũi tên điều hướng trái/phải */}
              {banners.length > 1 && (
                <>
                  <button className="banner-nav-btn prev" onClick={prevBanner}>
                    <ChevronLeft size={28} />
                  </button>
                  <button className="banner-nav-btn next" onClick={nextBanner}>
                    <ChevronRight size={28} />
                  </button>

                  {/* Thanh gạch báo vị trí banner hiện tại */}
                  <div className="banner-indicators">
                    {banners.map((_, index) => (
                      <button
                        key={index}
                        className={`indicator-bar ${index === currentBanner ? 'active' : ''}`}
                        onClick={() => setCurrentBanner(index)}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            // Fallback khi không có banner
            <div 
              className="banner-slide active"
              style={{ 
                backgroundImage: `url(https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200)`,
                cursor: userRole === "1" ? "pointer" : "default" // Chỉ hiện bàn tay nếu là Admin
              }}
              onClick={handleBannerClick} // Gắn sự kiện click cho cả ảnh mặc định
            >
              <div className="banner-text-overlay">
                <h2>Hãy thêm Banner từ trang Admin</h2>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <section className="stats-section container">
        <div className="stat-card">
          <TrendingUp className="stat-icon" />
          <div>
            <CountUpNumber end={12500} />
            <p>Việc làm active</p>
          </div>
        </div>
        <div className="stat-card">
          <Award className="stat-icon" />
          <div>
            <CountUpNumber end={500} />
            <p>Công ty hàng đầu</p>
          </div>
        </div>
        <div className="stat-card">
          <Users className="stat-icon" />
          <div>
            <CountUpNumber end={200000} />
            <p>Ứng viên tin dùng</p>
          </div>
        </div>
      </section>

      {/* Job Grid Section */}
      <section className="job-grid-section container-fluid">
        <div className="section-header-modern">
          <div className="header-left">
            <h2 className="modern-section-title">
              Việc làm <span className="text-highlight">mới nhất</span>
              <span className="title-line"></span>
            </h2>
          </div>
          <span className="link-all" onClick={() => navigate('/joblist')} style={{cursor: 'pointer'}}>
            Xem tất cả công việc <ChevronRight size={16} />
          </span>
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 className="spinner" />
            <p>Đang tải danh sách việc làm...</p>
          </div>
        ) : (
          <div className="job-grid-modern">
            {jobs.slice(0, 9).map(job => (
              <div key={job.idJobPost} className={`job-card-modern ${job.salaryMax >= 3000 ? 'hot-border' : ''}`}>
                {job.salaryMax >= 3000 && <span className="hot-tag"><Zap size={12} fill="currentColor"/> HOT</span>}
                <div className="card-top">
                  <div className="company-logo-modern">{job.title.charAt(0)}</div>
                  <div className="title-area">
                    <h4 className="job-title-text" title={job.title}>{job.title}</h4>
                    <p className="company-text">Công ty đối tác ITLoCak</p>
                  </div>
                </div>
                <div className="job-tags-row">
                  <span className="skill-tag">IT Software</span>
                  <span className="skill-tag">{job.location}</span>
                </div>
                <div className="card-bottom-modern">
                  <div className="job-meta">
                    <span className="salary-modern">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                    <span className="meta-divider">•</span>
                    <span className="loc-text">{job.location}</span>
                  </div>
                  <span className="posted-time">Hạn: {new Date(job.expireAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- SECTION KHÁM PHÁ (CALL TO ACTION) --- */}
        <div className="discovery-cta-container">
          <div className="discovery-blob"></div>
          <div className="discovery-blob blob-2"></div>
          <div className="discovery-content">
            <div className="discovery-text">
              <h3>Vẫn chưa tìm thấy công việc ưng ý?</h3>
              <p>Hàng trăm vị trí mới được cập nhật mỗi giờ. Đừng bỏ lỡ cơ hội bứt phá sự nghiệp của bạn!</p>
            </div>
            <button className="btn-discovery-premium" onClick={() => navigate('/joblist')}>
              <span className="btn-text">Xem tất cả 12,500+ việc làm</span>
              <div className="btn-icon-circle">
                <ArrowRight size={22} />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-modern">
        <div className="container-fluid footer-grid">
          <div className="footer-brand">
            <h2 className="logo-text">IT<span>LoCak</span></h2>
            <p>Nâng tầm sự nghiệp lập trình viên Việt Nam với những cơ hội tốt nhất.</p>
            <div className="social-links">
              <Facebook size={20} />
              <Linkedin size={20} />
              <Mail size={20} />
            </div>
          </div>
          <div className="footer-links">
            <h4>Dành cho ứng viên</h4>
            <ul>
              <li onClick={() => navigate('/joblist')}>Việc làm IT mới nhất</li>
              <li>Tạo CV chuyên nghiệp</li>
              <li>Cẩm nang nghề nghiệp</li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Hỗ trợ</h4>
            <ul>
              <li>Trung tâm trợ giúp</li>
              <li>Điều khoản dịch vụ</li>
              <li>Chính sách bảo mật</li>
            </ul>
          </div>
          <div className="footer-contact">
            <h4>Liên hệ</h4>
            <p><Phone size={16} /> 1900 888 999</p>
            <p><Mail size={16} /> career@itlocak.vn</p>
          </div>
        </div>
        <div className="footer-bottom-bar">
          <div className="container-fluid flex-between">
            <p>© 2026 ITLoCak Platform. All rights reserved.</p>
            <p>Made with ❤️ by Pham Trung Duc</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;