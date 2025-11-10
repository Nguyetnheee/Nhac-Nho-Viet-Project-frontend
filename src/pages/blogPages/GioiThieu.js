// src/pages/blogPages/GioiThieu.js
import React from 'react';
import BlogTemplate from '../../components/BlogTemplate';

const GioiThieu = () => {
  return (
    <BlogTemplate
      title="Giới Thiệu Nhắc Nhớ Việt - Đồ Cúng Tận Tâm Cho Mọi Nhà"
      date="10/11/2025"
      author="Nhắc Nhớ Việt"
      relatedLinks={[
        { title: "Hướng Dẫn Bảo Quản Đồ Lễ", url: "/blog/huong-dan-bao-quan" },
        { title: "Câu Hỏi Thường Gặp", url: "/blog/faq" },
      ]}
    >
      {/* Nội dung bài viết - Bạn chỉ cần thay đổi phần này */}
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Về Nhắc Nhớ Việt
          </h2>
          <p className="text-gray-700 leading-relaxed">
            <strong className="text-vietnam-green">Nhắc Nhớ Việt</strong> là đơn vị chuyên cung cấp 
            các mâm lễ cúng truyền thống Việt Nam với phương châm <em>"Đồ Cúng Tận Tâm Cho Mọi Nhà"</em>. 
            Chúng tôi tự hào mang đến cho khách hàng những sản phẩm chất lượng cao, đảm bảo vệ sinh 
            an toàn thực phẩm và giữ gìn bản sắc văn hóa dân tộc.
          </p>
        </section>

        <section className="bg-vietnam-cream p-6 rounded-xl">
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Sứ Mệnh Của Chúng Tôi
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-vietnam-gold text-xl">✓</span>
              <span>Bảo tồn và phát huy các giá trị văn hóa truyền thống Việt Nam</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-vietnam-gold text-xl">✓</span>
              <span>Cung cấp mâm lễ cúng chất lượng cao với giá cả hợp lý</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-vietnam-gold text-xl">✓</span>
              <span>Tư vấn tận tình, chu đáo cho từng nhu cầu của khách hàng</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-vietnam-gold text-xl">✓</span>
              <span>Giao hàng nhanh chóng, đúng giờ, đảm bảo sự trang trọng cho nghi lễ</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Giá Trị Cốt Lõi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-l-4 border-vietnam-gold pl-4">
              <h3 className="font-bold text-vietnam-green mb-2">Tận Tâm</h3>
              <p className="text-gray-600">
                Phục vụ khách hàng với sự tận tình, chu đáo trong từng chi tiết nhỏ nhất.
              </p>
            </div>
            <div className="border-l-4 border-vietnam-gold pl-4">
              <h3 className="font-bold text-vietnam-green mb-2">Uy Tín</h3>
              <p className="text-gray-600">
                Cam kết chất lượng sản phẩm, minh bạch trong giá cả và dịch vụ.
              </p>
            </div>
            <div className="border-l-4 border-vietnam-gold pl-4">
              <h3 className="font-bold text-vietnam-green mb-2">Chất Lượng</h3>
              <p className="text-gray-600">
                Lựa chọn nguyên liệu tươi ngon, chế biến theo quy trình nghiêm ngặt.
              </p>
            </div>
            <div className="border-l-4 border-vietnam-gold pl-4">
              <h3 className="font-bold text-vietnam-green mb-2">Truyền Thống</h3>
              <p className="text-gray-600">
                Giữ gìn và phát huy các giá trị văn hóa cúng lễ Việt Nam.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-vietnam-cream to-amber-50 p-6 rounded-xl">
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Thông Tin Liên Hệ
          </h2>
          <div className="space-y-2 text-gray-700">
            <p><strong>Địa chỉ:</strong> 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
            <p><strong>Hotline:</strong> <a href="tel:0123456789" className="text-vietnam-gold hover:underline">0123 456 789</a></p>
            <p><strong>Email:</strong> <a href="mailto:contact@nhacnhoviet.vn" className="text-vietnam-gold hover:underline">contact@nhacnhoviet.vn</a></p>
            <p><strong>Website:</strong> <a href="https://nhacnhoviet.vn" className="text-vietnam-gold hover:underline">www.nhacnhoviet.vn</a></p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Tại Sao Chọn Nhắc Nhớ Việt?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Với nhiều năm kinh nghiệm trong lĩnh vực cung cấp đồ lễ cúng, <strong>Nhắc Nhớ Việt</strong>  
             đã và đang đồng hành cùng hàng nghìn gia đình Việt trong việc duy trì các nghi lễ truyền thống. 
            Chúng tôi hiểu rằng mỗi mâm lễ không chỉ là sự chuẩn bị chu đáo mà còn là tấm lòng thành kính 
            của con cháu với tổ tiên, với Trời Phật.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Hãy để <strong className="text-vietnam-green">Nhắc Nhớ Việt</strong> đồng hành cùng bạn 
            trong mọi dịp lễ quan trọng, để mỗi mâm cúng đều trọn vẹn tâm thành và ý nghĩa!
          </p>
        </section>
      </div>
    </BlogTemplate>
  );
};

export default GioiThieu;
