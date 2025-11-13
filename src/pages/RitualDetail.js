// src/pages/RitualDetail.js
import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ritualService } from "../services/ritualService";
import { checklistService } from "../services/checklistService";
import { trayService } from "../services/trayService";
import { scrollToTop } from "../utils/scrollUtils";

// ✅ Sử dụng environment variable thay vì hardcode
const BACKEND_BASE = process.env.REACT_APP_API_URL || "https://isp-7jpp.onrender.com";

// helper ảnh BE
const getImageUrl = (url) =>
  url
    ? url.startsWith("http")
      ? url
      : `${BACKEND_BASE}${url}`
    : "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200";

// ===== LocalStorage helpers =====
const storageKey = (id) => `ritualChecklist:${id}`;
const safeParse = (raw, fallback = null) => {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const RitualDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // (1) Scroll progress + (2) Parallax
  const [progress, setProgress] = useState(0);
  const [offset, setOffset] = useState(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  // ritual
  const [ritual, setRitual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // checklist (không có đơn vị)
  // { key, itemId, itemName, quantity, note, checked, origin: 'server'|'custom' }
  const [items, setItems] = useState([]);
  const [userNotes, setUserNotes] = useState("");
  const [newItemText, setNewItemText] = useState("");

  // suggested trays for this ritual
  const [suggestedTrays, setSuggestedTrays] = useState([]);
  const [traysLoading, setTraysLoading] = useState(false);

  // progress + parallax listeners
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled =
        (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setProgress(scrolled);
      setOffset(window.scrollY * 0.2); // parallax: 0.2
      
      // Hide scroll indicator when user scrolls down
      if (window.scrollY > 300) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  
  // Scroll to body section
  const scrollToBody = () => {
    const bodySection = document.querySelector('section.container');
    if (bodySection) {
      bodySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // persist/restore localStorage
  const persist = (nextItems = items, nextNotes = userNotes) => {
    try {
      localStorage.setItem(
        storageKey(id),
        JSON.stringify({ items: nextItems, userNotes: nextNotes })
      );
    } catch {}
  };
  const restore = () => {
    const raw = localStorage.getItem(storageKey(id));
    return safeParse(raw, null); // {items, userNotes} | null
  };

  // load dữ liệu
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null); // Reset error state
      
      try {
        console.log('🔍 Fetching ritual details for ID:', id);
        
        // Fetch ritual details
        const res = await ritualService.getRitualById(id);
        const ritualData = res?.data || res;
        console.log('✅ Ritual data loaded:', ritualData);
        setRitual(ritualData);

        // Fetch checklist
        console.log('🔍 Fetching checklist for ritual ID:', id);
        const list = await checklistService.getByRitual(id);
        console.log('✅ Checklist loaded:', list);
        
        const base = list.map((row, idx) => ({
          key: `${row.itemId || row.checklistId || idx}`,
          itemId: row.itemId,
          itemName: row.itemName,
          quantity: row.quantity ?? 1,
          note: row.checkNote || "",
          checked: false,
          origin: "server",
        }));

        const saved = restore();
        if (saved) {
          const byKey = new Map((saved.items || []).map((it) => [it.key, it]));
          const merged = base.map((it) =>
            byKey.has(it.key) ? { ...it, ...byKey.get(it.key) } : it
          );
          const custom = (saved.items || []).filter(
            (it) => it.origin === "custom"
          );
          setItems([...merged, ...custom]);
          setUserNotes(saved.userNotes || "");
        } else {
          setItems(base);
        }
        
        console.log('✅ All data loaded successfully');
      } catch (err) {
        console.error('❌ Error loading ritual/checklist:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError("Không thể tải thông tin nghi lễ hoặc checklist");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    scrollToTop(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch suggested trays for this ritual
  useEffect(() => {
    const fetchSuggestedTrays = async () => {
      if (!id) return;
      
      setTraysLoading(true);
      try {
        // Thử lấy mâm cúng theo ritual ID
        let traysData = [];
        
        try {
          // Ưu tiên thử endpoint trực tiếp: /api/products/ritual/{ritualId}
          const response = await trayService.getTraysByRitual(id);
          traysData = response?.data?.content || response?.data || [];
          console.log('✅ Loaded trays from getTraysByRitual endpoint');
        } catch (directError) {
          console.log('Direct endpoint failed, trying filter endpoint...');
          try {
            // Thử endpoint filter với ritualId
            const response = await trayService.filterTrays({ ritualId: id });
            traysData = response?.data?.content || response?.data || [];
            console.log('✅ Loaded trays from filter endpoint');
          } catch (filterError) {
            console.log('Filter endpoint failed, trying getAllTrays with client-side filter...');
            // Fallback: Lấy tất cả và filter ở client
            try {
              const response = await trayService.getAllTrays();
              const allTrays = response?.data?.content || response?.data || [];
              // Filter theo ritualId nếu có trong data
              traysData = Array.isArray(allTrays) 
                ? allTrays.filter(tray => 
                    tray.ritualId === parseInt(id) || 
                    tray.ritual?.ritualId === parseInt(id) ||
                    tray.ritualId === id ||
                    tray.ritual?.ritualId === id
                  )
                : [];
              console.log('✅ Loaded trays from getAllTrays with client-side filter');
            } catch (altError) {
              console.error('All endpoints failed:', altError);
            }
          }
        }
        
        console.log('✅ Suggested trays loaded:', traysData);
        setSuggestedTrays(Array.isArray(traysData) ? traysData : []);
      } catch (err) {
        console.error('❌ Error loading suggested trays:', err);
        setSuggestedTrays([]);
      } finally {
        setTraysLoading(false);
      }
    };

    if (id && !loading) {
      fetchSuggestedTrays();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, loading]);

  // auto-persist mỗi khi đổi
  useEffect(() => {
    persist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, userNotes, id]);

  // handlers
  const toggleItem = (key) =>
    setItems((prev) =>
      prev.map((it) =>
        it.key === key ? { ...it, checked: !it.checked } : it
      )
    );

  const updateItemNote = (key, val) =>
    setItems((prev) =>
      prev.map((it) => (it.key === key ? { ...it, note: val } : it))
    );

  const addCustomItem = (e) => {
    e.preventDefault();
    const name = newItemText.trim();
    if (!name) return;
    const newIt = {
      key: `custom:${Date.now()}`,
      itemId: null,
      itemName: name,
      quantity: 1,
      note: "",
      checked: false,
      origin: "custom",
    };
    setItems((prev) => [newIt, ...prev]);
    setNewItemText("");
  };

  const deleteCustomItem = (item) => {
    if (item.origin !== "custom") return;
    setItems((prev) => prev.filter((it) => it.key !== item.key));
  };

  const completed = useMemo(() => items.filter((i) => i.checked).length, [items]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-vietnam-cream">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-vietnam-green border-t-transparent"></div>
      </div>
    );

  if (error || !ritual)
    return (
      <div className="min-h-screen flex items-center justify-center bg-vietnam-cream text-center">
        <div>
          <h1 className="text-2xl font-bold text-vietnam-green mb-4">
            {error || "Không tìm thấy nghi lễ"}
          </h1>
          <Link to="/" className="text-vietnam-green underline">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );

  // data cho stagger cards
  const infoCards = [
    { title: "Vùng miền", value: ritual.regionName || "—" },
    { title: "Âm lịch", value: ritual.dateLunar || "—" },
    {
      title: "Dương lịch",
      value: ritual.dateSolar
        ? new Date(ritual.dateSolar).toLocaleDateString("vi-VN")
        : "—",
      wide: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-vietnam-cream to-white">
      {/* ===== Progress bar (1) ===== */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent">
        <div
          style={{ width: `${progress}%` }}
          className="h-full bg-amber-500 transition-[width] duration-150"
        />
      </div>

      {/* ===== HERO (2) Parallax ===== */}
      <section
        className="relative text-white overflow-hidden animate-fadeInSlow"
        style={{
          backgroundImage: "url('/hero-background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: `center ${-offset}px`,
        }}
      >
        <div className="absolute inset-0 bg-[#0d3b36]/80"></div>
        <div className="relative z-10 container mx-auto px-0 py-16">
          <nav className="flex items-center space-x-2 text-sm mb-8 opacity-95 px-4 lg:px-6">
            <Link to="/" className="hover:text-vietnam-gold transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link
              to="/rituals"
              className="hover:text-vietnam-gold transition-colors"
            >
              Nghi lễ
            </Link>
            <span>/</span>
            <span className="text-vietnam-gold">{ritual.ritualName}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center px-4 lg:px-6">
            <div className="lg:col-span-2 animate-slideUp">
              <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6 leading-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.35)]">
                {ritual.ritualName}
              </h1>

              {/* ===== Info cards (3) Stagger reveal ===== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {infoCards.map((c, i) => (
                  <div
                    key={c.title}
                    className={`bg-white/10 rounded-lg p-4 backdrop-blur-[1px] animate-slideUp ${
                      c.wide ? "sm:col-span-2" : ""
                    }`}
                    style={{ animationDelay: `${i * 90}ms` }}
                  >
                    <h3 className="font-semibold text-vietnam-gold mb-2">
                      {c.title}
                    </h3>
                    <p className="text-lg">{c.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 rounded-xl overflow-hidden shadow-2xl animate-zoomIn">
              <img
                src={getImageUrl(ritual.imageUrl)}
                alt={ritual.ritualName}
                className="w-full h-80 lg:h-96 object-cover"
                loading="lazy"
              />
            </div>
          </div>
          
          {/* Scroll Indicator */}
          {showScrollIndicator && (
            <div 
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20 transition-opacity duration-300"
              onClick={scrollToBody}
            >
              <div className="flex flex-col items-center text-yellow/80 hover:text-white transition-colors cursor-pointer group">
                <span className="text-sm mb-2 font-medium">Xem thêm</span>
                <svg
                  className="w-6 h-6 group-hover:translate-y-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== BODY ===== */}
      <section className="container mx-auto px-4 lg:px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT — mô tả (information-background.jpg) */}
          <div className="lg:col-span-2 animate-fadeInUp">
            <div
              className="relative rounded-2xl overflow-hidden shadow-xl border border-amber-200/50"
              style={{
                backgroundImage: "url('/information-background.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-white/75"></div>
              <div className="relative p-7 text-stone-800">
                <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-5">
                  Mô tả chi tiết
                </h2>
                <p className="leading-relaxed whitespace-pre-wrap">
                  {ritual.description || "—"}
                </p>

                {ritual.meaning && (
                  <>
                    <h2 className="text-2xl font-serif font-bold text-vietnam-green mt-10 mb-4">
                      Ý nghĩa
                    </h2>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {ritual.meaning}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Suggested Trays Section */}
            {suggestedTrays.length > 0 && (
              <div className="mt-8 animate-fadeInUp">
                <div className="bg-white rounded-2xl shadow-xl border border-amber-200/50 p-7">
                  <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-6">
                    Mâm cúng gợi ý cho {ritual.ritualName}
                  </h2>
                  
                  {traysLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-vietnam-green border-t-transparent"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {suggestedTrays.map((tray) => (
                        <div
                          key={tray.productId}
                          className="bg-gradient-to-br from-vietnam-cream to-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-amber-200/50 cursor-pointer"
                          onClick={() => navigate(`/trays/${tray.productId}`)}
                        >
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={getImageUrl(tray.productImage)}
                              alt={tray.productName}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200';
                              }}
                            />
                            <div className="absolute top-0 right-0 p-2">
                              <span className="px-3 py-1 bg-vietnam-green text-white text-xs font-bold rounded-full shadow-md">
                                Gợi ý
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="text-lg font-serif font-semibold text-vietnam-green mb-2 line-clamp-2">
                              {tray.productName}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {tray.productDescription}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-vietnam-green">
                                {tray.price ? `${Number(tray.price).toLocaleString('vi-VN')} VNĐ` : 'Liên hệ'}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/trays/${tray.productId}`);
                                }}
                                className="px-4 py-2 bg-vietnam-green text-white rounded-lg font-semibold hover:bg-vietnam-gold transition-colors text-sm"
                              >
                                Xem chi tiết
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — checklist (hoa sen vàng) */}
          <aside className="lg:col-span-1 animate-fadeInUp delay-150">
            <div className="lg:sticky lg:top-24">
              <div
                className="relative rounded-xl overflow-hidden shadow-2xl border border-amber-300/60"
                style={{
                  backgroundImage: "url('/checklist-background.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-white/65 backdrop-blur-[1px]"></div>

                <div className="relative z-10 p-4 md:p-5 text-stone-800 text-sm">
                  {/* Banner tạo danh mục cá nhân */}
                  <div 
                    onClick={() => navigate(`/checklist?create=true&ritualId=${id}`)}
                    className="mb-3 p-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 border border-amber-600/30 cursor-pointer hover:from-amber-500 hover:to-amber-600 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg group"
                  >
                    <div className="flex items-center gap-2 text-white">
                      <svg 
                        className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span className="text-xs font-semibold leading-tight">
                        Muốn tạo danh mục cho cá nhân bạn? <span className="underline">Bấm vào đây</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-amber-600 drop-shadow">
                        Checklist: {ritual?.ritualName}
                      </h3>
                      <div className="text-[11px] mt-0.5 text-stone-700">
                        {completed}/{items.length} xong
                      </div>
                    </div>

                    {/* Xoá tất cả dữ liệu đã lưu (tuỳ chọn) */}
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem(storageKey(id));
                        window.location.reload();
                      }}
                      className="text-[11px] px-2 py-1 rounded border border-stone-300 text-stone-700 hover:bg-stone-100"
                      title="Xóa dữ liệu đã lưu trên thiết bị cho lễ này"
                    >
                      Xóa lưu
                    </button>
                  </div>

                  {/* Ghi chú tổng */}
                  <label className="block text-xs font-medium text-stone-700 mb-1.5">
                    Ghi chú của bạn
                  </label>
                  <textarea
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    rows={2}
                    placeholder="Thêm ghi chú..."
                    className="w-full mb-3 px-2.5 py-2 rounded bg-white/70 text-stone-800 placeholder-stone-500 border border-amber-300/50 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/40 outline-none text-sm"
                  />

                  {/* Thêm mục custom */}
                  <form onSubmit={addCustomItem} className="flex gap-2 mb-4">
                    <input
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      placeholder="Thêm vật dụng / hoạt động..."
                      className="flex-1 px-2.5 py-2 rounded bg-white/70 text-stone-800 placeholder-stone-500 border border-amber-300/50 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/40 outline-none text-sm"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-all duration-300 transform hover:scale-[1.04] text-sm"
                      title="Thêm"
                    >
                      +
                    </button>
                  </form>

                  {/* Danh sách */}
                  <ul className="space-y-1.5">
                    {items.map((it) => (
                      <li
                        key={it.key}
                        className={`group transition-all duration-300 border rounded-md ${
                          it.checked
                            ? "bg-amber-200/60 border-amber-300"
                            : "bg-white/60 border-amber-200/70"
                        } hover:bg-amber-100/80 hover:shadow-md`}
                      >
                        <label className="flex items-start gap-2.5 p-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={it.checked}
                            onChange={() => toggleItem(it.key)}
                            className="mt-0.5 h-4 w-4 accent-amber-600 cursor-pointer chk-pop"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-medium truncate ${
                                  it.checked
                                    ? "line-through text-stone-500"
                                    : "text-stone-800"
                                }`}
                                title={it.itemName}
                              >
                                {it.itemName}
                              </span>
                              {it.quantity > 1 && (
                                <span className="text-[11px] px-1.5 py-[2px] rounded bg-amber-200/70 text-stone-800 border border-amber-300 whitespace-nowrap">
                                  x{it.quantity}
                                </span>
                              )}

                              {/* Nút xoá chỉ cho item custom */}
                              {it.origin === "custom" && (
                                <button
                                  type="button"
                                  onClick={() => deleteCustomItem(it)}
                                  className="ml-auto text-[11px] px-2 py-[2px] rounded border border-red-300/60 text-red-700 hover:bg-red-50 transition"
                                  title="Xóa mục do bạn thêm"
                                >
                                  Xóa
                                </button>
                              )}
                            </div>

                            <textarea
                              value={it.note || ""}
                              onChange={(e) =>
                                updateItemNote(it.key, e.target.value)
                              }
                              rows={1}
                              placeholder="Ghi chú cho mục này..."
                              className="mt-1 w-full text-[12px] px-2 py-1 rounded bg-white/70 text-stone-800 placeholder-stone-500 border border-transparent focus:border-amber-500 focus:ring-1 focus:ring-amber-400/50 outline-none"
                            />
                          </div>
                        </label>
                      </li>
                    ))}
                  </ul>

                  
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ===== Animations ===== */}
      <style jsx>{`
        @keyframes fadeInSlow {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeInSlow {
          animation: fadeInSlow 0.9s ease forwards;
        }
        @keyframes slideUp {
          from {
            transform: translateY(16px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out both;
        }
        .animate-zoomIn {
          animation: zoomIn 0.6s ease-out both;
        }
        @keyframes zoomIn {
          from {
            transform: scale(0.98);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fadeInUp {
          animation: slideUp 0.6s ease-out both;
        }
        .delay-150 {
          animation-delay: 0.15s;
        }
        /* (7) Checkbox pop */
        @keyframes pop {
          50% {
            transform: scale(1.15);
          }
        }
        .chk-pop:checked {
          animation: pop 150ms ease;
        }
      `}</style>
    </div>
  );
};

export default RitualDetail;
