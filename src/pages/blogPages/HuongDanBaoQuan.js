// src/pages/blogPages/HuongDanBaoQuan.js
import React from 'react';
import BlogTemplate from '../../components/BlogTemplate';

const HuongDanBaoQuan = () => {
  return (
    <BlogTemplate
      title="Hướng Dẫn Bảo Quản Đồ Lễ"
      date="10/11/2025"
      relatedLinks={[
        { title: "Giới Thiệu Nhắc Nhớ Việt", url: "/blog/gioi-thieu" },
        { title: "Câu Hỏi Thường Gặp", url: "/blog/faq" },
      ]}
    >
      <div className="space-y-6">
        <section>
          <p className="text-gray-700 leading-relaxed text-lg">
            Việc bảo quản đồ lễ đúng cách không chỉ giúp giữ trọn vẹn tâm thành mà còn đảm bảo 
            chất lượng và ý nghĩa của lễ vật. Dưới đây là hướng dẫn chi tiết từ Nhắc Nhớ Việt.
          </p>
        </section>

        <section className="bg-vietnam-cream p-6 rounded-xl">
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Bảo Quản Hoa Quả Tươi
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-vietnam-gold text-2xl">1.</span>
              <div>
                <h3 className="font-bold text-vietnam-green mb-2">Giữ Ở Nhiệt Độ Phù Hợp</h3>
                <p className="text-gray-700">
                  Hầu hết hoa quả nên được bảo quản ở nhiệt độ phòng 15-20°C. 
                  Tránh để trong tủ lạnh trừ khi cần thiết vì có thể làm mất hương vị tự nhiên.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-vietnam-gold text-2xl">2.</span>
              <div>
                <h3 className="font-bold text-vietnam-green mb-2">Tránh Tiếp Xúc Trực Tiếp Với Ánh Sáng</h3>
                <p className="text-gray-700">
                  Đặt mâm hoa quả ở nơi thoáng mát, tránh ánh nắng trực tiếp để giữ màu sắc tươi đẹp.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-vietnam-gold text-2xl">3.</span>
              <div>
                <h3 className="font-bold text-vietnam-green mb-2">Kiểm Tra Thường Xuyên</h3>
                <p className="text-gray-700">
                  Loại bỏ những quả hư hỏng ngay lập tức để tránh lây lan cho các quả khác.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Bảo Quản Hương, Đèn Cúng
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-vietnam-gold">✓</span>
              <span>Để hương nến ở nơi khô ráo, thoáng mát, tránh ẩm mốc</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-vietnam-gold">✓</span>
              <span>Không để gần nguồn nhiệt hoặc chất dễ cháy</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-vietnam-gold">✓</span>
              <span>Bọc kín để tránh bụi bẩn và mất mùi hương</span>
            </li>
          </ul>
        </section>

        <section className="bg-gradient-to-r from-vietnam-cream to-amber-50 p-6 rounded-xl">
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Bảo Quản Thịt, Cá, Hải Sản
          </h2>
          <div className="space-y-3">
            <p className="text-gray-700">
              <strong className="text-vietnam-green">Thịt tươi:</strong> Bảo quản trong ngăn mát tủ lạnh 
              (0-4°C) và sử dụng trong vòng 1-2 ngày.
            </p>
            <p className="text-gray-700">
              <strong className="text-vietnam-green">Cá, hải sản:</strong> Nên sử dụng ngay trong ngày 
              hoặc để ngăn đá nếu để lâu hơn.
            </p>
            <p className="text-gray-700">
              <strong className="text-vietnam-green">Thực phẩm chế biến:</strong> Để trong hộp kín, 
              bảo quản lạnh và hâm nóng kỹ trước khi dùng.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Bảo Quản Hoa Tươi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-l-4 border-vietnam-gold pl-4">
              <h3 className="font-bold text-vietnam-green mb-2">Cắt Tỉa Thân Hoa</h3>
              <p className="text-gray-600">
                Cắt chéo 45° và thay nước sạch mỗi ngày để hoa tươi lâu hơn.
              </p>
            </div>
            <div className="border-l-4 border-vietnam-gold pl-4">
              <h3 className="font-bold text-vietnam-green mb-2">Thêm Dinh Dưỡng</h3>
              <p className="text-gray-600">
                Có thể thêm 1 muỗng đường hoặc thuốc dưỡng hoa vào nước.
              </p>
            </div>
            <div className="border-l-4 border-vietnam-gold pl-4">
              <h3 className="font-bold text-vietnam-green mb-2">Tránh Nắng Gió</h3>
              <p className="text-gray-600">
                Đặt bình hoa ở nơi thoáng mát, tránh ánh nắng trực tiếp.
              </p>
            </div>
            <div className="border-l-4 border-vietnam-gold pl-4">
              <h3 className="font-bold text-vietnam-green mb-2">Loại Bỏ Lá Úa</h3>
              <p className="text-gray-600">
                Cắt bỏ lá héo, hoa tàn để giữ cho bình hoa luôn đẹp mắt.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-amber-50 border-l-4 border-vietnam-gold p-6 rounded-r-xl">
          <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
            Lưu Ý Quan Trọng
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Nên sử dụng đồ lễ trong thời gian sớm nhất để đảm bảo tươi ngon</li>
            <li>• Không trộn lẫn các loại thực phẩm có mùi mạnh</li>
            <li>• Kiểm tra hạn sử dụng của các sản phẩm đóng gói</li>
            <li>• Liên hệ Nhắc Nhớ Việt để được tư vấn cụ thể cho từng loại đồ lễ</li>
          </ul>
        </section>

        <section>
          <p className="text-gray-700 leading-relaxed text-center italic">
            "Bảo quản đồ lễ đúng cách là thể hiện sự tôn trọng và tâm thành với các giá trị tâm linh. 
            Hãy để <strong className="text-vietnam-green">Nhắc Nhớ Việt</strong> đồng hành cùng bạn!"
          </p>
        </section>
      </div>
    </BlogTemplate>
  );
};

export default HuongDanBaoQuan;
