import LoyalCustomerPolicy from "../pages/newsArticles/LoyalCustomerPolicy";
import TranQuocTempleGuide from "../pages/newsArticles/TranQuocTempleGuide";
import OnePillarPagoda from "../pages/newsArticles/OnePillarPagoda";

export const newsArticles = [
  {
    slug: "chinh-sach-khach-hang-than-thiet-tai-an-do-le",
    title: "Gợi ý mâm cơm cúng truyền thống kết hợp hiện đại cho mẹ đảm đang 'bí' ý tưởng cúng rằm",
    description:
      "Lên ý tưởng cho mâm cúng rằm đầy đủ hương vị truyền thống nhưng vẫn tiện lợi, dễ chuẩn bị cho gia đình bận rộn.",
    image: "/tin-tuc-1.jpg",
    category: "Mẹo Vặt",
    publishedAt: "2024-11-19",
    readingTime: "7 phút đọc",
    Content: LoyalCustomerPolicy,
  },
  {
    slug: "mam-cung-le-chua-tran-quoc-huong-dan-chi-tiet",
    title: "Mâm cúng lễ Chùa Trấn Quốc - Hướng dẫn chi tiết cách chuẩn bị đúng nghi thức",
    description:
      "Bí quyết chuẩn bị mâm lễ tươm tất, trang nghiêm khi hành lễ tại Chùa Trấn Quốc, ngôi cổ tự linh thiêng giữa lòng Hà Nội.",
    image: "/tin-tuc-2.jpg",
    category: "Cẩm nang lễ nghi",
    publishedAt: "2024-10-25",
    readingTime: "10 phút đọc",
    Content: TranQuocTempleGuide,
  },
  {
    slug: "chua-mot-cot-lich-su-van-khan-le-vat",
    title: "Chùa Một Cột - Lịch sử, văn khấn, cách chuẩn bị lễ vật",
    description:
      "Tìm hiểu ý nghĩa Chùa Một Cột và chuẩn bị lễ vật, văn khấn đúng chuẩn khi dâng lễ cầu bình an.",
    image: "/tin-tuc-3.jpg",
    category: "Văn hóa tâm linh",
    publishedAt: "2024-09-12",
    readingTime: "8 phút đọc",
    Content: OnePillarPagoda,
  },
];

export const findNewsBySlug = (slug) =>
  newsArticles.find((article) => article.slug === slug);


