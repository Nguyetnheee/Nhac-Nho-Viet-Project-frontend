// src/pages/RitualDetail.js
import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ritualService } from "../services/ritualService";
import { checklistService } from "../services/checklistService";
import { scrollToTop } from "../utils/scrollUtils";

const BACKEND_BASE = "https://isp-7jpp.onrender.com";
const storageKey = (id) => `ritualChecklist:${id}`;

const getImageUrl = (url) =>
  url
    ? url.startsWith("http")
      ? url
      : `${BACKEND_BASE}${url}`
    : "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200";

const RitualDetail = () => {
  const { id } = useParams();

  // ===== New: Scroll progress bar =====
  const [progress, setProgress] = useState(0);

  // ===== New: Hero parallax offset =====
  const [offset, setOffset] = useState(0);

  const [ritual, setRitual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Checklist state (không có đơn vị)
  const [items, setItems] = useState([]); // {key,itemId,itemName,quantity,note,checked,origin}
  const [userNotes, setUserNotes] = useState("");
  const [newItemText, setNewItemText] = useState("");

  // Progress + Parallax listeners
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled =
        (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setProgress(scrolled);
      setOffset(window.scrollY * 0.2); // parallax 0.2
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const persist = (nextItems, nextUserNotes) => {
    try {
      const data = {
        items: nextItems ?? items,
        userNotes: nextUserNotes ?? userNotes,
      };
      localStorage.setItem(storageKey(id), JSON.stringify(data));
    } catch {}
  };

  const restore = () => {
    try {
      const raw = localStorage.getItem(storageKey(id));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Ritual detail
        const res = await ritualService.getRitualById(id);
        const ritualData = res?.data || res;
        setRitual(ritualData);

        // Checklist theo ritual (public)
        const list = await checklistService.getByRitual(id);
        const mapped = list.map((row, idx) => ({
          key: `${row.itemId || row.checklistId || idx}`,
          itemId: row.itemId,
          itemName: row.itemName,
          quantity: row.quantity ?? 1,
          note: row.checkNote || "",
          checked: false,
          origin: "server",
        }));

        // Restore trạng thái cũ
        const saved = restore();
        if (saved) {
          const byKey = new Map(
            saved.items?.map((it) => [
              it.key || `${it.itemName}|${it.quantity}`,
              it,
            ])
          );
          const merged = mapped.map((it) => {
            const k = it.key || `${it.itemName}|${it.quantity}`;
            return byKey.has(k) ? { ...it, ...byKey.get(k) } : it;
          });
          const customOld = (saved.items || []).filter(
            (it) => it.origin === "custom"
          );
          setItems([...merged, ...customOld]);
          setUserNotes(saved.userNotes || "");
        } else {
          setItems(mapped);
        }
      } catch (err) {
        console.error("Error fetching ritual/checklist:", err);
        setError("Không thể tải thông tin nghi lễ hoặc checklist");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    scrollToTop(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    persist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, userNotes]);

  const toggleItem = (k) =>
    setItems((prev) => {
      const next = prev.map((it) =>
        it.key === k ? { ...it, checked: !it.checked } : it
      );
      persist(next);
      return next;
    });

  const updateItemNote = (k, val) =>
    setItems((prev) => {
      const next = prev.map((it) => (it.key === k ? { ...it, note: val } : it));
      persist(next);
      return next;
    });

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
    const next = [newIt, ...items];
    setItems(next);
    setNewItemText("");
    persist(next);
  };

  const completed = useMemo(() => items.filter((i) => i.checked).length, [items]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-vietnam-cream">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-vietnam-red border-t-transparent"></div>
      </div>
    );

  if (error || !ritual)
    return (
      <div className="min-h-screen flex items-center justify-center bg-vietnam-cream text-center">
        <div>
          <h1 className="text-2xl font-bold text-vietnam-red mb-4">
            {error || "Không tìm thấy nghi lễ"}
          </h1>
          <Link to="/" className="text-vietnam-green underline">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );

  // Dữ liệu thẻ info để stagger
  const infoCards = [
    {
      title: "Vùng miền",
      value: ritual.regionName || "—",
    },
    {
      title: "Âm lịch",
      value: ritual.dateLunar || "—",
    },
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
      {/* ===== (1) Scroll Progress Bar ===== */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent">
        <div
          style={{ width: `${progress}%` }}
          className="h-full bg-amber-500 transition-[width] duration-150"
        />
      </div>

      {/* ===== HERO — (2) Parallax background ===== */}
      <section
        className="relative text-white overflow-hidden animate-fadeInSlow"
        style={{
          backgroundImage: "url('/hero-background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: `center ${-offset}px`, // parallax
        }}
      >
        <div className="absolute inset-0 bg-[#0d3b36]/80"></div>
        <div className="relative z-10 container mx-auto px-4 py-16">
          <nav className="flex items-center space-x-2 text-sm mb-8 opacity-95">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slideUp">
              <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6 leading-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.35)]">
                {ritual.ritualName}
              </h1>

              {/* ===== (3) Stagger reveal cho thẻ info ===== */}
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

            <div className="rounded-xl overflow-hidden shadow-2xl animate-zoomIn">
              <img
                src={getImageUrl(ritual.imageUrl)}
                alt={ritual.ritualName}
                className="w-full h-80 object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== BODY — 2 cột ===== */}
      <section className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT — Mô tả (information-background.jpg) */}
          <div className="lg:col-span-2 animate-fadeInUp">
            <div
              className="relative rounded-2xl overflow-hidden shadow-xl border border-amber-200/50"
              style={{
                backgroundImage: "url('/information-background.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* phủ trắng mờ để đọc rõ chữ */}
              <div className="absolute inset-0 bg-white/75"></div>
              <div className="relative p-7 text-stone-800">
                <h2 className="text-2xl font-serif font-bold text-vietnam-red mb-5">
                  Mô tả chi tiết
                </h2>
                <p className="leading-relaxed whitespace-pre-wrap">
                  {ritual.description || "—"}
                </p>

                {ritual.meaning && (
                  <>
                    <h2 className="text-2xl font-serif font-bold text-vietnam-red mt-10 mb-4">
                      Ý nghĩa
                    </h2>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {ritual.meaning}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — Checklist (tone vàng–nâu, hài hòa) */}
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
                {/* phủ trắng mờ để tăng tương phản chữ */}
                <div className="absolute inset-0 bg-white/65 backdrop-blur-[1px]"></div>

                <div className="relative z-10 p-4 md:p-5 text-stone-800 text-sm">
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="text-lg font-semibold text-amber-600 drop-shadow">
                      Checklist: {ritual?.ritualName}
                    </h3>
                    <span className="text-xs text-stone-700">
                      {completed}/{items.length} xong
                    </span>
                  </div>

                  {/* Ghi chú của bạn */}
                  <label className="block text-xs font-medium text-stone-700 mb-1.5">
                    Ghi chú của bạn
                  </label>
                  <textarea
                    value={userNotes}
                    onChange={(e) => {
                      setUserNotes(e.target.value);
                      persist(undefined, e.target.value);
                    }}
                    rows={2}
                    placeholder="Thêm ghi chú..."
                    className="w-full mb-3 px-2.5 py-2 rounded bg-white/70 text-stone-800 placeholder-stone-500 border border-amber-300/50 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/40 outline-none text-sm"
                  />

                  {/* Thêm mục */}
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

                  {/* Danh sách – giữ hover vàng nâu */}
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
                            // ===== (7) Checkbox pop =====
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

                  <div className="mt-4 text-[11px] text-stone-600">
                    Checklist được lưu tạm trên thiết bị của bạn 💾
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ===== Animations & effects ===== */}
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
