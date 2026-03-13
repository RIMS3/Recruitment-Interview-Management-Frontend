import React, { useState } from 'react';
import './ITBlog.css';

const mockArticles = [
  {
    id: 1,
    title: "Làn sóng Layoff IT 2026: Khi nào thị trường mới ổn định?",
    date: "12/03/2026",
    summary: "Thị trường công nghệ tiếp tục chứng kiến những đợt cắt giảm nhân sự. Liệu đây có phải là bình thường mới của ngành IT?",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
    content: [
      "Trong thời gian qua, ngành công nghệ tiếp tục đối mặt với làn sóng sa thải nhân sự quy mô lớn. Không chỉ các công ty khởi nghiệp (startup) cạn vốn, mà ngay cả những tập đoàn công nghệ khổng lồ (Big Tech) cũng liên tục công bố cắt giảm từ 5% đến 15% lực lượng lao động toàn cầu. Điều này tạo ra một tâm lý hoang mang chưa từng có trong cộng đồng lập trình viên, những người từng quen với việc được các nhà tuyển dụng săn đón.",
      "Có nhiều nguyên nhân dẫn đến tình trạng này. Đầu tiên là sự bùng nổ của trí tuệ nhân tạo (AI). Các công cụ hỗ trợ lập trình tiên tiến đã giúp tăng năng suất đáng kể, khiến một số vị trí junior hoặc các công việc lặp đi lặp lại không còn cần thiết nhiều như trước. Thứ hai là bức tranh kinh tế vĩ mô toàn cầu vẫn đang trong giai đoạn phục hồi chậm chạp, lạm phát và lãi suất cao khiến các quỹ đầu tư mạo hiểm e dè hơn trong việc rót vốn. Các công ty buộc phải chuyển từ chiến lược 'tăng trưởng bằng mọi giá' sang 'tăng trưởng bền vững và tối ưu hóa lợi nhuận'.",
      "Dù tình hình hiện tại có vẻ ảm đạm, các chuyên gia phân tích thị trường nhận định đây thực chất là một sự điều chỉnh cần thiết sau giai đoạn tuyển dụng ồ ạt và tăng trưởng nóng trong thời kỳ đại dịch. Nhu cầu về chuyển đổi số, an toàn thông tin và phát triển hệ thống cốt lõi tại các doanh nghiệp truyền thống (ngân hàng, y tế, sản xuất) vẫn rất lớn. Do đó, thị trường IT không hề chết đi, mà nó đang đòi hỏi khắt khe hơn. Các lập trình viên cần chuẩn bị sẵn sàng tâm lý, không ngừng nâng cấp kỹ năng chuyên sâu và mở rộng kiến thức về kiến trúc hệ thống để có thể trụ vững và đón đầu làn sóng tuyển dụng mới dự kiến sẽ phục hồi vào cuối năm nay."
    ]
  },
  {
    id: 2,
    title: "Bị sa thải đột ngột: Cẩm nang sinh tồn cho dân Dev trong 24h đầu",
    date: "10/03/2026",
    summary: "Nhận thông báo cho thôi việc luôn là một cú sốc. Đây là những bước bạn cần làm ngay lập tức để bảo vệ quyền lợi và định hướng tiếp theo.",
    imageUrl: "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&q=80&w=800",
    content: [
      "Bị gọi vào phòng họp 1-1 với nhân sự (HR) và nhận thông báo tên mình nằm trong danh sách cắt giảm là ác mộng với bất kỳ lập trình viên nào. Phản ứng tự nhiên thường là sốc, tức giận và lo âu về tương lai. Tuy nhiên, trong 24 giờ đầu tiên sau khi nhận tin, việc giữ một cái đầu lạnh và thái độ bình tĩnh là yếu tố sống còn để bảo vệ quyền lợi hợp pháp của chính bạn.",
      "Thứ nhất, tuyệt đối không vội vàng đặt bút ký vào bất kỳ loại giấy tờ nào nếu bạn chưa đọc và hiểu rõ từng điều khoản. Hãy yêu cầu HR giải thích cặn kẽ về gói trợ cấp thôi việc (severance package), tiền lương những ngày chưa thanh toán, ngày phép còn dư, quyền lợi bảo hiểm thất nghiệp và chính xác ngày làm việc cuối cùng của bạn. Bạn hoàn toàn có quyền xin thêm 1-2 ngày để suy nghĩ và nhờ luật sư hoặc người có kinh nghiệm tư vấn trước khi ký biên bản thỏa thuận chấm dứt hợp đồng lao động.",
      "Thứ hai, hãy thể hiện sự chuyên nghiệp đến phút cuối cùng. Tiến hành bàn giao mã nguồn, tài liệu dự án và các tài khoản công việc một cách rõ ràng, minh bạch. Đừng có hành động phá hoại hệ thống hay xóa dữ liệu vì sự tức giận nhất thời, điều đó có thể dẫn đến hậu quả pháp lý nghiêm trọng. Trước khi trả lại máy tính công ty, hãy sao lưu các tài liệu cá nhân, sao chép các liên lạc (contact) quan trọng của đồng nghiệp, sếp trực tiếp lên mạng xã hội nghề nghiệp như LinkedIn.",
      "Cuối cùng, hãy cho phép bản thân buồn một chút, nhưng đừng để cảm xúc tiêu cực đánh gục bạn. Hãy nhớ rằng việc công ty cắt giảm nhân sự thường là do vấn đề tài chính hoặc thay đổi chiến lược kinh doanh, không hoàn toàn phản ánh năng lực thực sự của bạn. Đây chỉ là một trạm dừng chân tạm thời, hãy nghỉ ngơi vài ngày trước khi cập nhật lại CV và bắt đầu một hành trình mới."
    ]
  },
  {
    id: 3,
    title: "Cắt giảm nhân sự: Ai sẽ là người phải rời đi?",
    date: "05/03/2026",
    summary: "HR và các Manager dùng tiêu chí nào để đưa một nhân sự vào danh sách cắt giảm? Hiểu luật chơi để không bị loại.",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
    content: [
      "Khi ban giám đốc ban hành lệnh cắt giảm nhân sự để tối ưu hóa chi phí, một bài toán khó lập tức được đặt lên bàn của các trưởng phòng (Manager) và bộ phận nhân sự (HR). Họ không chọn người theo cảm tính mà dựa trên một bộ tiêu chí đánh giá khá khắt khe. Việc hiểu rõ những 'luật chơi' ngầm này sẽ giúp bạn nhận diện được mức độ an toàn của bản thân và có sự chuẩn bị kịp thời.",
      "Tiêu chí đầu tiên và mang tính quyết định nhất chính là tính chất của dự án bạn đang tham gia. Những nhân sự đầu tiên rơi vào tầm ngắm thường là thành viên của các dự án thử nghiệm (R&D) chưa mang lại doanh thu, các sản phẩm không đạt chỉ tiêu kinh doanh, hoặc những dự án nội bộ có thể tạm hoãn mà không ảnh hưởng trực tiếp đến dòng tiền của công ty. Nếu bạn đang ở trong một team như vậy, rủi ro là cực kỳ cao.",
      "Tiếp theo là hiệu suất công việc thực tế (Performance Review). Các nhà quản lý sẽ lật lại lịch sử đánh giá KPI/OKR trong 2 đến 3 quý gần nhất. Những lập trình viên thường xuyên trễ deadline, code nhiều lỗi (bug), hoặc không có sự cải thiện về mặt kỹ năng sẽ dễ dàng bị gạch tên. Một yếu tố khác không kém phần quan trọng là mức lương so với mặt bằng chung và giá trị mang lại. Đôi khi, một Senior có mức lương quá cao nhưng hiệu suất chỉ bằng một Mid-level cũng có nguy cơ bị thay thế để tiết kiệm quỹ lương.",
      "Cuối cùng là thái độ làm việc và khả năng hòa nhập văn hóa (Culture Fit). Trong thời kỳ khó khăn, công ty cần những người có tinh thần đồng đội cao, sẵn sàng gánh vác thêm việc và thích nghi nhanh với sự thay đổi. Một cá nhân dù code rất giỏi nhưng thái độ làm việc kém, hay phàn nàn, gây chia rẽ nội bộ (toxic) cũng sẽ là đối tượng ưu tiên bị loại bỏ. Để giữ vị trí an toàn, hãy luôn đảm bảo bạn đang đóng góp trực tiếp vào chuỗi giá trị cốt lõi của doanh nghiệp."
    ]
  },
  {
    id: 4,
    title: "Hành trình từ Layoff đến Offer mới: Chiến lược tìm việc mùa bão",
    date: "01/03/2026",
    summary: "Thị trường tuyển dụng IT đang là 'thị trường của nhà tuyển dụng'. Làm sao để nổi bật giữa hàng ngàn CV ứng tuyển?",
    imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800",
    content: [
      "Sau cơn bão layoff, thị trường lao động IT đột ngột tràn ngập hàng ngàn ứng viên giàu kinh nghiệm, biến cục diện tuyển dụng từ 'thị trường của ứng viên' sang 'thị trường của nhà tuyển dụng'. Để có thể giành được một thư mời làm việc (Offer) tốt trong bối cảnh cạnh tranh khốc liệt này, bạn không thể áp dụng cách tìm việc truyền thống mà cần một chiến lược bài bản, thông minh và chủ động hơn rất nhiều.",
      "Việc đầu tiên và quan trọng nhất là rà soát lại bức tranh tài chính cá nhân. Bạn cần tính toán chính xác số tiền tiết kiệm, tiền trợ cấp thôi việc có thể giúp bạn duy trì mức sống cơ bản trong bao nhiêu tháng (Runway). Việc có một nền tảng tài chính vững chắc sẽ giúp bạn giữ được sự tỉnh táo, không bị ép buộc phải nhận bừa một công việc tồi tệ, lương thấp, ép OT chỉ vì áp lực cơm áo gạo tiền. Sau đó, hãy dành thời gian trau chuốt lại toàn bộ 'vũ khí' của mình: một bản CV sắc nét tập trung vào kết quả đạt được thay vì liệt kê công việc, một profile LinkedIn chuyên nghiệp và một kho lưu trữ GitHub xanh mướt.",
      "Trong mùa bão, việc rải CV mù quáng theo kiểu 'thà đánh nhầm còn hơn bỏ sót' trên các trang tuyển dụng đã không còn hiệu quả. Hãy nghiên cứu kỹ thị trường và nhắm mục tiêu vào các công ty trong những lĩnh vực ít chịu ảnh hưởng bởi suy thoái, hoặc có dòng tiền ổn định như công nghệ tài chính (Fintech), công nghệ y tế (Healthtech), hoặc các công ty gia công (Outsourcing) có tệp khách hàng lớn. Đặc biệt, hãy tận dụng tối đa mạng lưới quan hệ (Networking). Một lời giới thiệu (Referral) từ nhân viên cũ hoặc bạn bè có thể giúp CV của bạn vượt qua hàng trăm hồ sơ khác để đến thẳng tay Hiring Manager.",
      "Cuối cùng, đừng quên mài giũa lại 'kiếm thuật'. Các vòng phỏng vấn kỹ thuật hiện tại đang trở nên khắt khe và sâu sát hơn rất nhiều. Hãy dành thời gian ôn luyện lại các kiến thức nền tảng như Cấu trúc dữ liệu và Giải thuật (LeetCode), Thiết kế hệ thống (System Design), và quan trọng nhất là biết cách kể lại những dự án thực tế bạn đã từng làm một cách trôi chảy, tự tin."
    ]
  },
  {
    id: 5,
    title: "Khủng hoảng tuổi 30 của Lập trình viên giữa bão Layoff",
    date: "25/02/2026",
    summary: "Tuổi 30, chưa lên làm quản lý (Manager), kỹ năng code không còn nhanh bằng các bạn trẻ. Dân IT tuổi 30 cần làm gì để tồn tại?",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
    content: [
      "Bước sang ngưỡng cửa tuổi 30, rất nhiều lập trình viên rơi vào trạng thái hoang mang và đối mặt với một cuộc khủng hoảng sự nghiệp sâu sắc, đặc biệt là khi chứng kiến làn sóng cắt giảm nhân sự càn quét qua ngành công nghệ. Họ cảm thấy áp lực vô hình khi sức khỏe và độ nhạy bén không còn như thuở đôi mươi, trong khi thế hệ Gen Z đang trỗi dậy mạnh mẽ. Những lập trình viên trẻ tuổi này học hỏi công nghệ mới cực nhanh, tràn đầy năng lượng, chấp nhận mức lương khởi điểm thấp hơn và sẵn sàng cày cuốc ngày đêm không biết mệt mỏi.",
      "Nếu một công ty cần thắt lưng buộc bụng, nhóm nhân sự Senior ở độ tuổi 30+ thường bị đưa lên bàn cân đầu tiên. Lý do rất đơn giản: quỹ lương của họ lớn. Nếu sự đóng góp của họ chỉ dừng lại ở việc 'nhận task và code' giống như các bạn Junior hay Mid-level, thì giá trị thặng dư họ tạo ra không tương xứng với chi phí công ty phải bỏ ra. Trong hoàn cảnh đó, việc bị thay thế bởi nguồn lao động trẻ, rẻ và khỏe hơn là quy luật đào thải tất yếu của thị trường tư bản.",
      "Vậy giải pháp sinh tồn cho các lập trình viên tuổi 30 là gì? Chắc chắn không phải là việc cố gắng uống nước tăng lực để chạy đua về tốc độ gõ phím hay thời gian thức đêm với người trẻ. Giá trị cốt lõi của một Developer bước sang tuổi băm nằm ở bề dày kinh nghiệm giải quyết những bài toán hóc búa (Troubleshooting), khả năng nhìn nhận bức tranh tổng thể và thiết kế hệ thống lớn (System Architecture), cũng như kỹ năng quản lý rủi ro dự án. Bạn đã từng chứng kiến nhiều hệ thống sụp đổ và biết cách ngăn chặn nó xảy ra lần nữa.",
      "Để không bị đào thải, bạn bắt buộc phải có sự chuyển mình rõ rệt. Hoặc là bạn đào sâu nghiên cứu để trở thành một chuyên gia kỹ thuật thực thụ (Technical Expert/Architect), người không thể thiếu khi giải quyết các vấn đề phức tạp. Hoặc bạn phải rẽ nhánh phát triển các kỹ năng mềm để chuyển lên con đường quản lý (Project Manager/Engineering Manager), nơi bạn dùng tư duy để lãnh đạo và hỗ trợ team phát triển. Nếu đứng yên mãi ở mức 'chỉ biết gõ code', bạn đang tự đặt mình vào thế nguy hiểm."
    ]
  }
];

