import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ritualService } from "../services/ritualService";
import { formatSolarDate } from "../utils/dateUtils";
import { scrollToTop } from "../utils/scrollUtils";

const RitualDetail = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const [ritual, setRitual] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scrollToTop(true);
    fetchRitualDetail();
    // eslint-disable-next-line
  }, [id]);

  // Hàm gọi API chi tiết lễ hội
  const fetchRitualDetail = async () => {
    setLoading(true);
    try {
      const res = await ritualService.getRitualById(id);
      const data = res.data || res; // phòng trường hợp BE trả khác
      console.log("🎯 Chi tiết lễ hội:", data);
      setRitual(data);
    } catch (error) {
      console.error("❌ Lỗi khi tải chi tiết lễ hội:", error);
    } finally {
      setLoading(false);
    }
  };

  // Nếu đang loading thì hiển thị vòng xoay
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vietnam-red"></div>
      </div>
    );
  }

  // Nếu không tìm thấy dữ liệu
  if (!ritual) {
    return (
      <div className="text-center py-20 text-gray-600">
        Không tìm thấy thông tin lễ hội.
      </div>
    );
  }

  // Hàm xử lý hiển thị hình ảnh
  const getImageUrl = (imageUrl) => {
    if (!imageUrl)
      return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500";
    return imageUrl.startsWith("http")
      ? imageUrl
      : `https://isp-7jpp.onrender.com${imageUrl}`;
  };

  // Giao diện hiển thị chi tiết lễ hội
  return (
    <div className="min-h-screen bg-vietnam-cream py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Ảnh lễ hội */}
        <img
          src={getImageUrl(ritual.imageUrl)}
          alt={ritual.ritualName}
          className="w-full h-96 object-cover"
        />

        <div className="p-8">
          {/* Tên lễ hội */}
          <h1 className="text-4xl font-serif font-bold text-vietnam-red mb-4">
            {ritual.ritualName}
          </h1>

          {/* Thông tin nhanh */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-vietnam-cream p-4 rounded-lg shadow-inner">
              <h3 className="text-vietnam-red font-semibold">Vùng miền</h3>
              <p>{ritual.regionName}</p>
            </div>
            <div className="bg-vietnam-cream p-4 rounded-lg shadow-inner">
              <h3 className="text-vietnam-red font-semibold">Âm lịch</h3>
              <p>{ritual.dateLunar}</p>
            </div>
            <div className="bg-vietnam-cream p-4 rounded-lg shadow-inner">
              <h3 className="text-vietnam-red font-semibold">Dương lịch</h3>
              <p>{formatSolarDate(ritual.dateSolar)}</p>
            </div>
          </div>

          {/* Mô tả */}
          <h2 className="text-2xl font-serif font-semibold text-vietnam-gold mb-3">
            Mô tả
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
            {ritual.description || "Không có mô tả."}
          </p>

          {/* Ý nghĩa (nếu có) */}
          {ritual.meaning && (
            <>
              <h2 className="text-2xl font-serif font-semibold text-vietnam-gold mb-3">
                Ý nghĩa
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {ritual.meaning}
              </p>
            </>
          )}

          {/* Nút quay lại */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="bg-vietnam-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RitualDetail;
