/* eslint-disable react-hooks/exhaustive-deps */
// import React, { useState, useEffect, useMemo } from 'react';

// const News = () => {
//   const [newsItems, setNewsItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);

//   const ITEMS_PER_PAGE = 6;

//   useEffect(() => {
//     const fetchNews = async () => {
//       try {
//         const response = await fetch('/api/news'); // API 
//         if (!response.ok) throw new Error('Không tải được dữ liệu.');
//         const data = await response.json();
//         setNewsItems(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchNews();
//   }, []);

//   const totalPages = Math.ceil(newsItems.length / ITEMS_PER_PAGE);

//   const paginatedNews = useMemo(() => {
//     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//     return newsItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
//   }, [newsItems, currentPage]);

//   const changePage = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const Pagination = () => {
//     const pages = [];
//     for (let i = 1; i <= totalPages; i++) pages.push(i);
//     return (
//       <nav className="flex justify-center mt-8" aria-label="Pagination">
//         <ul className="flex gap-2">
//           <li>
//             <button
//               disabled={currentPage === 1}
//               onClick={() => changePage(currentPage - 1)}
//               className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
//             >
//               &laquo;
//             </button>
//           </li>
//           {pages.map((page) => (
//             <li key={page}>
//               <button
//                 onClick={() => changePage(page)}
//                 className={`px-3 py-1 rounded-full ${
//                   currentPage === page
//                     ? 'bg-green-600 text-white font-bold'
//                     : 'bg-white border border-gray-300 hover:bg-gray-100'
//                 }`}
//               >
//                 {page}
//               </button>
//             </li>
//           ))}
//           <li>
//             <button
//               disabled={currentPage === totalPages}
//               onClick={() => changePage(currentPage + 1)}
//               className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
//             >
//               &raquo;
//             </button>
//           </li>
//         </ul>
//       </nav>
//     );
//   };


//   if (loading)
//     return (
//       <div className="text-center py-10 text-gray-500">
//         Đang tải danh sách bài viết...
//       </div>
//     );

//   if (error)
//     return (
//       <div className="text-center py-10 text-red-500">
//         Không tải được danh sách bài viết. Vui lòng thử lại sau.
//       </div>
//     );

//   if (newsItems.length === 0)
//     return (
//       <div className="text-center py-10 text-gray-500">
//         Hiện chưa có bài viết nào.
//       </div>
//     );

//   return (
//     <div className="max-w-6xl mx-auto py-8">
//       <h2 className="text-2xl font-bold mb-6 text-green-700">Tin tức mới nhất</h2>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {paginatedNews.map((item) => (
//           <article key={item.id} className="border rounded-lg shadow-sm hover:shadow-md transition">
//             <img
//               src={item.image}
//               alt={item.title}
//               className="w-full h-48 object-cover rounded-t-lg"
//             />
//             <div className="p-4">
//               <h3 className="text-lg font-semibold text-green-700 mb-2">
//                 {item.title}
//               </h3>
//               <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
//             </div>
//           </article>
//         ))}
//       </div>

//       {newsItems.length > ITEMS_PER_PAGE && <Pagination />}
//     </div>
//   );
// };

// export default News;