export default function ITBlog() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  if (selectedArticle) {
    return (
      <div className="it-blog-wrapper">
        <div className="article-detail">
          <button className="back-btn" onClick={() => setSelectedArticle(null)}>
            <i className="arrow-left"></i> Back to list
          </button>
          
          <h1 className="detail-title">{selectedArticle.title}</h1>
          <div className="detail-meta">
            <span className="detail-date">Published on: {selectedArticle.date}</span>
          </div>
          
          <div className="detail-hero-image">
            <img src={selectedArticle.imageUrl} alt={selectedArticle.title} />
          </div>

          <div className="detail-content">
            <p className="detail-summary">{selectedArticle.summary}</p>
            {selectedArticle.content.map((paragraph, index) => (
              <p key={index} className="detail-paragraph">{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="it-blog-wrapper">
      <div className="it-blog-header">
        <h2>IT Industry Insights</h2>
        <p>Expert articles, career advice, and market trends for Software Engineers</p>
      </div>

      <div className="it-blog-grid">
        {mockArticles.map((article) => (
          <div key={article.id} className="it-blog-card" onClick={() => setSelectedArticle(article)}>
            <div className="card-image-container">
              <img src={article.imageUrl} alt={article.title} className="card-image" />
            </div>
            <div className="card-content">
              <h3 className="card-title">{article.title}</h3>
              <p className="card-summary">{article.summary}</p>
              <span className="card-date">{article.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}