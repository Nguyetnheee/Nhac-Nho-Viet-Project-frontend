import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ritualService } from "../services/ritualService";

// ✅ Sử dụng environment variable thay vì hardcode
const BACKEND_BASE = process.env.REACT_APP_API_URL || "https://isp-7jpp.onrender.com";

const getImageUrl = (url) =>
  url
    ? url.startsWith("http")
      ? url
      : `${BACKEND_BASE}${url}`
    : "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600";

const REGION_KEY_TO_PARAM = {
  north: "north",
  central: "central",
  south: "south",
  all: "all",
};

const Home = () => {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");

  // Carousel state
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const startXRef = useRef(0);
  const autoTimerRef = useRef(null);

  /** Lấy ảnh từ API */
  useEffect(() => {
    (async () => {
      try {
        const data = await ritualService.getAllRituals();
        const urls = Array.isArray(data)
          ? Array.from(
              new Set(
                data.map((r) => getImageUrl(r.imageUrl)).filter(Boolean)
              )
            ).slice(0, 10)
          : [];
        setImages(urls.length ? urls : [getImageUrl(null)]);
      } catch {
        setImages([getImageUrl(null)]);
      }
    })();
  }, []);

  /** Tự động đổi ảnh: 3 giây/slide */
  useEffect(() => {
    if (images.length <= 1) return;
    startAuto();
    return stopAuto;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, index]);

  const startAuto = () => {
    stopAuto();
    autoTimerRef.current = setInterval(() => {
      goTo(index + 1);
    }, 3000); // 3 giây mỗi slide
  };
  const stopAuto = () => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
  };

  /** Helpers */
  const clampIndex = (i) => {
    const n = images.length;
    if (n === 0) return 0;
    return ((i % n) + n) % n;
  };
  const goTo = (i) => setIndex(clampIndex(i));

  /** Swipe/Drag */
  const onTouchStart = (e) => {
    if (!images.length) return;
    stopAuto();
    setIsDragging(true);
    setDragX(0);
    startXRef.current = e.touches ? e.touches[0].clientX : e.clientX;
  };
  const onTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setDragX(x - startXRef.current);
  };
  const onTouchEnd = () => {
    if (!isDragging) return;
    const threshold = 60; // kéo >60px mới chuyển
    if (dragX <= -threshold) goTo(index + 1);
    else if (dragX >= threshold) goTo(index - 1);
    setIsDragging(false);
    setDragX(0);
    startAuto();
  };

  /** Phím mũi tên */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length]);

  /** Search + Region */
  const handleSearch = (e) => {
    e.preventDefault();
    const q = term.trim().toLowerCase();
    if (!q) return;
    navigate(`/rituals?q=${encodeURIComponent(q)}`);
  };
  const goRegion = (key) => {
    if (key === "all") navigate(`/rituals`);
    else navigate(`/rituals?regions=${REGION_KEY_TO_PARAM[key]}`);
  };

  /** Transform cho track (khi drag thì bỏ transition) */
  const trackStyle = {
    transform: `translateX(calc(${-index * 100}% + ${dragX}px))`,
    transition: isDragging ? "none" : "transform 0.8s ease-in-out",
  };

  return (
    <div className="min-h-screen font-inter">
      {/* HERO: cao vừa mắt, tự căn giữa, không full trang */}
      <section
        className="relative min-h-[65vh] md:min-h-[70vh] text-white overflow-hidden flex items-center justify-center"
        onMouseEnter={stopAuto}
        onMouseLeave={startAuto}
        onMouseDown={onTouchStart}
        onMouseMove={onTouchMove}
        onMouseUp={onTouchEnd}
        onMouseLeaveCapture={onTouchEnd}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Track ảnh */}
        <div className="absolute inset-0 h-full flex" style={trackStyle}>
          {images.map((src, i) => (
            <div key={i} className="w-full h-full flex-shrink-0 relative">
              <img
                src={src}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
              {/* Overlay nhẹ cho chữ dễ đọc, ảnh vẫn rõ */}
              <div className="absolute inset-0 bg-[#0d3b36]/40" />
            </div>
          ))}
        </div>

        {/* Nội dung foreground */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-serif font-extrabold mb-4 tracking-tight drop-shadow-[0_3px_10px_rgba(0,0,0,0.5)]">
            Nhắc Nhớ Việt
          </h1>
          <p className="text-xl md:text-3xl mb-10 text-gray-100 font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            Tra cứu lễ hội truyền thống và đặt mâm cúng Việt Nam
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-3xl w-full mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 shadow-2xl rounded-xl p-2 bg-white/20 backdrop-blur-sm border border-white/30">
              <input
                type="text"
                placeholder="Nhập tên lễ để tìm kiếm..."
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-vietnam-gold/70 transition duration-300 shadow-inner"
              />
              <button
                type="submit"
                className="bg-vietnam-gold text-vietnam-green px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-600 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-vietnam-gold/50"
              >
                Tìm kiếm
              </button>
            </div>
          </form>

         

          {/* Dots */}
          {images.length > 1 && (
            <div className="mt-6 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-2.5 h-2.5 rounded-full transition ${
                    i === index ? "bg-white scale-110" : "bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Arrows (desktop) */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => goTo(index - 1)}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-black/35 hover:bg-black/55 text-white w-11 h-11 rounded-full items-center justify-center"
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              onClick={() => goTo(index + 1)}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-black/35 hover:bg-black/55 text-white w-11 h-11 rounded-full items-center justify-center"
              aria-label="Next"
            >
              ›
            </button>
          </>
        )}
      </section>

      {/* Section phụ */}
      <section className="py-16 text-center bg-vietnam-cream">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-semibold text-vietnam-green mb-4">Khám phá nhanh</h2>
          <p className="text-gray-700">
            Sử dụng ô tìm kiếm hoặc chọn vùng miền để bắt đầu tra cứu các nghi lễ truyền thống.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
