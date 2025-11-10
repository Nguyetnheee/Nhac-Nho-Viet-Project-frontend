// src/pages/blogPages/FAQ.js
import React, { useState } from 'react';
import BlogTemplate from '../../components/BlogTemplate';

const FAQ = () => {
  const [openQuestion, setOpenQuestion] = useState(null);

  const faqs = [
    {
      question: "Nhắc Nhớ Việt cung cấp những loại mâm lễ nào?",
      answer: "Chúng tôi cung cấp đa dạng các loại mâm lễ từ lễ Tết, lễ giỗ, lễ cúng tổ tiên, lễ cúng thần linh, đến các lễ khai trương, cưới hỏi theo phong tục truyền thống 3 miền Bắc - Trung - Nam."
    },
    {
      question: "Tôi có thể đặt hàng trước bao lâu?",
      answer: "Bạn nên đặt hàng trước ít nhất 1-2 ngày để chúng tôi chuẩn bị chu đáo. Đối với các dịp lễ lớn (Tết, Rằm tháng 7...), nên đặt trước 3-5 ngày."
    },
    {
      question: "Giá cả của mâm lễ như thế nào?",
      answer: "Giá mâm lễ dao động từ 200.000đ - 5.000.000đ tùy theo quy mô và loại lễ. Chúng tôi cam kết giá cả minh bạch, hợp lý và có nhiều gói lựa chọn phù hợp với mọi gia đình."
    },
    {
      question: "Nhắc Nhớ Việt có giao hàng tận nơi không?",
      answer: "Có, chúng tôi có dịch vụ giao hàng tận nơi với đội ngũ shipper riêng, đảm bảo giao đúng giờ và giữ nguyên chất lượng mâm lễ."
    },
    {
      question: "Tôi có thể tự chọn nguyên liệu cho mâm lễ không?",
      answer: "Tất nhiên! Bạn có thể tùy chỉnh theo nhu cầu hoặc để chúng tôi tư vấn dựa trên phong tục và loại lễ để mâm cúng được chuẩn xác nhất."
    },
    {
      question: "Chính sách đổi trả như thế nào?",
      answer: "Nếu sản phẩm có vấn đề về chất lượng, bạn có thể liên hệ ngay để chúng tôi hỗ trợ đổi trả hoặc xử lý trong vòng 2 giờ trước giờ lễ."
    },
    {
      question: "Nhắc Nhớ Việt có tư vấn về phong tục lễ nghi không?",
      answer: "Có, đội ngũ của chúng tôi sẵn sàng tư vấn về cách bày mâm, phong tục, và các lưu ý khi cúng lễ để bạn yên tâm thực hiện đúng nghĩa."
    },
    {
      question: "Làm sao để liên hệ với Nhắc Nhớ Việt?",
      answer: "Bạn có thể liên hệ qua Hotline: 0123 456 789, Email: contact@nhacnhoviet.vn hoặc truy cập website để đặt hàng trực tuyến."
    }
  ];

  return (
    <BlogTemplate
      title="Các Câu Hỏi Thường Gặp Tại Nhắc Nhớ Việt"
      date="10/11/2025"
      relatedLinks={[
        { title: "Giới Thiệu Nhắc Nhớ Việt", url: "/blog/gioi-thieu" },
        { title: "Chính Sách Khách Hàng", url: "/blog/chinh-sach-khach-hang" },
      ]}
    >
      <div className="space-y-6">
        <section>
          <p className="text-gray-700 leading-relaxed text-lg mb-8">
            Dưới đây là tổng hợp các câu hỏi thường gặp từ khách hàng về dịch vụ của Nhắc Nhớ Việt. 
            Nếu bạn có thắc mắc khác, đừng ngần ngại liên hệ với chúng tôi!
          </p>
        </section>

        <section className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-vietnam-gold transition-all"
            >
              <button
                onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-vietnam-cream transition-colors"
              >
                <h3 className="text-lg font-semibold text-vietnam-green pr-4">
                  {faq.question}
                </h3>
                <span className={`text-vietnam-gold text-2xl transition-transform ${
                  openQuestion === index ? 'rotate-180' : ''
                }`}>
                  ▼
                </span>
              </button>
              
              {openQuestion === index && (
                <div className="px-6 pb-6 pt-2 bg-vietnam-cream border-t-2 border-amber-100">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </section>

        <section 
          className="relative text-white p-8 rounded-xl text-center overflow-hidden"
          style={{
            backgroundImage: 'url(/hero-background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div 
            className="absolute inset-0 bg-gradient-to-r from-vietnam-green to-emerald-700 opacity-80"
          ></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-serif font-bold mb-4">
              Không Tìm Thấy Câu Trả Lời?
            </h2>
            <p className="mb-6 text-green-100">
              Đừng lo lắng! Liên hệ ngay với chúng tôi để được hỗ trợ tận tình
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:0123456789"
                className="inline-flex items-center gap-2 bg-white text-vietnam-green px-6 py-3 rounded-lg font-semibold hover:bg-vietnam-gold hover:text-white transition-colors"
              >
                Gọi Ngay
              </a>
              <a
                href="mailto:contact@nhacnhoviet.vn"
                className="inline-flex items-center gap-2 bg-vietnam-gold text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
              >
                Gửi Email
              </a>
            </div>
          </div>
        </section>

        <section className="bg-amber-50 border-l-4 border-vietnam-gold p-6 rounded-r-xl">
          <h2 className="text-xl font-bold text-vietnam-green mb-3">
            Mẹo Hữu Ích
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Đặt hàng sớm để có nhiều lựa chọn và giá tốt hơn</li>
            <li>• Tham khảo các gói mâm lễ mẫu trên website để tiết kiệm thời gian</li>
            <li>• Theo dõi fanpage để cập nhật các chương trình khuyến mãi</li>
            <li>• Lưu lại số hotline để liên hệ nhanh khi cần</li>
          </ul>
        </section>
      </div>
    </BlogTemplate>
  );
};

export default FAQ;
