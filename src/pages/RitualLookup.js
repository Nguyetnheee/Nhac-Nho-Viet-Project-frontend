// src/pages/RitualLookup.js
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
  <div className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse h-full">
    <div className="w-full h-56 bg-gray-200"></div>
    <div className="p-6 flex flex-col flex-grow">
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

const RitualLookup = () => {
  const location = useLocation();

  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedKeys, setSelectedKeys] = useState(new Set(["all"]));
  const [searchTerm, setSearchTerm] = useState("");   // (giữ lại để phòng sau này thêm ô search compact)
  const [lastQuery, setLastQuery] = useState("");

  // Đọc query params mỗi khi URL đổi
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = (params.get("q") || "").trim();
    const regionsParam = (params.get("regions") || "").trim(); // ví dụ: "north,central"

    // Ưu tiên search nếu có q
    if (q) {
      doSearch(q);
      return;
    }

    // Nếu có regions
    if (regionsParam) {
      const keys = regionsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (keys.length) {
        setSelectedKeys(new Set(keys));
        applyFilter(keys);
        return;
      }
    }

    // Mặc định: tải tất cả
    initialFetch();
    scrollToTop(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

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

  // Áp bộ lọc theo "keys" truyền vào (để dùng được cho query param)
  const applyFilter = async (keysArg) => {
    const keys = Array.isArray(keysArg) ? keysArg : Array.from(selectedKeys);

    if (keys.includes("all")) {
      initialFetch();
      return;
    }

    setLoading(true);
    try {
      const regionNames = REGION_OPTIONS
        .filter((opt) => opt.api && keys.includes(opt.key))
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

  // Hàm search có thể gọi từ query param
  const doSearch = async (q) => {
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
      {/* Filter Bar (sticky) */}
      <section className="sticky top-0 z-40 bg-vietnam-cream/95 backdrop-blur-sm border-b-4 border-vietnam-gold shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            {/* Cụm nút vùng miền (trái) */}
            <div className="flex flex-1 flex-wrap gap-3">
              {REGION_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => toggleRegion(opt.key)}
                  className={[
                    "px-5 py-2.5 rounded-full font-medium transition duration-300 transform hover:scale-[1.05] border-2 focus:outline-none focus:ring-4 focus:ring-offset-2",
                    isActive(opt.key)
                      ? "bg-vietnam-green text-white border-vietnam-green shadow-lg focus:ring-vietnam-green/50"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-vietnam-green/50 shadow-sm focus:ring-gray-300",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Ô search gọn (phải) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = String(searchTerm || "").trim();
                if (!q) return;
                // Dùng hàm doSearch sẵn có
                doSearch(q);
              }}
              className="w-full md:w-auto flex items-center gap-2"
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm lễ..."
                  className="w-[260px] md:w-[280px] lg:w-[320px] px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-4 focus:ring-vietnam-gold/40 focus:border-transparent"
                />
                {/* nút clear nhanh */}
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      clearSearch();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear"
                    title="Xóa tìm kiếm"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className={[
                  "px-4 py-2.5 rounded-lg font-bold transition duration-300 transform hover:scale-[1.03] shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-vietnam-gold/50",
                  loading
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed opacity-75"
                    : "bg-vietnam-gold text-vietnam-red hover:bg-yellow-600",
                ].join(" ")}
              >
                Tìm
              </button>
              <button
                type="button"
                onClick={() => applyFilter()}
                disabled={loading}
                className={[
                  "hidden md:inline-block px-4 py-2.5 rounded-lg font-bold transition duration-300 transform hover:scale-[1.03] shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-vietnam-gold/50",
                  loading
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed opacity-75"
                    : "bg-white text-vietnam-red border border-vietnam-gold hover:bg-yellow-50",
                ].join(" ")}
                title="Áp dụng bộ lọc vùng miền"
              >
                Lọc
              </button>
            </form>
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
              Chọn vùng miền hoặc tìm kiếm từ Trang chủ để xem kết quả phù hợp
            </p>
            {lastQuery && (
              <p className="mt-3 text-sm text-gray-500">
                Kết quả cho: <span className="font-semibold text-vietnam-red">“{lastQuery}”</span>{" "}
                <button onClick={clearSearch} className="underline ml-1">Xóa</button>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 md:gap-10">
            {loading ? (
              [...Array(8)].map((_, index) => <RitualCardSkeleton key={index} />)
            ) : rituals.length > 0 ? (
              rituals.map((ritual, index) => (
                <div
                  key={ritual.ritualId}
                  className="bg-white rounded-2xl overflow-hidden shadow-xl transition-all duration-500 transform hover:shadow-2xl hover:-translate-y-1 opacity-0 animate-fadeIn h-full flex flex-col"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="card-content flex flex-col flex-grow">
                    <div className="aspect-w-16 aspect-h-9 flex-shrink-0">
                      <img
                        src={getImageUrl(ritual.imageUrl)}
                        alt={ritual.ritualName}
                        className="w-full h-56 object-cover"
                      />
                    </div>
                    <div className="card-body p-6 flex flex-col flex-grow">
                      <h3 className="text-2xl font-serif font-bold text-vietnam-red mb-3 leading-snug flex-shrink-0">
                        {ritual.ritualName}
                      </h3>
                      <div className="text-base text-gray-600 mb-4 flex items-center flex-shrink-0">
                        <svg className="w-4 h-4 mr-2 text-vietnam-green" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path></svg>
                        <p>Vùng miền: <span className="font-semibold">{ritual.regionName}</span></p>
                      </div>
                      <p className="text-gray-700 mb-5 line-clamp-4 text-sm flex-grow">
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

      {/* fadeIn */}
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
