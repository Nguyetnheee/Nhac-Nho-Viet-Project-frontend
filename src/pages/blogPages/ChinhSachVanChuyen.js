// src/pages/blogPages/ChinhSachVanChuyen.js
import React from 'react';
import BlogTemplate from '../../components/BlogTemplate';

const ChinhSachVanChuyen = () => {
  return (
    <BlogTemplate
      title="Chính Sách Vận Chuyển | Nhắc Nhớ Việt"
      date="10/11/2025"
      relatedLinks={[
        { title: "Chính Sách Khách Hàng", url: "/blog/chinh-sach-khach-hang" },
        { title: "Chính Sách Đổi Trả", url: "/blog/chinh-sach-doi-tra" },
      ]}
    >
      <div className="space-y-6">
        <section>
          <p className="text-gray-700 leading-relaxed text-lg">
            Nhắc Nhớ Việt cam kết mang đến dịch vụ vận chuyển nhanh chóng, an toàn và đúng giờ 
            với đội ngũ shipper chuyên nghiệp, đảm bảo mâm lễ đến tay bạn trong tình trạng hoàn hảo. 
            Hiện tại chúng tôi chỉ giao hàng trong nội thành thành phố Hồ Chí Minh và <strong className="text-vietnam-green">miễn phí vận chuyển</strong> cho tất cả các đơn hàng.
          </p>
        </section>

        <section className="bg-vietnam-cream p-6 rounded-xl">
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Phạm Vi Giao Hàng
          </h2>
          <div className="border-l-4 border-vietnam-gold pl-4">
            <h3 className="font-bold text-vietnam-green mb-2 text-xl">Nội Thành Thành Phố Hồ Chí Minh</h3>
            <p className="text-gray-700 text-lg">
              Chúng tôi hiện chỉ giao hàng trong phạm vi nội thành TP.HCM. Giao hàng trong ngày, từ 3-5 giờ sau khi đặt hàng.
            </p>
            <p className="text-gray-700 mt-2">
              <strong className="text-vietnam-green">Lưu ý:</strong> Đối với các khu vực ngoài nội thành TP.HCM, 
              vui lòng liên hệ trực tiếp với chúng tôi để được tư vấn.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Bảng Giá Vận Chuyển
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-2 border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-vietnam-green text-white">
                <tr>
                  <th className="p-4 text-left">Khu Vực</th>
                  <th className="p-4 text-left">Giá Trị Đơn Hàng</th>
                  <th className="p-4 text-left">Phí Vận Chuyển</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr className="bg-vietnam-cream">
                  <td className="p-4 font-semibold">Nội thành TP.HCM</td>
                  <td className="p-4">Tất cả đơn hàng</td>
                  <td className="p-4 font-bold text-green-600 text-lg">MIỄN PHÍ</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <p className="text-gray-700">
              <strong className="text-vietnam-green">Ưu đãi đặc biệt:</strong> Tất cả đơn hàng giao trong nội thành TP.HCM đều được <strong>miễn phí vận chuyển</strong>, không phân biệt giá trị đơn hàng.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-vietnam-cream to-amber-50 p-6 rounded-xl">
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Quy Trình Đóng Gói & Vận Chuyển
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-vietnam-gold text-2xl font-bold">1.</span>
              <div>
                <h3 className="font-bold text-vietnam-green mb-1">Kiểm Tra Chất Lượng</h3>
                <p className="text-gray-700">
                  Tất cả sản phẩm được kiểm tra kỹ lưỡng trước khi đóng gói
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-vietnam-gold text-2xl font-bold">2.</span>
              <div>
                <h3 className="font-bold text-vietnam-green mb-1">Đóng Gói Chuyên Nghiệp</h3>
                <p className="text-gray-700">
                  Sử dụng hộp carton cứng, túi giữ nhiệt và vật liệu chống sốc
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-vietnam-gold text-2xl font-bold">3.</span>
              <div>
                <h3 className="font-bold text-vietnam-green mb-1">Vận Chuyển Nhanh Chóng</h3>
                <p className="text-gray-700">
                  Đội ngũ shipper giao hàng trực tiếp, đảm bảo đúng giờ
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-vietnam-gold text-2xl font-bold">4.</span>
              <div>
                <h3 className="font-bold text-vietnam-green mb-1">Xác Nhận Nhận Hàng</h3>
                <p className="text-gray-700">
                  Khách hàng kiểm tra và xác nhận trước khi thanh toán
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Lưu Ý Quan Trọng
          </h2>
          <div className="bg-amber-50 border-l-4 border-vietnam-gold p-6 rounded-r-xl">
            <ul className="space-y-2 text-gray-700">
              <li>• Chúng tôi chỉ giao hàng trong phạm vi nội thành thành phố Hồ Chí Minh</li>
              <li>• Tất cả đơn hàng đều được <strong className="text-vietnam-green">miễn phí vận chuyển</strong></li>
              <li>• Vui lòng cung cấp địa chỉ đầy đủ và số điện thoại chính xác</li>
              <li>• Đối với đơn hàng gấp, vui lòng liên hệ trước để xác nhận</li>
              <li>• Khách hàng nên có mặt tại địa chỉ nhận hàng đúng giờ hẹn</li>
              <li>• Trường hợp đơn hàng bị hư hỏng trong quá trình vận chuyển, vui lòng liên hệ ngay</li>
              <li>• Đối với đơn hàng ngoài nội thành TP.HCM, vui lòng liên hệ trực tiếp để được tư vấn</li>
            </ul>
          </div>
        </section>

        <section 
          className="relative text-white p-6 rounded-xl overflow-hidden"
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
            <h2 className="text-xl font-bold mb-3">
              Hỗ Trợ Vận Chuyển 24/7
            </h2>
            <p className="mb-4 text-green-100">
              Cần hỗ trợ về vận chuyển? Liên hệ ngay với chúng tôi!
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="tel:0123456789" className="bg-white text-vietnam-green px-4 py-2 rounded-lg font-semibold hover:bg-vietnam-gold hover:text-white transition-colors">
                Hotline: 0123 456 789
              </a>
              <a href="mailto:ship@nhacnhoviet.vn" className="bg-vietnam-gold text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
                Email: ship@nhacnhoviet.vn
              </a>
            </div>
          </div>
        </section>
      </div>
    </BlogTemplate>
  );
};

export default ChinhSachVanChuyen;
