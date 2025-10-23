import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ritualService } from "../services/ritualService";
import { scrollToTop } from "../utils/scrollUtils";

/* =========================
   Cấu hình vùng miền (UI ↔ API)
   ========================= */
const REGION_OPTIONS = [
  { key: "all", label: "Toàn Quốc" }, // không lọc
  { key: "north", label: "Miền Bắc", api: "Miền Bắc" },
  { key: "central", label: "Miền Trung", api: "Miền Trung" },
  { key: "south", label: "Miền Nam", api: "Miền Nam" },
];

/* Ảnh fallback + build absolute URL nếu BE trả đường tương đối */
const BACKEND_BASE = "https://isp-7jpp.onrender.com";
const getImageUrl = (url) =>
  url
    ? url.startsWith("http")
      ? url
      : `${BACKEND_BASE}${url}`
    : "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500";

const Home = () => {
  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI filter: tập key vùng đã chọn (mặc định "all")
  const [selectedKeys, setSelectedKeys] = useState(new Set(["all"]));

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  /* Lần đầu vào: lấy tất cả */
  useEffect(() => {
    initialFetch();
    scrollToTop(true);
  }, []);

  const initialFetch = async () => {
    setLoading(true);
    try {
      const data = await ritualService.getAllRituals();
      setRituals(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching all rituals:", e);
      setRituals([]);
    } finally {
      setLoading(false);
    }
  };

  /* Toggle chọn vùng */
  const toggleRegion = (key) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (key === "all") {
        return new Set(["all"]); // chọn "Toàn Quốc" → bỏ các key khác
      }
      if (next.has("all")) next.delete("all"); // bỏ "all" nếu đang bật
      if (next.has(key)) next.delete(key);
      else next.add(key);
      // nếu không còn gì → quay lại "all"
      if (next.size === 0) return new Set(["all"]);
      return next;
    });
  };

  /* Áp dụng bộ lọc */
  const applyFilter = async () => {
    // Nếu đang chọn "Toàn Quốc" → load tất cả
    if (selectedKeys.has("all")) {
      initialFetch();
      return;
    }

    setLoading(true);
    try {
      // Lấy danh sách tên vùng miền đúng yêu cầu BE
      const regionNames = REGION_OPTIONS
        .filter((opt) => opt.api && selectedKeys.has(opt.key))
        .map((opt) => opt.api);

      // Gọi BE (trả về page, đọc content)
      const { content } = await ritualService.filterRitualsByRegions(
        regionNames,
        0,
        100
      );

      // Lọc lại ở FE để chắc chắn chỉ còn các vùng đã chọn
      const selectedSet = new Set(regionNames);
      const filtered = Array.isArray(content)
        ? content.filter((item) => selectedSet.has(item.regionName))
        : [];

      setRituals(filtered);
    } catch (e) {
      console.error("Error filtering rituals:", e);
      setRituals([]);
    } finally {
      setLoading(false);
    }
  };

  /* Search chuyển trang như cũ */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/rituals?search=${encodeURIComponent(
        searchTerm
      )}`;
    }
  };

  const isActive = (key) => selectedKeys.has(key);

  return (
    <div className="min-h-screen">
      {/* ================= Hero ================= */}
      <section className="bg-gradient-to-r from-vietnam-red to-red-800 text-white py-20 ritual-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Nhắc Nhớ Việt
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Tra cứu lễ hội truyền thống và đặt mâm cúng Việt Nam
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Tìm kiếm lễ hội theo tên hoặc ngày..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-vietnam-gold"
              />
              <button
                type="submit"
                className="bg-vietnam-gold text-vietnam-red px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-600 transition-colors"
              >
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ============== Filter Bar (STICKY, sát mép trên) ============== */}
      <section
        className="
          sticky top-0
          z-40
          bg-white/90 backdrop-blur
          border-b shadow-sm
        "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* 4 nút vùng miền */}
            <div className="flex flex-1 flex-wrap gap-2">
              {REGION_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => toggleRegion(opt.key)}
                  className={[
                    "px-4 py-2 rounded-lg border transition",
                    isActive(opt.key)
                      ? "bg-vietnam-green text-white border-vietnam-green"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Nút áp dụng */}
            <div className="md:ml-auto">
              <button
                onClick={applyFilter}
                disabled={loading}
                className={[
                  "px-5 py-2 rounded-lg font-semibold transition",
                  loading
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-vietnam-gold text-vietnam-red hover:bg-yellow-600",
                ].join(" ")}
              >
                {loading ? "Đang lọc..." : "Áp dụng bộ lọc"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Danh sách nghi lễ ================= */}
      <section className="py-16 bg-vietnam-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-vietnam-red mb-2">
              Các nghi lễ truyền thống
            </h2>
            <p className="text-lg text-gray-600">
              Chọn vùng miền rồi bấm “Áp dụng bộ lọc” để xem kết quả phù hợp
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vietnam-red"></div>
            </div>
          ) : rituals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {rituals.map((ritual) => (
                <div
                  key={ritual.ritualId}
                  className="card hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="card-content">
                    <div className="aspect-w-16 aspect-h-9 mb-4">
                      <img
                        src={getImageUrl(ritual.imageUrl)}
                        alt={ritual.ritualName}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                    <div className="card-body">
                      <h3 className="text-xl font-serif font-semibold text-vietnam-red mb-2">
                        {ritual.ritualName}
                      </h3>
                      <div className="text-sm text-gray-600 mb-3">
                        <p>Vùng miền: {ritual.regionName}</p>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {ritual.description || ritual.meaning}
                      </p>
                    </div>
                    <div className="card-footer">
                      <Link
                        to={`/rituals/${ritual.ritualId}`}
                        className="btn-primary w-full text-center block"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              Không có nghi lễ nào phù hợp bộ lọc.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
