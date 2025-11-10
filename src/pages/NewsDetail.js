import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { findNewsBySlug } from "../data/newsArticles";

const NewsDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const newsItem = findNewsBySlug(slug);

  if (!newsItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-4">
            Không tìm thấy bài viết
          </h2>
          <p className="text-gray-600 mb-6">
            Bài viết bạn truy cập hiện không tồn tại hoặc đã được cập nhật lại
            đường dẫn.
          </p>
          <button
            onClick={() => navigate("/news")}
            className="px-6 py-2 bg-vietnam-green text-white rounded-lg hover:bg-green-700 transition"
          >
            Quay lại trang tin tức
          </button>
        </div>
      </div>
    );
  }

  const ArticleContent = newsItem.Content;

  return (
    <div className="min-h-screen bg-gray-100 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/news")}
          className="mb-6 inline-flex items-center gap-2 text-vietnam-green hover:text-green-800 transition"
        >
          <span className="text-lg">&larr;</span> Quay lại danh sách bài viết
        </button>

        <article className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="h-72 md:h-96 overflow-hidden">
            <img
              src={newsItem.image}
              alt={newsItem.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 md:p-12">
            <span className="text-sm uppercase tracking-wide text-vietnam-gold font-semibold">
              {newsItem.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 my-4">
              {newsItem.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-8">
              <span>
                {new Date(newsItem.publishedAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
              <span>•</span>
              <span>{newsItem.readingTime}</span>
            </div>

            <ArticleContent />
          </div>
        </article>
      </div>
    </div>
  );
};

export default NewsDetail;

