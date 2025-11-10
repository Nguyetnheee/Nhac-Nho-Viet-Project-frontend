import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ritualService } from "../services/ritualService";
import { trayService } from '../services/trayService';
import { orderService } from '../services/orderService';
import { toast } from 'react-toastify';
import {
  ArrowUpOutlined, FacebookOutlined, MailOutlined, PhoneOutlined,
  EyeOutlined, ShoppingCartOutlined, InboxOutlined, EnvironmentOutlined
} from "@ant-design/icons";
import { Tag } from 'antd';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { scrollToTop } from "../utils/scrollUtils";
const BACKEND_BASE = process.env.REACT_APP_API_URL || "";

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

const ITEMS_PER_PAGE = 4;

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [term, setTerm] = useState("");
  const [rituals, setRituals] = useState([]);
  // Video ref for hero section
  const videoRef = useRef(null);
  const [selectedKeys, setSelectedKeys] = useState(new Set(["all"]));
  const [searchTerm, setSearchTerm] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const debounceTimerRef = useRef(null);
  const isInitialMount = useRef(true);
  // Products state
  const [trays, setTrays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Đảm bảo video tự động play khi component mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Video autoplay failed:', err);
      });
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = (params.get("q") || "").trim();
    const regionsParam = (params.get("regions") || "").trim();

    // Ưu tiên search nếu có q
    if (q) {
      setSearchTerm(q);
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
        // applyFilter(keys);
        return;
      }
    }

    // Mặc định: tải tất cả
    initialFetch();
    scrollToTop(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    // Skip lần đầu tiên mount (vì useEffect trên đã xử lý)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Clear timeout cũ
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce 500ms trước khi gọi API
    debounceTimerRef.current = setTimeout(() => {
      const keys = Array.from(selectedKeys);

      // Cập nhật URL với regions mới
      const params = new URLSearchParams();
      if (!keys.includes("all")) {
        params.set("regions", keys.join(","));
      }
      navigate({ search: params.toString() }, { replace: true });

      // Gọi API
      //  applyFilter(keys);
    }, 500);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKeys]);


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

  // const applyFilter = async (keysArg) => {
  //   const keys = Array.isArray(keysArg) ? keysArg : Array.from(selectedKeys);

  //   if (keys.includes("all")) {
  //     initialFetch();
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const regionNames = REGION_OPTIONS
  //       .filter((opt) => opt.api && keys.includes(opt.key))
  //       .map((opt) => opt.api);

  //     const { content } = await ritualService.filterRitualsByRegions(
  //       regionNames,
  //       0,
  //       100
  //     );

  //     // Chỉ hiển thị đúng các miền đã chọn (không kèm 'Toàn Quốc')
  //     const selectedSet = new Set(regionNames);
  //     const filtered = Array.isArray(content)
  //       ? content.filter((item) => selectedSet.has(item.regionName))
  //       : [];

  //     // Sắp xếp theo regionName để nhóm các miền lại với nhau
  //     const sortedRituals = filtered.sort((a, b) => {
  //       const regionOrder = { "Miền Bắc": 1, "Miền Trung": 2, "Miền Nam": 3, "Toàn Quốc": 4 };
  //       const orderA = regionOrder[a.regionName] || 999;
  //       const orderB = regionOrder[b.regionName] || 999;
  //       if (orderA !== orderB) return orderA - orderB;
  //       // Nếu cùng miền thì sắp xếp theo tên
  //       return a.ritualName.localeCompare(b.ritualName);
  //     });

  //     setRituals(sortedRituals);
  //     setLastQuery("");
  //   } catch (e) {
  //     console.error("Error filtering rituals:", e);
  //     setRituals([]);
  //   } finally {
  //     setTimeout(() => setLoading(false), 300);
  //   }
  // };

  // Hàm search có thể gọi từ query param hoặc form
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
    navigate({ search: "" }, { replace: true });
    setSelectedKeys(new Set(["all"]));
    initialFetch();
  };

  // Debounce cho search input
  const handleSearchInput = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const isActive = (key) => selectedKeys.has(key);

  // Search and region navigation
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

  // Fetch trays
  const fetchTrays = async () => {
    try {
      setLoading(true);
      const res = await orderService.getTopSellingProducts();

      // API trả về { total, data: [...] }
      const list =
        res?.data?.data
        ?? res?.data?.content
        ?? (Array.isArray(res?.data) ? res.data : []);

      setTrays(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching trays:', error);
      toast.error('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
      setTrays([]);
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };


  useEffect(() => {
    fetchTrays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddToCart = (tray) => {
    if (!tray) return;
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/login');
      return;
    }
    const cartItem = {
      id: tray.productId,
      productId: tray.productId,
      name: tray.productName || 'Unknown Product',
      price: tray.price || 0,
      quantity: 1,
      // image: tray.productImage || tray.imageUrl || ''
    };
    try {
      addToCart(cartItem, 1);
      toast.success(`Đã thêm ${tray.productName} vào giỏ hàng`);
    } catch {
      toast.error('Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  const handleViewDetails = (productId) => {
    navigate(`/trays/${productId}`);
  };

  const totalPages = Math.ceil(trays.length / ITEMS_PER_PAGE);

  const paginatedTrays = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return trays.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [trays, currentPage]);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
      <nav className="flex justify-center mt-8" aria-label="Page navigation">
        <ul className="flex list-style-none">
          <li className={`page-item ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}>
            <button
              onClick={() => changePage(currentPage - 1)}
              className="page-link relative block py-1.5 px-3 rounded bg-transparent outline-none transition-all duration-300 text-gray-800 hover:text-vietnam-green"
              aria-label="Previous"
              type="button"
              tabIndex={currentPage === 1 ? -1 : 0}
              disabled={currentPage === 1}
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>
          {pages.map(page => (
            <li key={page} className="page-item">
              <button
                onClick={() => changePage(page)}
                className={`page-link relative block py-1.5 px-3 mr-2 rounded-full outline-none transition-all duration-300 shadow-md ${currentPage === page
                  ? 'bg-vietnam-green text-white font-bold'
                  : 'bg-white text-gray-800 hover:bg-gray-200'
                  }`}
                type="button"
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}>
            <button
              onClick={() => changePage(currentPage + 1)}
              className="page-link relative block py-1.5 px-0.5 rounded bg-transparent outline-none transition-all duration-300 text-gray-800 hover:text-vietnam-green"
              aria-label="Next"
              type="button"
              tabIndex={currentPage === totalPages ? -1 : 0}
              disabled={currentPage === totalPages}
            >
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="min-h-screen font-inter">
      {/* Hero Section với Video Background */}
      <section className="relative min-h-[65vh] md:min-h-[90vh] text-white overflow-hidden flex items-center justify-center">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            preload="auto"
            poster="/login-background.jpg"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
            {/* Fallback cho trình duyệt không hỗ trợ video */}
            <img 
              src="/login-background.jpg" 
              alt="Hero background" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </video>
          {/* Overlay để đảm bảo text dễ đọc */}
          <div className="absolute inset-0 bg-[#0d3b36]/40" />
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
                className="bg-vietnam-gold text-vietnam-green px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-600 transition-all duration-300 transform hover:scale-[1.02] shadow-md focus:outline-none focus:ring-4 focus:ring-vietnam-gold/50"
              >
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Sản phẩm */}
      <section className="py-10 bg-vietnam-cream">
        <div className="mx-auto px-4">
          <div className="flex items-center mb-8">
            <h2 className="text-3xl font-semibold text-vietnam-green flex justify-center items-center w-3/4 md:ml-[340px] ml-14 ">Sản phẩm</h2>
            <div className="flex items-end justify-end w-1/4 ">
              <Link to="/trays">
                <button className="bg-vietnam-gold/60 text-black py-2 px-1 rounded-lg text-sm hover:bg-vietnam-gold/80">
                  Xem thêm
                </button>
              </Link>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-vietnam-green"></div>
            </div>
          ) : trays.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedTrays.map((tray) => (
                  <div
                    key={tray.productId}
                    className="bg-white rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col"
                  >
                    <div className="relative">
                      <img
                        src={tray.imageUrl || 'https://placehold.co/600x400/23473d/ffffff?text=Mâm+Cúng'}
                        alt={tray.productName}
                        className="w-full  object-cover transition-opacity duration-500 hover:opacity-90"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/23473d/ffffff?text=Mâm+Cúng'; }}
                      />
                      <div className="absolute top-0 right-0 p-3">
                        <span className="px-3 py-1 bg-vietnam-gold text-white text-xs font-bold rounded-full shadow-md">
                          {/* Mới */}
                          Bán chạy
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex-grow">
                        <h3 className="text-xl font-serif font-semibold text-vietnam-green mb-1 line-clamp-2">
                          {tray.productName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                          {tray.description}
                        </p>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {tray.regionName === 'Miền Bắc' && (
                            <Tag color='blue' className="bg-vietnam-gold/20 text-vietnam-green rounded-lg font-medium">{tray.regionName}</Tag>
                          )}
                          {tray.regionName === 'Miền Trung' && (
                            <Tag color='green' className="bg-vietnam-gold/20 text-vietnam-green rounded-lg font-medium">{tray.regionName}</Tag>
                          )}
                          {tray.regionName === 'Miền Nam' && (
                            <Tag color='orange' className="bg-vietnam-gold/20 text-vietnam-green rounded-lg font-medium">{tray.regionName}</Tag>
                          )}
                          {tray.regionName === 'Toàn Quốc' && (
                            <Tag color='purple' className="bg-vietnam-gold/20 text-vietnam-green rounded-lg font-medium">{tray.regionName}</Tag>
                          )}
                          {tray.categoryName && (
                            <>
                              {(tray.categoryName === 'Lễ Cúng Tổ Tiên' || tray.categoryName.includes('Tổ Tiên')) && (
                                <Tag color='gold' className="rounded-lg font-medium">{tray.categoryName}</Tag>
                              )}
                              {(tray.categoryName === 'Lễ Cúng Thần Linh' || tray.categoryName.includes('Thần Linh')) && (
                                <Tag color='cyan' className="rounded-lg font-medium">{tray.categoryName}</Tag>
                              )}
                              {(tray.categoryName === 'Lễ Cúng Khai Trương' || tray.categoryName.includes('Khai Trương')) && (
                                <Tag color='red' className="rounded-lg font-medium">{tray.categoryName}</Tag>
                              )}
                              {(tray.categoryName === 'Lễ Cúng Gia Tiên' || tray.categoryName.includes('Gia Tiên')) && (
                                <Tag color='volcano' className="rounded-lg font-medium">{tray.categoryName}</Tag>
                              )}
                              {(tray.categoryName === 'Lễ Cúng Rằm' || tray.categoryName.includes('Rằm')) && (
                                <Tag color='magenta' className="rounded-lg font-medium">{tray.categoryName}</Tag>
                              )}
                              {(tray.categoryName === 'Lễ Cúng Tết' || tray.categoryName.includes('Tết')) && (
                                <Tag color='geekblue' className="rounded-lg font-medium">{tray.categoryName}</Tag>
                              )}
                              {(tray.categoryName === 'Lễ Cúng Cầu An' || tray.categoryName.includes('Cầu An')) && (
                                <Tag color='lime' className="rounded-lg font-medium">{tray.categoryName}</Tag>
                              )}
                              {(tray.categoryName === 'Lễ Cầu Phúc - Cầu Siêu' || tray.categoryName.includes('Cầu Phúc') || tray.categoryName.includes('Cầu Siêu')) && (
                                <Tag color='orange' className="rounded-lg font-medium">{tray.categoryName}</Tag>
                              )}
                              {!(
                                tray.categoryName.includes('Tổ Tiên') ||
                                tray.categoryName.includes('Thần Linh') ||
                                tray.categoryName.includes('Khai Trương') ||
                                tray.categoryName.includes('Gia Tiên') ||
                                tray.categoryName.includes('Rằm') ||
                                tray.categoryName.includes('Tết') ||
                                tray.categoryName.includes('Cầu An') ||
                                tray.categoryName.includes('Cầu Phúc') ||
                                tray.categoryName.includes('Cầu Siêu')
                              ) && (
                                  <Tag color='default' className="rounded-lg font-medium">{tray.categoryName}</Tag>
                                )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="mb-4">
                          <span className="text-2xl font-bold text-vietnam-green">
                            {tray.price ? tray.price.toLocaleString('vi-VN') : 0} VNĐ
                          </span>
                        </div>
                        <div className="flex gap-3 items-center">
                          <button
                            onClick={() => handleViewDetails(tray.productId)}
                            className="flex-1 py-2.5 bg-white border-2 border-vietnam-green text-vietnam-green rounded-lg font-bold hover:bg-vietnam-green hover:text-white transition duration-300 shadow-sm transform hover:scale-[1.02] flex items-center justify-center gap-2"
                            type="button"
                          >
                            <EyeOutlined className="text-lg" />
                            <span>Chi tiết</span>
                          </button>
                          <button
                            onClick={() => handleAddToCart(tray)}
                            className="flex-1 py-2.5 bg-vietnam-green text-white rounded-lg font-bold hover:bg-emerald-700 transition duration-300 shadow-md transform hover:scale-[1.02] flex items-center justify-center gap-2"
                            type="button"
                          >
                            <ShoppingCartOutlined className="text-lg" />
                            <span>Giỏ hàng</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination />
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <div className="text-gray-400 mb-4">
                <InboxOutlined className="text-6xl mx-auto" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-gray-600 mb-2">
                Không tìm thấy mâm cúng nào
              </h3>
              <p className="text-gray-500">
                Hãy quay lại sau hoặc thử tải lại trang
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lễ hội truyền thống Việt Nam */}
      <section className="text-center bg-vietnam-cream ">
        {/* <div className="w-full mx-auto px-4 mb-10"> */}
        <div className="flex items-center mb-8">
          <h2 className="text-3xl font-semibold text-vietnam-green flex justify-center items-center w-3/4 md:ml-[340px] ml-14 ">Các nghi lễ truyền thống</h2>
          <div className="flex items-end justify-end w-1/4 mr-6">
            <Link to="/rituals">
              <button className="bg-vietnam-gold/60 text-black py-2 px-1 rounded-lg text-sm hover:bg-vietnam-gold/80 flex items-center gap-2">
                Xem thêm
              </button>
            </Link>
          </div>
        </div>
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* <h2 className="text-4xl md:text-5xl font-serif font-bold text-vietnam-green mb-3">
              Các nghi lễ truyền thống
            </h2> */}
            {/* <p className="text-xl text-gray-600 font-light">
              Chọn vùng miền hoặc tìm kiếm tên lễ hội để xem kết quả phù hợp
            </p> */}
            {/* {lastQuery && (
              <p className="mt-3 text-sm text-gray-500">
                Kết quả cho: <span className="font-semibold text-vietnam-green">"{lastQuery}"</span>{" "}
                <button onClick={clearSearch} className="underline ml-1">Xóa</button>
              </p>
            )} */}
          </div>


          {loading ? (
            [...Array(8)].map((_, index) => <RitualCardSkeleton key={index} />)
          ) : rituals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 md:gap-10">
              {rituals.map((ritual, index) => (
                <div
                  key={ritual.ritualId}
                  className="bg-white rounded-2xl overflow-hidden shadow-xl transition-all duration-500 transform hover:shadow-2xl hover:-translate-y-1 opacity-0 animate-fadeIn h-full flex flex-col text-left"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="card-content flex flex-grow flex-col items-start">
                    <div className="relative">
                      <img
                        src={getImageUrl(ritual.imageUrl)}
                        alt={ritual.ritualName}
                        className="w-full object-contain transition-opacity duration-500 hover:opacity-90"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/23473d/ffffff?text=Lễ+Hội'; }}
                      />
                    </div>
                    <div className="card-body p-6">
                      <h3 className="text-2xl font-serif font-bold text-vietnam-green mb-3 leading-snug text-left">
                        {ritual.ritualName}
                      </h3>
                      <div className="text-base text-gray-600 mb-4 flex items-center text-left">
                        <EnvironmentOutlined className="text-lg mr-2 text-vietnam-green" />
                        <p>Vùng miền: <span className="font-semibold">{ritual.regionName}</span></p>
                      </div>
                      <p className="text-gray-700 mb-5 line-clamp-4 text-sm text-left">
                        {ritual.description || ritual.meaning}
                      </p>
                    </div>
                    <div className="card-footer p-4 border-t border-gray-100 w-full">
                      <Link
                        to={`/rituals/${ritual.ritualId}`}
                        className="bg-vietnam-green text-white text-center px-5 py-2.5 rounded-lg font-semibold text-left transition duration-300 hover:bg-emerald-800 hover:shadow-lg transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-vietnam-green/50 block"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 md:gap-10">
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <div className="text-gray-400 mb-4">
                  <InboxOutlined className="text-6xl mx-auto" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-gray-600 mb-2">
                  Không tìm thấy nghi lễ nào
                </h3>
              </div>
            // </div>
          )}
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
      {/* </section > */}

      {/* Về chúng tôi */}
      {/* < section className="mt-10 text-center bg-vietnam-cream" >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-vietnam-green mb-4">Thông tin liên hệ</h2>
        </div>
      </section > */}

      {/* Liên hệ + Bản đồ */}
      < section className="py-10 bg-vietnam-cream" >
        <div className=" mx-auto px-4 max-w-8xl flex flex-col md:flex-row items-center justify-between gap-20">
          <div className="w-full md:w-1/2 text-center md:text-left max-w-lg md:ml-20">
            <h2 className="text-4xl font-bold text-vietnam-green mb-3">Liên hệ với chúng tôi</h2>
            <p className="text-gray-700 mb-6">
              Đừng ngần ngại liên hệ để biết thêm về các nghi lễ và lễ hội truyền thống Việt Nam!
            </p>
            <div className="bg-white rounded-xl p-6 shadow flex flex-col gap-4 items-center md:items-start">
              <div className="flex items-center gap-3">
                <span className="bg-vietnam-green/10 p-2 rounded-full">
                  <PhoneOutlined className="text-xl text-vietnam-green flex items-center justify-center" />
                </span>
                <span className="text-base text-gray-700 font-medium">
                  Số điện thoại: <a href="tel:0366852182" className="text-vietnam-green hover:underline">0366 852 182</a>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-vietnam-green/10 p-2 rounded-full">
                  <MailOutlined className="text-xl text-vietnam-green flex items-center justify-center" />
                </span>
                <span className="text-base text-gray-700 font-medium">
                  Email: <a href="mailto:nhacnhoviet1@gmail.com" className="text-vietnam-green hover:underline">nhacnhoviet1@gmail.com</a>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-vietnam-green/10 p-2 rounded-full">
                  <FacebookOutlined className="text-xl text-vietnam-green flex items-center justify-center" />
                </span>
                <span className="text-base text-gray-700 font-medium">
                  <a href="https://www.facebook.com/profile.php?id=61582970296339" target="_blank" rel="noreferrer" className="text-vietnam-green hover:underline">Nhắc Nhớ Việt</a>
                </span>
              </div>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <div className="rounded-2xl shadow-lg overflow-hidden w-full max-w-7xl h-[350px] md:h-[400px] md:mr-20">
              <iframe
                title="Google Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.609941530484!2d106.80730807451786!3d10.841132857997911!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgVFAuIEhDTQ!5e0!3m2!1svi!2s!4v1762419061627!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section >

      {/* <section className="py-12 bg-vietnam-cream relative"> */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg border-1 border-vietnam-green hover:bg-vietnam-gold transition-colors"
          aria-label="Lên đầu trang"
          type="button"
        >
          <ArrowUpOutlined className="text-xl text-vietnam-green group-hover:text-vietnam-green transition" />
        </button>
      </div>
      {/* </section> */}
    </div >
  );
};

export default Home;