import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const News = () => {
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const newsItems = [
    {
      title: "Chính Sách Khách Hàng Thân Thiết tại AN Đồ Lễ",
      image:
        "public/Gioi-thieu-poster.jpg",
      link: "/chinh-sach-khach-hang-than-thiet-tai-an-do-le-n149790.html",
      fullLink: "https://andole.vn/chinh-sach-khach-hang-than-thiet-tai-an-do-le-n149790.html",
      description:
        "Tích lũy Điểm Lộc vào Hũ Thần Tài tại AN Đồ Lễ. Giảm giá trực tiếp và tận hưởng ưu đãi hấp dẫn cho khách hàng thân thiết.",
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

   {
      title: "Chính Sách Khách Hàng Thân Thiết tại AN Đồ Lễ",
      image:
        "https://pos.nvncdn.com/26fee5-146732/art/20241119_wTkFMKfg.jpeg?v=1732027881",
      link: "/chinh-sach-khach-hang-than-thiet-tai-an-do-le-n149790.html",
      fullLink: "https://andole.vn/chinh-sach-khach-hang-than-thiet-tai-an-do-le-n149790.html",
      description:
        "Tích lũy Điểm Lộc vào Hũ Thần Tài tại AN Đồ Lễ. Giảm giá trực tiếp và tận hưởng ưu đãi hấp dẫn cho khách hàng thân thiết.",
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
{
      title: "Chính Sách Khách Hàng Thân Thiết tại AN Đồ Lễ",
      image:
        "https://pos.nvncdn.com/26fee5-146732/art/20241119_wTkFMKfg.jpeg?v=1732027881",
      link: "/chinh-sach-khach-hang-than-thiet-tai-an-do-le-n149790.html",
      fullLink: "https://andole.vn/chinh-sach-khach-hang-than-thiet-tai-an-do-le-n149790.html",
      description:
        "Tích lũy Điểm Lộc vào Hũ Thần Tài tại AN Đồ Lễ. Giảm giá trực tiếp và tận hưởng ưu đãi hấp dẫn cho khách hàng thân thiết.",
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

    {
      title: "Chính Sách Khách Hàng Thân Thiết tại AN Đồ Lễ",
      image:
        "https://pos.nvncdn.com/26fee5-146732/art/20241119_wTkFMKfg.jpeg?v=1732027881",
      link: "/chinh-sach-khach-hang-than-thiet-tai-an-do-le-n149790.html",
      fullLink: "https://andole.vn/chinh-sach-khach-hang-than-thiet-tai-an-do-le-n149790.html",
      description:
        "Tích lũy Điểm Lộc vào Hũ Thần Tài tại AN Đồ Lễ. Giảm giá trực tiếp và tận hưởng ưu đãi hấp dẫn cho khách hàng thân thiết.",
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


  const totalPages = Math.ceil(newsItems.length / ITEMS_PER_PAGE);

  const paginatedNews = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return newsItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [newsItems, currentPage]);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const Pagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);

    return (
      <nav className="flex justify-center mt-10" aria-label="Pagination">
        <ul className="flex list-style-none">
          <li
            className={`page-item ${
              currentPage === 1 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <button
              onClick={() => changePage(currentPage - 1)}
              className="page-link py-1.5 px-3 rounded border-0 bg-transparent text-gray-800 hover:text-vietnam-green transition"
              aria-label="Previous"
            >
              &laquo;
            </button>
          </li>

          {pages.map((page) => (
            <li key={page} className="page-item">
              <button
                onClick={() => changePage(page)}
                className={`px-3 py-1.5 mx-1 rounded-full text-sm font-medium transition ${
                  currentPage === page
                    ? "bg-vietnam-green text-white font-bold"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${
              currentPage === totalPages ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <button
              onClick={() => changePage(currentPage + 1)}
              className="page-link py-1.5 px-3 rounded border-0 bg-transparent text-gray-800 hover:text-vietnam-green transition"
              aria-label="Next"
            >
              &raquo;
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-20">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-center text-vietnam-green mb-16">
        Tin Tức & Bài viết
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {paginatedNews.map((item, index) => {
          const handleClick = (e) => {
            e.preventDefault();
            // 提取 slug 从 link (去掉开头的 / 和 .html)
            const slug = item.link.replace(/^\//, "").replace(/\.html$/, "");
            navigate(`/news/${slug}`, {
              state: { newsItem: item },
            });
          };

          return (
            <article
              key={index}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition duration-300 flex flex-col cursor-pointer"
              onClick={handleClick}
            >
              <div className="block overflow-hidden rounded-t-2xl">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-56 object-cover hover:scale-105 transition duration-300"
                />
              </div>
              <div className="flex flex-col flex-grow p-4">
                <h2 className="text-lg font-semibold text-vietnam-green hover:text-green-800 transition duration-200 mb-2">
                  {item.title}
                </h2>
                <p className="text-gray-600 flex-grow">{item.description}</p>
                <div className="mt-3 inline-block text-vietnam-gold hover:text-yellow-600 font-medium">
                  <em>Xem thêm</em>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Thanh phân trang */}
      {newsItems.length > ITEMS_PER_PAGE && <Pagination />}
    </div>
  );
};

export default News;
