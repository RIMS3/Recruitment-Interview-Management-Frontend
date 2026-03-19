import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, ChevronRight, ChevronLeft, Zap, Facebook, 
  Linkedin, Mail, Phone, TrendingUp, Award, 
  Users, ArrowRight, Loader2, X 
} from 'lucide-react';
import './HomePage.css';

// --- Mảng chứa logo các công ty lớn ---
const COMPANY_LOGOS = [
    "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg", // Google
    "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",     // Microsoft
    "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",        // Amazon
    "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",   // Apple
    "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",  // Netflix
    "https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png",          // Tesla
    "https://d3e6ckxkrs5ntg.cloudfront.net/artists/images/8636356/original/resize:248x186/crop:x0y29w245h183/hash:1755578318/avt-viet69.jpeg?1755578318",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Pornhub-logo.svg/3840px-Pornhub-logo.svg.png"
];

// --- Hàm lấy logo cố định theo ID của Job ---
const getLogoForJob = (jobId) => {
    if (!jobId) return COMPANY_LOGOS[0];
    let hash = 0;
    for (let i = 0; i < jobId.length; i++) {
        hash = jobId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COMPANY_LOGOS.length;
    return COMPANY_LOGOS[index];
};

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

// --- COMPONENT: HIỆU ỨNG 4 PHÁO HOA SO LE ---
const Fireworks = ({ onComplete }) => {
  useEffect(() => {
    // Hàm hỗ trợ phát âm thanh theo độ trễ
    const playSound = (src, delay, volume) => {
      setTimeout(() => {
        const audio = new Audio(src);
        audio.volume = volume;
        audio.play().catch(e => console.log("Trình duyệt chặn Autoplay Audio:", e));
      }, delay);
    };

    const launchSrc = 'https://actions.google.com/sounds/v1/foley/whoosh_heavy.ogg';
    const explodeSrc = 'https://actions.google.com/sounds/v1/weapons/large_explosion.ogg';

    // 4 quả pháo bắn cách nhau 400ms (0s, 0.4s, 0.8s, 1.2s)
    // Thời gian bay của mỗi quả là 1.2s (1200ms), sau đó mới phát tiếng nổ
    [0, 400, 800, 1200].forEach(delay => {
      playSound(launchSrc, delay, 0.5); // Tiếng bay xé gió
      playSound(explodeSrc, delay + 1200, 1.0); // Tiếng nổ sau khi bay 1.2s
    });

    // Dọn dẹp DOM pháo hoa sau 8 giây cho nhẹ máy
    const timerCleanup = setTimeout(onComplete, 8000);
    return () => clearTimeout(timerCleanup);
  }, [onComplete]);

  // Tạo ra 90 hạt cho một cú nổ
  const createParticles = (burstDelay) => {
    return [...Array(90)].map((_, i) => {
      const angle = `${Math.random() * 360}deg`; 
      const dist = `${150 + Math.random() * 450}px`; // Nổ siêu rộng
      const hue = Math.floor(Math.random() * 360);
      const size = `${6 + Math.random() * 6}px`; 
      return (
        <div
          key={i}
          className="particle"
          style={{
            "--angle": angle,
            "--dist": dist,
            "--hue": hue,
            "--size": size,
            "--delay": burstDelay 
          }}
        ></div>
      );
    });
  };

  return (
    <div className="fireworks-overlay">
      {/* Quả 1: Bắn ngay lập tức (0s) - Nổ lúc 1.2s */}
      <div className="firework firework-1">
        <div className="launch-trail-container"><div className="launch-flame"></div></div>
        <div className="explosion">{createParticles('1.2s')}</div>
      </div>
      
      {/* Quả 2: Bắn sau 0.4s - Nổ lúc 1.6s */}
      <div className="firework firework-2">
        <div className="launch-trail-container"><div className="launch-flame"></div></div>
        <div className="explosion">{createParticles('1.6s')}</div>
      </div>

      {/* Quả 3: Bắn sau 0.8s - Nổ lúc 2.0s */}
      <div className="firework firework-3">
        <div className="launch-trail-container"><div className="launch-flame"></div></div>
        <div className="explosion">{createParticles('2.0s')}</div>
      </div>

      {/* Quả 4: Bắn sau 1.2s - Nổ lúc 2.4s */}
      <div className="firework firework-4">
        <div className="launch-trail-container"><div className="launch-flame"></div></div>
        <div className="explosion">{createParticles('2.4s')}</div>
      </div>
    </div>
  );
};

const mytoken = localStorage.getItem("accessToken");
console.log("Token của bạn là gì:", mytoken);

const HomePage = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  
  // --- STATE QUẢN LÝ QUẢNG CÁO ---
  const [popupAds, setPopupAds] = useState([]);       
  const [showPopup, setShowPopup] = useState(false);  
  const [leftAds, setLeftAds] = useState([]);         
  const [rightAds, setRightAds] = useState([]);       

  // --- BẬT PHÁO HOA NGAY LÚC LOAD ---
  const [showFireworks, setShowFireworks] = useState(true);

  // LẤY ROLE CỦA USER HIỆN TẠI
  const userRole = localStorage.getItem("role");

  // CALL API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const baseUrl = import.meta.env.VITE_API_BASE_URL;

        const [jobsRes, bannersRes, adsRes] = await Promise.all([
          fetch(`${baseUrl}/jobs`),
          fetch(`${baseUrl}/Banners`),
          fetch(`${baseUrl}/Advertisements`) 
        ]);

        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData);
        }

        if (bannersRes.ok) {
          const bannersData = await bannersRes.json();
          setBanners(bannersData || []); 
        }

        if (adsRes.ok) {
          const adsData = await adsRes.json();
          const validAds = adsData || [];
          
          const popupAdList = validAds.filter(ad => ad.isPopup);
          setPopupAds(popupAdList.slice(0, 4));
          
          if (popupAdList.length > 0) {
            const hasSeenPopup = sessionStorage.getItem("hasSeenPopup");
            if (!hasSeenPopup) {
              setShowPopup(true);
              sessionStorage.setItem("hasSeenPopup", "true"); 
            }
          }

          const floatingAdList = validAds.filter(ad => !ad.isPopup);
          setLeftAds(floatingAdList.filter((_, i) => i % 2 === 0)); 
          setRightAds(floatingAdList.filter((_, i) => i % 2 !== 0)); 
        }

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const currentDuration = (banners[currentBanner]?.duration || 5) * 1000;
    const timer = setTimeout(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, currentDuration);
    return () => clearTimeout(timer);
  }, [banners, currentBanner]);

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  const handleBannerClick = () => { if (userRole === "1") navigate("/admin/banners"); };
  const formatSalary = (min, max) => `$${min.toLocaleString()} - $${max.toLocaleString()}`;

  const handleCloseLeftAd = (id, e) => {
    e.preventDefault();
    setLeftAds(prev => prev.filter(ad => ad.id !== id));
  };

  const handleCloseRightAd = (id, e) => {
    e.preventDefault();
    setRightAds(prev => prev.filter(ad => ad.id !== id));
  };

  return (
    <div className="home-page">

      {/* Container Pháo Hoa (Bắn luôn lúc render) */}
      {showFireworks && <Fireworks onComplete={() => setShowFireworks(false)} />}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="stars"></div>
        <div className="crescent-moon"></div>
        
        <div className="shooting-star star-1"></div>
        <div className="shooting-star star-2"></div>
        <div className="shooting-star star-3"></div>

        <div className="rocket-container rocket-1">
          <div className="rocket-body">
            <div className="rocket-window"></div>
            <div className="rocket-fins"></div>
            <div className="rocket-engine"></div>
            <div className="rocket-flame"></div>
          </div>
        </div>
        <div className="rocket-container rocket-2">
          <div className="rocket-body">
            <div className="rocket-window"></div>
            <div className="rocket-fins"></div>
            <div className="rocket-engine"></div>
            <div className="rocket-flame"></div>
          </div>
        </div>
        <div className="rocket-container rocket-3">
          <div className="rocket-body">
            <div className="rocket-window"></div>
            <div className="rocket-fins"></div>
            <div className="rocket-engine"></div>
            <div className="rocket-flame"></div>
          </div>
        </div>
        <div className="rocket-container rocket-4">
          <div className="rocket-body">
            <div className="rocket-window"></div>
            <div className="rocket-fins"></div>
            <div className="rocket-engine"></div>
            <div className="rocket-flame"></div>
          </div>
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
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
                  style={{ backgroundImage: `url(${banner.imageUrl})`, cursor: userRole === "1" ? "pointer" : "default" }}
                  onClick={handleBannerClick}
                >
                </div>
              ))}

              {banners.length > 1 && (
                <>
                  <button className="banner-nav-btn prev" onClick={prevBanner}><ChevronLeft size={28} /></button>
                  <button className="banner-nav-btn next" onClick={nextBanner}><ChevronRight size={28} /></button>
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
            <div 
              className="banner-slide active"
              style={{ backgroundImage: `url(https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200)`, cursor: userRole === "1" ? "pointer" : "default" }}
              onClick={handleBannerClick} 
            >
            </div>
          )}
        </div>

        <div className="banner-title-container">
          <h2>
            {banners.length > 0 
              ? banners[currentBanner]?.title 
              : "Hãy thêm Banner từ trang Admin"}
          </h2>
        </div>
      </div>

      {showPopup && popupAds.length > 0 && (
        <div className="popup-ad-overlay" onClick={() => setShowPopup(false)}>
          <div className={`popup-ad-content grid-${popupAds.length}`} onClick={(e) => e.stopPropagation()} >
            <button className="close-popup-ad-btn" onClick={() => setShowPopup(false)} title="Đóng toàn bộ quảng cáo">
              <X size={24} strokeWidth={3} />
            </button>
            {popupAds.map(ad => (
              <a 
                key={ad.id} href={ad.linkUrl || '#'} target={ad.linkUrl ? "_blank" : "_self"} rel="noopener noreferrer"
                className="popup-ad-link"
              >
                <img src={ad.imageUrl} alt={ad.title} className="popup-ad-img" />
              </a>
            ))}
          </div>
        </div>
      )}
      
      {/* CỘT TRÁI */}
      {leftAds.length > 0 && (
        <div className="floating-sidebar left-sidebar">
          {leftAds.map((ad) => (
            <div key={ad.id} className="floating-ad-item">
              <button className="close-single-ad-btn" onClick={(e) => handleCloseLeftAd(ad.id, e)} title="Tắt quảng cáo này">
                <X size={14} strokeWidth={3} />
              </button>
              <a href={ad.linkUrl || '#'} target={ad.linkUrl ? "_blank" : "_self"} rel="noopener noreferrer">
                <img src={ad.imageUrl} alt={ad.title} className="floating-ad-img" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* CỘT PHẢI */}
      {rightAds.length > 0 && (
        <div className="floating-sidebar right-sidebar">
          {rightAds.map((ad) => (
            <div key={ad.id} className="floating-ad-item">
              <button className="close-single-ad-btn" onClick={(e) => handleCloseRightAd(ad.id, e)} title="Tắt quảng cáo này">
                <X size={14} strokeWidth={3} />
              </button>
              <a href={ad.linkUrl || '#'} target={ad.linkUrl ? "_blank" : "_self"} rel="noopener noreferrer">
                <img src={ad.imageUrl} alt={ad.title} className="floating-ad-img" />
              </a>
            </div>
          ))}
        </div>
      )}

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
            {jobs.slice(0, 8).map(job => {
              const jobLogo = getLogoForJob(String(job.idJobPost));
              
              return (
              <div
                key={job.idJobPost}
                className={`job-card-modern ${job.salaryMax >= 3000 ? 'hot-border' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/jobpostdetail/${String(job.idJobPost)}`)}
              >
                {job.salaryMax >= 3000 && <span className="hot-tag"><Zap size={12} fill="currentColor"/> HOT</span>}
                <div className="card-top">
                  <div className="company-logo-modern">
                    <img src={jobLogo} alt="company logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px', borderRadius: '12px' }} />
                  </div>
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
            )})}
          </div>
        )}

        {/* --- SECTION KHÁM PHÁ --- */}
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