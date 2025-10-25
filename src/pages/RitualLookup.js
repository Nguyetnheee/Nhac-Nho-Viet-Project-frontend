// src/pages/RitualLookup.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ritualService } from "../services/ritualService";
import { scrollToTop } from "../utils/scrollUtils";

/* Cấu hình vùng miền */
const REGION_OPTIONS = [
  { key: "all", label: "Toàn Quốc" },
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

// Component Skeleton Loading cho Card
const RitualCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse h-full"> {/* 💄 UI Enhanced: h-full cho Skeleton */}
    <div className="w-full h-56 bg-gray-200"></div>
    <div className="p-6 flex flex-col flex-grow"> {/* 💄 UI Enhanced: flex-col, flex-grow cho Skeleton content */}
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-2 flex-grow">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="mt-5 h-10 bg-gray-300 rounded-lg"></div>
    </div>
  </div>
);

// 💄 UI Enhanced: Thêm hiệu ứng chuyển động (motion) cho trang
const RitualLookup = () => {
  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedKeys, setSelectedKeys] = useState(new Set(["all"]));
  const [searchTerm, setSearchTerm] = useState("");
  const [lastQuery, setLastQuery] = useState("");

  useEffect(() => {
    initialFetch();
    scrollToTop(true);
  }, []);

  const initialFetch = async () => {
    setLoading(true);
    try {
      const data = await ritualService.getAllRituals();
      setRituals(Array.isArray(data) ? data : []);
      setLastQuery("");
    } catch (e) {
      console.error("Error fetching all rituals:", e);
      setRituals([]);
    } finally {
      // Giữ loading 300ms để hiển thị skeleton mượt hơn (Hiệu ứng chuyên nghiệp)
      setTimeout(() => setLoading(false), 300); 
    }
  };

  const toggleRegion = (key) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (key === "all") return new Set(["all"]);
      if (next.has("all")) next.delete("all");
      next.has(key) ? next.delete(key) : next.add(key);
      if (next.size === 0) return new Set(["all"]);
      return next;
    });
  };

  const applyFilter = async () => {
    if (selectedKeys.has("all")) {
      initialFetch();
      return;
    }
    setLoading(true);
    try {
      const regionNames = REGION_OPTIONS
        .filter((opt) => opt.api && selectedKeys.has(opt.key))
        .map((opt) => opt.api);

      const { content } = await ritualService.filterRitualsByRegions(
        regionNames,
        0,
        100
      );

      const selectedSet = new Set(regionNames);
      const filtered = Array.isArray(content)
        ? content.filter((item) => selectedSet.has(item.regionName))
        : [];

      setRituals(filtered);
      setLastQuery("");
    } catch (e) {
      console.error("Error filtering rituals:", e);
      setRituals([]);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) {
      initialFetch();
      return;
    }
    setLoading(true);
    try {
      const results = await ritualService.searchRituals(q);
      setRituals(Array.isArray(results) ? results : []);
      setLastQuery(q);
      setSelectedKeys(new Set(["all"]));
    } catch (err) {
      console.error("Search rituals error:", err);
      setRituals([]);
      setLastQuery(q);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setLastQuery("");
    initialFetch();
  };

  const isActive = (key) => selectedKeys.has(key);

  return (
    <div className="min-h-screen font-inter">
      {/* Hero */}
      <section className="bg-gradient-to-br from-vietnam-red to-red-900 text-white py-24 md:py-32 ritual-pattern shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-extrabold mb-4 tracking-tight">
            Nhắc Nhớ Việt
          </h1>
          <p className="text-xl md:text-3xl mb-10 text-gray-200 font-light">
            Tra cứu lễ hội truyền thống và đặt mâm cúng Việt Nam
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 shadow-2xl rounded-xl p-2 bg-white/10 backdrop-blur-sm border border-white/20">
              <input
                type="text"
                placeholder="Nhập tên lễ để tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                // 💄 UI Enhanced: Focus ring custom
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-vietnam-gold/70 transition duration-300 shadow-inner" 
              />
              <div className="flex gap-2 justify-center flex-shrink-0">
                <button
                  type="submit"
                  className="bg-vietnam-gold text-vietnam-red px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-600 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-vietnam-gold/50" // 💄 UI Enhanced: Focus ring custom
                >
                  Tìm kiếm
                </button>
                {lastQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="bg-vietnam-green text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-800 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-vietnam-green/50" // 💄 UI Enhanced: Focus ring custom
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
            {lastQuery && (
              <p className="mt-4 text-sm text-gray-200 drop-shadow-md">
                Kết quả cho: <span className="font-bold text-vietnam-gold">“{lastQuery}”</span>
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Filter Bar (sticky) */}
      <section className="sticky top-0 z-40 bg-vietnam-cream/95 backdrop-blur-sm border-b-4 border-vietnam-gold shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="flex flex-1 flex-wrap gap-3">
              {REGION_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => toggleRegion(opt.key)}
                  className={[
                    "px-5 py-2.5 rounded-full font-medium transition duration-300 transform hover:scale-[1.05] border-2 focus:outline-none focus:ring-4 focus:ring-offset-2", // 💄 UI Enhanced: Focus ring offset
                    isActive(opt.key)
                      ? "bg-vietnam-green text-white border-vietnam-green shadow-lg focus:ring-vietnam-green/50"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-vietnam-green/50 shadow-sm focus:ring-gray-300",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="md:ml-auto flex-shrink-0">
              <button
                onClick={applyFilter}
                disabled={loading}
                className={[
                  "px-6 py-2.5 rounded-lg font-bold transition duration-300 transform hover:scale-[1.03] shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-vietnam-gold/50", // 💄 UI Enhanced: Focus ring offset
                  loading
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed opacity-75"
                    : "bg-vietnam-gold text-vietnam-red hover:bg-yellow-600",
                ].join(" ")}
              >
                {loading ? "Đang xử lý..." : "Áp dụng bộ lọc"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-20 bg-vietnam-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-vietnam-red mb-3">
              Các nghi lễ truyền thống
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Chọn vùng miền hoặc tìm kiếm theo tên lễ để xem kết quả phù hợp
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
            {loading ? (
              // Hiển thị Skeleton Loading
              [...Array(8)].map((_, index) => (
                <RitualCardSkeleton key={index} />
              ))
            ) : rituals.length > 0 ? (
              rituals.map((ritual, index) => (
                <div
                  key={ritual.ritualId}
                  // 💄 UI Enhanced: Thêm h-full và flex-col để card có chiều cao bằng nhau
                  className={`bg-white rounded-2xl overflow-hidden shadow-xl transition-all duration-500 transform hover:shadow-2xl hover:-translate-y-1 opacity-0 animate-fadeIn h-full flex flex-col`}
                  style={{ animationDelay: `${index * 0.05}s` }} // Delay cho từng item
                >
                  <div className="card-content flex flex-col flex-grow">
                    <div className="aspect-w-16 aspect-h-9 flex-shrink-0">
                      <img
                        src={getImageUrl(ritual.imageUrl)}
                        alt={ritual.ritualName}
                        className="w-full h-56 object-cover"
                      />
                    </div>
                    {/* 💄 UI Enhanced: Thêm flex-grow để body lấp đầy không gian */}
                    <div className="card-body p-6 flex flex-col flex-grow">
                      <h3 className="text-2xl font-serif font-bold text-vietnam-red mb-3 leading-snug flex-shrink-0">
                        {ritual.ritualName}
                      </h3>
                      <div className="text-base text-gray-600 mb-4 flex items-center flex-shrink-0">
                        <svg className="w-4 h-4 mr-2 text-vietnam-green" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path></svg>
                        <p>Vùng miền: <span className="font-semibold">{ritual.regionName}</span></p>
                      </div>
                      <p className="text-gray-700 mb-5 line-clamp-4 text-sm flex-grow"> {/* 💄 UI Enhanced: flex-grow cho description */}
                        {ritual.description || ritual.meaning}
                      </p>
                    </div>
                    <div className="card-footer p-4 border-t border-gray-100 flex-shrink-0">
                      <Link
                        to={`/rituals/${ritual.ritualId}`}
                        className="bg-vietnam-red text-white px-5 py-2.5 rounded-lg font-semibold text-center block transition duration-300 hover:bg-red-800 hover:shadow-lg transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-vietnam-red/50"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-xl text-gray-500 py-10">
                {lastQuery
                  ? <p>🤷‍♀️ Không có nghi lễ nào khớp với từ khóa <span className="font-semibold text-vietnam-red">“{lastQuery}”</span>.</p>
                  : "😔 Không có nghi lễ nào phù hợp bộ lọc đã chọn."}
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* 💄 UI Enhanced: Thêm style cho hiệu ứng fadeIn */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default RitualLookup;