// src/pages/blogPages/ChinhSachKhachHang.js
import React from 'react';
import BlogTemplate from '../../components/BlogTemplate';

const ChinhSachKhachHang = () => {
  return (
    <BlogTemplate
      title="Chính Sách Khách Hàng Thân Thiết Tại Nhắc Nhớ Việt"
      date="10/11/2025"
      relatedLinks={[
        { title: "Chính Sách Vận Chuyển", url: "/blog/chinh-sach-van-chuyen" },
        { title: "Chính Sách Thanh Toán", url: "/blog/chinh-sach-thanh-toan" },
      ]}
    >
      <div className="space-y-6">
        <section>
          <p className="text-gray-700 leading-relaxed text-lg">
            Nhắc Nhớ Việt trân trọng giới thiệu chương trình <strong className="text-vietnam-green">"Hũ Thần Tài - Tích Điểm Lộc"</strong> 
            dành riêng cho khách hàng thân thiết, mang đến nhiều ưu đãi hấp dẫn!
          </p>
        </section>

        <section className="bg-gradient-to-r from-vietnam-cream to-amber-50 p-6 rounded-xl">
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Cách Thức Tích Điểm
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong className="text-vietnam-green">Quy đổi:</strong> Cứ mỗi <strong>100.000 VNĐ</strong> trong 
              đơn hàng = <strong>1 Điểm Lộc</strong>
            </p>
            <p>
              <strong className="text-vietnam-green">Thời hạn:</strong> Điểm Lộc có hiệu lực trong 12 tháng 
              kể từ ngày tích lũy
            </p>
            <p>
              <strong className="text-vietnam-green">Áp dụng:</strong> Tất cả đơn hàng từ 200.000 VNĐ trở lên
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Bảng Ưu Đãi Theo Hạng Thành Viên
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Đồng */}
            <div className="bg-gradient-to-br from-amber-100 to-amber-50 p-6 rounded-xl border-2 border-amber-300">
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-amber-700">Hạng Đồng</h3>
                  <p className="text-sm text-gray-600">Từ 0 - 50 điểm</p>
                </div>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Giảm 3% mỗi đơn hàng</li>
                <li>✓ Tích điểm x1</li>
                <li>✓ Ưu tiên hỗ trợ</li>
              </ul>
            </div>

            {/* Bạc */}
            <div className="bg-gradient-to-br from-gray-200 to-gray-100 p-6 rounded-xl border-2 border-gray-400">
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-700">Hạng Bạc</h3>
                  <p className="text-sm text-gray-600">Từ 51 - 100 điểm</p>
                </div>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Giảm 5% mỗi đơn hàng</li>
                <li>✓ Tích điểm x1.2</li>
                <li>✓ Miễn phí ship {'<'} 5km</li>
                <li>✓ Quà tặng dịp lễ</li>
              </ul>
            </div>

            {/* Vàng */}
            <div className="bg-gradient-to-br from-yellow-200 to-yellow-100 p-6 rounded-xl border-2 border-yellow-400">
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-yellow-700">Hạng Vàng</h3>
                  <p className="text-sm text-gray-600">Từ 101 - 200 điểm</p>
                </div>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Giảm 7% mỗi đơn hàng</li>
                <li>✓ Tích điểm x1.5</li>
                <li>✓ Miễn phí ship {'<'} 10km</li>
                <li>✓ Ưu tiên đặt hàng cao điểm</li>
                <li>✓ Quà tặng đặc biệt</li>
              </ul>
            </div>

            {/* Kim Cương */}
            <div className="bg-gradient-to-br from-blue-200 to-blue-100 p-6 rounded-xl border-2 border-blue-400">
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-blue-700">Hạng Kim Cương</h3>
                  <p className="text-sm text-gray-600">Từ 201 điểm trở lên</p>
                </div>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Giảm 10% mỗi đơn hàng</li>
                <li>✓ Tích điểm x2</li>
                <li>✓ Miễn phí ship toàn quốc</li>
                <li>✓ Tư vấn riêng 24/7</li>
                <li>✓ Combo VIP theo yêu cầu</li>
                <li>✓ Quà tặng cao cấp</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-vietnam-cream p-6 rounded-xl">
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Điều Khoản & Điều Kiện
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Chương trình áp dụng cho tất cả khách hàng đăng ký tài khoản</li>
            <li>• Điểm Lộc không có giá trị quy đổi thành tiền mặt</li>
            <li>• Điểm Lộc không được chuyển nhượng cho người khác</li>
            <li>• Khách hàng cần đăng nhập tài khoản khi đặt hàng để tích điểm</li>
            <li>• Nhắc Nhớ Việt có quyền điều chỉnh chính sách khi có thông báo</li>
          </ul>
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
              Đăng Ký Ngay Hôm Nay!
            </h2>
            <p className="mb-6 text-green-100">
              Tham gia chương trình khách hàng thân thiết để nhận ưu đãi độc quyền
            </p>
            <a
              href="/register"
              className="inline-block bg-vietnam-gold text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-600 transition-colors"
            >
              Đăng Ký Miễn Phí
            </a>
          </div>
        </section>
      </div>
    </BlogTemplate>
  );
};

export default ChinhSachKhachHang;
