
import React from "react";

const AboutUs = () => {

  const aboutUsItems = [

     {
      title: "Giới Thiệu Nhắc Nhớ Việt - Đồ Cúng Tận Tâm Cho Mọi Nhà",
      image:
        "https://pos.nvncdn.com/26fee5-146732/art/20241119_wTkFMKfg.jpeg?v=1732027881", 
        //lấy url ảnh giới thiệu về Nhắc Nhớ Việt gắn vào đây
      link: "/information",
      description:
        "Nhắc Nhớ Việt, Đồ Cúng Tận Tâm chuyên cung cấp mâm lễ cúng chất lượng cao, đảm bảo uy tín và tận tâm trong từng dịch vụ.",
    },

    {
      title: "Hướng Dẫn Bảo Quản Đồ Lễ",
      image:
        "https://pos.nvncdn.com/26fee5-146732/art/20250721_mkoPbAg9.jpeg?v=1753112568",
        //lấy url ảnh hướng dẫn bảo quản gắn vào đây
      link: "/chua-mot-cot-lich-su-van-khan-cach-chuan-bi-le-vat-n161083.html",
      description:
        "Hướng dẫn bảo quản đồ lễ đúng cách từ Nhắc Nhớ Việt giúp giữ trọn vẹn tâm thành, ý nghĩa và chất lượng của lễ vật.",
    },

    {
      title: "Các câu hỏi thường gặp tại Nhắc Nhớ Việt",
      image:
        "https://pos.nvncdn.com/26fee5-146732/art/20241119_wTkFMKfg.jpeg?v=1732027881",
      link: "#",
      description:
        "Tổng hợp các câu hỏi thường gặp tại Nhắc Nhớ Việt. Tìm hiểu chi tiết về mâm lễ, phong tục và dịch vụ uy tín hàng đầu!",
    },

    {
      title: "Chính Sách Khách Hàng Thân Thiết tại Nhắc Nhớ Việt",
      image:
        "https://pos.nvncdn.com/26fee5-146732/art/20241119_wTkFMKfg.jpeg?v=1732027881",
      link: "/chinh-sach-khach-hang-than-thiet-tai-an-do-le-n149790.html",
      description:
        "Tích lũy Điểm Lộc vào Hũ Thần Tài tại Nhắc Nhớ Việt. Giảm giá trực tiếp và tận hưởng ưu đãi hấp dẫn cho khách hàng thân thiết.",
    },
    {
      title:
        "Chính Sách Vận Chuyển | Nhắc Nhớ Việt - Đồ Cúng Truyền Thống Việt Nam",
      image:
        "https://pos.nvncdn.com/26fee5-146732/art/20250810_R41X2r5J.png?v=1754837904",
      link: "/mam-cung-le-chua-tran-quoc-huong-dan-chi-tiet-cach-chuan-bi-dung-nghi-thuc-n162161.html",
      description:
        "Chính sách vận chuyển của Nhắc Nhớ Việt với đội ngũ shipper riêng, đóng gói chuyên nghiệp, hỗ trợ phí ship và giao hàng đúng giờ trên toàn quốc, đảm bảo đơn lễ hoàn hảo",
    },
    
    {
      title:
        "Chính sách bảo mật thông tin tại Nhắc Nhớ Việt",
      image:
        "https://pos.nvncdn.com/26fee5-146732/art/20250810_R41X2r5J.png?v=1754837904",
      link: "#",
      description:
        "Nhắc nhớ Việt cam kết bảo vệ thông tin khách hàng với chính sách bảo mật minh bạch, an toàn và hiện đại.",
    },
    {
      title: "Chính Sách Đổi Trả Mâm Lễ tại Nhắc Nhớ Việt",
      image:
        "https://pos.nvncdn.com/26fee5-146732/art/20250721_mkoPbAg9.jpeg?v=1753112568",
      link: "#",
      description:
        "Chính sách đổi/trả mâm lễ tại Nhắc Nhớ Việt hỗ trợ xử lý ngay lập tức, đảm bảo chất lượng và đúng thời gian cho nghi lễ của bạn. ",
    },
    {
      title: "Chính Sách Thanh Toán tại Nhắc Nhớ Việt",
      image:
        "https://pos.nvncdn.com/26fee5-146732/art/20241119_wTkFMKfg.jpeg?v=1732027881",
      link: "#",
      description:
        "Nhắc Nhớ Việt cung cấp chính sách thanh toán trực tuyến, đảm bảo minh bạch và an toàn tuyệt đối.",
    },
    {
      title:
        "Liên Hệ Nhắc Nhớ Việt, Đồ Cúng Tận Tâm",
      image:
        "https://pos.nvncdn.com/26fee5-146732/art/20250810_R41X2r5J.png?v=1754837904",
      link: "#",
      description:
        "Liên hệ Nhắc Nhớ Việt để nhận tư vấn và chuẩn bị mâm lễ cúng đầy đủ, giao hàng tận nơi, đảm bảo đúng phong tục. ",
    },
    
  ];



  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-20">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-center text-vietnam-green mb-16">
        Về Chúng Tôi
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {aboutUsItems.map((item, index) => (
          <article
            key={index}
            className="bg-white rounded-2xl shadow hover:shadow-lg transition duration-300 flex flex-col"
          >
            <a href={item.link} className="block overflow-hidden rounded-t-2xl">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full h-56 object-cover hover:scale-105 transition duration-300"
              />
            </a>
            <div className="flex flex-col flex-grow p-4">
              <h2 className="text-lg font-semibold text-vietnam-green hover:text-green-600 transition duration-200 mb-2">
                <a href={item.link}>{item.title}</a>
              </h2>
              <p className="text-gray-600 flex-grow">{item.description}</p>
              <a
                href={item.link}
                className="mt-3 inline-block text-vietnam-gold hover:text-yellow-600 font-medium"
              >
                <em>Xem thêm</em>
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AboutUs;
