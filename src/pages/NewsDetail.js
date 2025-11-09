import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const NewsDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // 新闻数据（可以从 API 或 props 获取）
  const newsItems = [
    {
      title: "Chính Sách Khách Hàng Thân Thiết tại AN Đồ Lễ",
      image:
        "https://pos.nvncdn.com/26fee5-146732/art/20241119_wTkFMKfg.jpeg?v=1732027881",
      link: "/chinh-sach-khach-hang-than-thiet-tai-an-do-le-n149790.html",
      fullLink: "https://andole.vn/chinh-sach-khach-hang-than-thiet-tai-an-do-le-n149790.html",
      description:
        "Tích lũy Điểm Lộc vào Hũ Thần Tài tại AN Đồ Lễ. Giảm giá trực tiếp và tận hưởng ưu đãi hấp dẫn cho khách hàng thân thiết.",
      content: `
        <h2>Chính Sách Khách Hàng Thân Thiết - AN Đồ Lễ, Đồ Cúng Tận Tâm</h2>
        <p>AN Đồ Lễ luôn trân trọng sự đồng hành của quý khách hàng. Với mong muốn tri ân và mang lại giá trị thiết thực, chúng tôi giới thiệu chương trình <strong>Hũ Thần Tài</strong> - chương trình khách hàng thân thiết độc đáo.</p>
        
        <h3>1. Tích Lũy Điểm Lộc</h3>
        <p>Mỗi đơn hàng của bạn sẽ được tích lũy <strong>Điểm Lộc</strong> vào Hũ Thần Tài:</p>
        <ul>
          <li>1.000 VNĐ = 1 Điểm Lộc</li>
          <li>Điểm Lộc không có thời hạn sử dụng</li>
          <li>Tích lũy không giới hạn</li>
        </ul>

        <h3>2. Quyền Lợi Đặc Biệt</h3>
        <p>Khi tích lũy đủ điểm, bạn có thể:</p>
        <ul>
          <li>Giảm giá trực tiếp trên đơn hàng tiếp theo</li>
          <li>Nhận ưu đãi đặc biệt trong các dịp lễ, Tết</li>
          <li>Được thông báo sớm về các chương trình khuyến mãi</li>
        </ul>

        <h3>3. Cách Sử Dụng</h3>
        <p>Điểm Lộc sẽ tự động được cộng vào tài khoản sau mỗi đơn hàng thành công. Bạn có thể kiểm tra số điểm hiện tại trong tài khoản của mình.</p>

        <h3>4. Bảo Mật Thông Tin</h3>
        <p>Chúng tôi cam kết bảo mật tuyệt đối thông tin khách hàng và không chia sẻ với bất kỳ bên thứ ba nào.</p>

        <h3>5. Hỗ Trợ Khách Hàng</h3>
        <p>Nếu quý khách có bất kỳ thắc mắc nào liên quan đến chương trình Hũ Thần Tài, vui lòng liên hệ:</p>
        <ul>
          <li><strong>Hotline:</strong> 0862 862 990 / 0904 727 885</li>
          <li><strong>Email:</strong> andoledocung@gmail.com</li>
          <li><strong>Website:</strong> andole.vn</li>
        </ul>
      `,
    },
    {
      title:
        "Mâm cúng lễ Chùa Trấn Quốc - Hướng dẫn chi tiết cách chuẩn bị đúng nghi thức",
      image:
        "https://pos.nvncdn.com/26fee5-146732/art/20250810_R41X2r5J.png?v=1754837904",
      link: "/mam-cung-le-chua-tran-quoc-huong-dan-chi-tiet-cach-chuan-bi-dung-nghi-thuc-n162161.html",
      fullLink: "https://andole.vn/mam-cung-le-chua-tran-quoc-huong-dan-chi-tiet-cach-chuan-bi-dung-nghi-thuc-n162161.html",
      description:
        "Mâm cúng lễ Chùa Trấn Quốc - Hướng dẫn chi tiết cách chuẩn bị đúng nghi thức.",
    },
    {
      title: "Chùa Một Cột - Lịch sử, văn khấn, cách chuẩn bị lễ vật",
      image:
        "https://pos.nvncdn.com/26fee5-146732/art/20250721_mkoPbAg9.jpeg?v=1753112568",
      link: "/chua-mot-cot-lich-su-van-khan-cach-chuan-bi-le-vat-n161083.html",
      fullLink: "https://andole.vn/chua-mot-cot-lich-su-van-khan-cach-chuan-bi-le-vat-n161083.html",
      description:
        "Chùa Một Cột - Nơi cầu bình an linh thiêng giữa lòng Hà Nội, gợi ý văn khấn & mâm lễ chuẩn chùa.",
    },
  ];

  useEffect(() => {
    // 从 location.state 获取传递的新闻数据
    if (location.state?.newsItem) {
      setNewsItem(location.state.newsItem);
      setLoading(false);
      return;
    }

    // 或者根据 slug 从列表中查找（去掉 .html 进行匹配）
    const slugWithoutHtml = slug.replace(/\.html$/, "");
    const found = newsItems.find(
      (item) => {
        const itemSlug = item.link.replace(/^\//, "").replace(/\.html$/, "");
        return itemSlug === slugWithoutHtml || item.link.includes(slugWithoutHtml);
      }
    );

    if (found) {
      setNewsItem(found);
    } else {
      // 如果没有找到，尝试从外部链接获取（添加 .html）
      const externalLink = `https://andole.vn/${slugWithoutHtml}.html`;
      setNewsItem({
        title: "Đang tải...",
        fullLink: externalLink,
        link: `/${slugWithoutHtml}`,
      });
    }

    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, location.state]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-gray-500">Đang tải thông tin bài viết...</div>
      </div>
    );
  }

  if (!newsItem || !newsItem.fullLink) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-red-500 mb-4">Không tìm thấy bài viết</div>
          <button
            onClick={() => navigate("/news")}
            className="px-4 py-2 bg-vietnam-green text-white rounded hover:bg-green-700"
          >
            Quay lại danh sách tin tức
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-white" style={{ margin: 0, padding: 0 }}>
      {/* 返回按钮 - 浮动在顶部 */}
      <button
        onClick={() => navigate("/news")}
        className="fixed top-20 left-4 z-50 px-4 py-2 bg-vietnam-green text-white rounded-lg shadow-lg hover:bg-green-700 flex items-center gap-2 transition"
        style={{ zIndex: 9999 }}
      >
        <span>&larr;</span> Quay lại
      </button>

      {/* 全屏 iframe - 隐藏 header 和 "Bài viết liên quan" 部分 */}
      <div
        style={{
          width: "100%",
          height: "calc(96vh - 64px)",
          marginTop: "70px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <iframe
          src={newsItem.fullLink}
          title={newsItem.title || "News Detail"}
          className="border-0"
          style={{
            width: "100%",
            height: "200vh", // 增加高度以便滚动
            margin: 0,
            padding: 0,
            transform: "translateY(-130px)", // 向上移动以隐藏 header
            pointerEvents: "auto",
          }}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
        />
        {/* 顶部遮罩 - 隐藏 header */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "130px",
            background: "white",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        {/* 底部遮罩 - 隐藏 "Bài viết liên quan" 及其下面的内容 */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "162px",
            background: "white",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      </div>
    </div>
  );
};

export default NewsDetail;

