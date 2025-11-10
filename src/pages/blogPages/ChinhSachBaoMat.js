// src/pages/blogPages/ChinhSachBaoMat.js
import React from 'react';
import BlogTemplate from '../../components/BlogTemplate';

const ChinhSachBaoMat = () => {
  return (
    <BlogTemplate
      title="Chính Sách Bảo Mật Thông Tin Tại Nhắc Nhớ Việt"
      date="10/11/2025"
      relatedLinks={[
        { title: "Chính Sách Khách Hàng", url: "/blog/chinh-sach-khach-hang" },
        { title: "Chính Sách Thanh Toán", url: "/blog/chinh-sach-thanh-toan" },
      ]}
    >
      <div className="space-y-6">
        <section>
          <p className="text-gray-700 leading-relaxed text-lg">
            <strong className="text-vietnam-green">Nhắc Nhớ Việt</strong> cam kết bảo vệ thông tin 
            cá nhân của khách hàng với các biện pháp bảo mật cao nhất. Chính sách này giải thích 
            cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.
          </p>
        </section>

        <section className="bg-vietnam-cream p-6 rounded-xl">
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Thông Tin Chúng Tôi Thu Thập
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-vietnam-green mb-2">1. Thông Tin Cá Nhân</h3>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li>• Họ tên, số điện thoại, email</li>
                <li>• Địa chỉ giao hàng</li>
                <li>• Thông tin thanh toán (được mã hóa)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-vietnam-green mb-2">2. Thông Tin Đơn Hàng</h3>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li>• Lịch sử mua hàng</li>
                <li>• Sản phẩm đã xem</li>
                <li>• Đánh giá và nhận xét</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-vietnam-green mb-2">3. Thông Tin Kỹ Thuật</h3>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li>• Địa chỉ IP, loại trình duyệt</li>
                <li>• Thời gian truy cập website</li>
                <li>• Cookies và dữ liệu phiên</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Mục Đích Sử Dụng Thông Tin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-vietnam-gold bg-white p-4 rounded-xl">
              <h3 className="font-bold text-vietnam-green mb-2 flex items-center gap-2">
                Xử Lý Đơn Hàng
              </h3>
              <p className="text-gray-700 text-sm">
                Xác nhận, đóng gói và giao hàng đúng địa chỉ
              </p>
            </div>

            <div className="border-2 border-vietnam-gold bg-white p-4 rounded-xl">
              <h3 className="font-bold text-vietnam-green mb-2 flex items-center gap-2">
                Liên Lạc Khách Hàng
              </h3>
              <p className="text-gray-700 text-sm">
                Gửi thông báo đơn hàng, chương trình khuyến mãi
              </p>
            </div>

            <div className="border-2 border-vietnam-gold bg-white p-4 rounded-xl">
              <h3 className="font-bold text-vietnam-green mb-2 flex items-center gap-2">
                Cải Thiện Dịch Vụ
              </h3>
              <p className="text-gray-700 text-sm">
                Phân tích hành vi để nâng cao trải nghiệm
              </p>
            </div>

            <div className="border-2 border-vietnam-gold bg-white p-4 rounded-xl">
              <h3 className="font-bold text-vietnam-green mb-2 flex items-center gap-2">
                Chương Trình Ưu Đãi
              </h3>
              <p className="text-gray-700 text-sm">
                Tích điểm, tặng quà và chăm sóc khách hàng
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-vietnam-cream to-amber-50 p-6 rounded-xl">
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Biện Pháp Bảo Mật
          </h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start gap-3">
              <span className="text-vietnam-gold text-xl">✓</span>
              <div>
                <strong>Mã Hóa SSL:</strong> Tất cả dữ liệu được truyền qua kết nối HTTPS an toàn
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-vietnam-gold text-xl">✓</span>
              <div>
                <strong>Tường Lửa:</strong> Hệ thống tường lửa bảo vệ khỏi truy cập trái phép
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-vietnam-gold text-xl">✓</span>
              <div>
                <strong>Phân Quyền:</strong> Chỉ nhân viên được ủy quyền mới truy cập dữ liệu
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-vietnam-gold text-xl">✓</span>
              <div>
                <strong>Sao Lưu Định Kỳ:</strong> Dữ liệu được sao lưu thường xuyên tránh mất mát
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-vietnam-gold text-xl">✓</span>
              <div>
                <strong>Kiểm Tra Bảo Mật:</strong> Định kỳ rà soát và cập nhật hệ thống
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Quyền Của Khách Hàng
          </h2>
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-vietnam-gold">→</span>
                <span><strong>Quyền truy cập:</strong> Yêu cầu xem thông tin cá nhân đã lưu trữ</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-vietnam-gold">→</span>
                <span><strong>Quyền chỉnh sửa:</strong> Cập nhật thông tin không chính xác</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-vietnam-gold">→</span>
                <span><strong>Quyền xóa:</strong> Yêu cầu xóa dữ liệu cá nhân (trừ thông tin bắt buộc theo pháp luật)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-vietnam-gold">→</span>
                <span><strong>Quyền từ chối:</strong> Không nhận email marketing (vẫn nhận thông báo đơn hàng)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-vietnam-gold">→</span>
                <span><strong>Quyền khiếu nại:</strong> Liên hệ nếu có vấn đề về bảo mật thông tin</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="bg-amber-50 border-l-4 border-vietnam-gold p-6 rounded-r-xl">
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Chia Sẻ Thông Tin
          </h2>
          <p className="text-gray-700 mb-3">
            <strong>Nhắc Nhớ Việt cam kết KHÔNG:</strong>
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>• Bán thông tin khách hàng cho bên thứ ba</li>
            <li>• Chia sẻ thông tin cho mục đích marketing của đối tác</li>
            <li>• Sử dụng thông tin ngoài mục đích đã nêu</li>
          </ul>
          <p className="text-gray-700 mt-3">
            <strong>Chúng tôi CHỈ chia sẻ khi:</strong>
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>• Cần thiết để hoàn thành đơn hàng (đơn vị vận chuyển, thanh toán)</li>
            <li>• Có yêu cầu từ cơ quan chức năng theo quy định pháp luật</li>
            <li>• Được sự đồng ý rõ ràng từ khách hàng</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Cookies
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Website sử dụng cookies để cải thiện trải nghiệm người dùng. Bạn có thể tắt cookies 
            trong cài đặt trình duyệt, nhưng một số tính năng có thể không hoạt động đầy đủ.
          </p>
          <div className="bg-vietnam-cream p-4 rounded-lg">
            <p className="text-gray-700 text-sm">
              <strong>Lưu ý:</strong> Cookies chỉ lưu trữ thông tin cần thiết như giỏ hàng, 
              ngôn ngữ, và không chứa thông tin nhạy cảm.
            </p>
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
              Liên Hệ Về Bảo Mật
            </h2>
            <p className="mb-4 text-green-100">
              Có thắc mắc về chính sách bảo mật? Liên hệ ngay:
            </p>
            <div className="space-y-2">
              <p>Hotline: <strong>0123 456 789</strong></p>
              <p>Email: <strong>privacy@nhacnhoviet.vn</strong></p>
              <p>Thời gian hỗ trợ: <strong>24/7</strong></p>
            </div>
          </div>
        </section>

        <section>
          <p className="text-gray-600 text-sm italic text-center">
            <em>Chính sách này có thể được cập nhật định kỳ. Phiên bản cập nhật: 10/11/2025</em>
          </p>
        </section>
      </div>
    </BlogTemplate>
  );
};

export default ChinhSachBaoMat;
