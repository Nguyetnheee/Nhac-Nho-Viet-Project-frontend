import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined, ShoppingCartOutlined, SearchOutlined, InboxOutlined } from '@ant-design/icons';
import { trayService } from '../services/trayService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Tag } from 'antd';

const ITEMS_PER_PAGE = 6;

const TrayCatalog = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [trays, setTrays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    regionId: '',
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    searchQuery: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [regions, setRegions] = useState([]);
  const [categories, setCategories] = useState([]);

  // Logic cũ (fetchInitialData, fetchTrays, handleFilterChange, applyFilters, clearFilters, Pagination)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        console.log('Fetching initial data...');

        const [regionsRes, categoriesRes, traysRes] = await Promise.all([
          trayService.getRegions(),
          trayService.getCategories(),
          trayService.getAllTrays()
        ]);

        console.log('Raw responses:', {
          regions: regionsRes?.data,
          categories: categoriesRes?.data,
          trays: traysRes?.data
        });

        if (regionsRes?.data && Array.isArray(regionsRes.data)) {
          // Gán regions data
          setRegions(regionsRes.data);
          console.log('Regions set:', regionsRes.data);
        } else {
          setRegions([]);
          console.error('Invalid regions data');
        }

        if (categoriesRes?.data && Array.isArray(categoriesRes.data)) {
          // Gán categories data
          setCategories(categoriesRes.data);
          console.log('Categories set:', categoriesRes.data);
        } else {
          setCategories([]);
          console.error('Invalid categories data');
        }

        if (traysRes?.data?.content) {
          setTrays(traysRes.data.content);
          console.log('Trays set from content:', traysRes.data.content);
        } else if (Array.isArray(traysRes?.data)) {
          setTrays(traysRes.data);
          console.log('Trays set from array:', traysRes.data);
        } else {
          setTrays([]);
          console.error('Invalid trays data');
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        setRegions([]);
        setCategories([]);
        setTrays([]);
      } finally {
        setLoading(false);
        setCurrentPage(1);
      }
    };

    fetchInitialData();
  }, []);

  const fetchTrays = async () => {
    try {
      setLoading(true);
      const response = await trayService.getAllTrays();
      console.log('Fetch all trays response:', response.data);

      if (response.data?.content) {
        setTrays(response.data.content);
      } else if (Array.isArray(response.data)) {
        setTrays(response.data);
      } else {
        setTrays([]);
      }
    } catch (error) {
      console.error('Error fetching trays:', error);
      toast.error('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  const handleFilterChange = (key, value) => {
    console.log(`Changing filter ${key} to:`, value);
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: value
      };
      console.log('New filters state:', newFilters);
      return newFilters;
    });
  };

  const applyFilters = async () => {
    setCurrentPage(1);
    try {
      setLoading(true);

      const searchQuery = filters.searchQuery?.trim();
      if (searchQuery) {
        console.log('Searching with query:', searchQuery);
        try {
          const response = await trayService.searchTrays(searchQuery);
          console.log('Search API response:', response);

          if (Array.isArray(response.data)) {
            setTrays(response.data);
          } else if (response.data?.content) {
            setTrays(response.data.content);
          } else {
            setTrays([]);
          }
        } catch (error) {
          console.error('Search error:', error);
          toast.error('Không thể tìm kiếm sản phẩm');
          setTrays([]);
        }
        return;
      }

      const filterParams = {};

      // ⚠️ Đã fix: Giá trị trong filters.regionId/categoryId hiện đang là ID (hoặc tên, tuỳ backend)
      // Chúng ta sẽ gửi giá trị này trực tiếp qua filterParams
      if (filters.regionId && filters.regionId !== '') {
        filterParams.regionId = filters.regionId;
      }

      if (filters.categoryId && filters.categoryId !== '') {
        filterParams.categoryId = filters.categoryId;
      }

      // Chỉ thêm minPrice nếu có giá trị và khác 0
      if (filters.minPrice && filters.minPrice !== '' && filters.minPrice !== '0') {
        filterParams.minPrice = filters.minPrice.toString();
      }
      
      // Chỉ thêm maxPrice nếu có giá trị
      if (filters.maxPrice && filters.maxPrice !== '') {
        filterParams.maxPrice = filters.maxPrice.toString();
      }

      console.log('Final filter params sent to API:', filterParams);

      const hasFilters = Object.keys(filterParams).length > 0;

      if (!hasFilters) {
        console.log('No filters applied - fetching all trays');
        const response = await trayService.getAllTrays();
        console.log('GetAllTrays response:', response?.data);
        if (response.data?.content) {
          setTrays(response.data.content);
        } else if (Array.isArray(response.data)) {
          setTrays(response.data);
        } else {
          setTrays([]);
        }
        return;
      }

      // Gọi API filter
      console.log('Applying filters with params:', filterParams);
      const response = await trayService.filterTrays(filterParams);
      console.log('Filter response:', response?.data);

      if (response.data?.content) {
        setTrays(response.data.content);
      } else if (Array.isArray(response.data)) {
        setTrays(response.data);
      } else {
        setTrays([]);
      }
    } catch (error) {
      console.error('Error filtering/searching trays:', error);
      toast.error('Không thể tìm kiếm sản phẩm. Vui lòng thử lại sau.');
      setTrays([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setFilters({
      regionId: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      searchQuery: ''
    });
    await fetchTrays();
  };

  const handleAddToCart = (tray) => {
    if (!tray) return;

    // Kiểm tra xem user đã đăng nhập chưa
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/login');
      return;
    }

    // Tạo cart item object giống ProductDetail
    const cartItem = {
      id: tray.productId,
      productId: tray.productId,
      name: tray.productName || 'Unknown Product',
      price: tray.price || 0,
      quantity: 1,
      image: tray.productImage || ''
    };

    try {
      // Thêm vào giỏ hàng với quantity mặc định là 1
      addToCart(cartItem, 1);
      toast.success(`Đã thêm ${tray.productName} vào giỏ hàng`);
    } catch (error) {
      toast.error('Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  const handleViewDetails = (productId) => {
    navigate(`/trays/${productId}`);
  };

  // LOGIC PHÂN TRANG GIẢ ĐỊNH
  const totalPages = Math.ceil(trays.length / ITEMS_PER_PAGE);

  const paginatedTrays = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return trays.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [trays, currentPage]);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const Pagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <nav className="flex justify-center mt-8" aria-label="Page navigation example">
        <ul className="flex list-style-none">
          <li className={`page-item ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}>
            <button
              onClick={() => changePage(currentPage - 1)}
              className="page-link relative block py-1.5 px-3 rounded border-0 bg-transparent outline-none transition-all duration-300 text-gray-800 hover:text-vietnam-green focus:shadow-none"
              aria-label="Previous"
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>

          {pages.map(page => (
            <li key={page} className="page-item">
              <button
                onClick={() => changePage(page)}
                className={`page-link relative block py-1.5 px-3 rounded-full border-0 outline-none transition-all duration-300 shadow-md ${currentPage === page
                  ? 'bg-vietnam-green text-white font-bold'
                  : 'bg-white text-gray-800 hover:bg-gray-200'
                  }`}
              >
                {page}
              </button>
            </li>
          ))}

          <li className={`page-item ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}>
            <button
              onClick={() => changePage(currentPage + 1)}
              className="page-link relative block py-1.5 px-3 rounded border-0 bg-transparent outline-none transition-all duration-300 text-gray-800 hover:text-vietnam-green focus:shadow-none"
              aria-label="Next"
            >
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    );
  };
  // END LOGIC PHÂN TRANG GIẢ ĐỊNH

  return (
    <div className="min-h-screen bg-vietnam-cream">

      {/* Hero Section */}
      <section
        className="relative py-20 shadow-xl bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/hero-background.jpg)' }}
      >
        {/* Overlay trong suốt */}
        <div className="absolute inset-0 bg-vietnam-green bg-opacity-75"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 drop-shadow-lg">
            Mâm Cúng Truyền Thống
          </h1>
          <p className="text-lg text-gray-200 drop-shadow">
            Chọn mâm cúng tinh tế, phù hợp với phong tục và vùng miền.
          </p>
        </div>
      </section>
      {/* END Hero Section */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-10 border-t-4 border-vietnam-gold">
          <h2 className="text-xl font-serif font-semibold text-vietnam-green mb-4">Bộ lọc & Tìm kiếm</h2>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => {
                    handleFilterChange('searchQuery', e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyFilters();
                    }
                  }}
                  className="w-full p-3 pl-10 text-base border border-gray-300 rounded-lg focus:ring-vietnam-gold focus:border-vietnam-gold transition duration-200"
                  placeholder="Tìm kiếm mâm cúng..."
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchOutlined className="text-gray-400 text-lg" />
                </div>
              </div>
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-vietnam-green text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-semibold shadow-md"
              >
                Tìm kiếm
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-t pt-4 border-gray-100">
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">Vùng miền</label>
              <select
                value={filters.regionId}
                onChange={(e) => handleFilterChange('regionId', e.target.value)}
                className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-vietnam-gold focus:border-vietnam-gold transition duration-200"
              >
                <option value="">Tất cả</option>
                {regions.map(region => (
                  <option
                    key={region.regionId || region.id}
                    // ⚠️ FIX: Gán giá trị là ID của vùng miền (hoặc Tên nếu BE chỉ nhận tên)
                    // Giả định backend nhận ID cho regionId:
                    value={region.regionId || region.regionName}
                  >
                    {region.regionName || region.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại mâm</label>
              <select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-vietnam-gold focus:border-vietnam-gold transition duration-200"
              >
                <option value="">Tất cả</option>
                {categories.map(category => (
                  <option
                    key={category.categoryId || category.id}
                    // ⚠️ FIX: Gán giá trị là ID của loại lễ (hoặc Tên nếu BE chỉ nhận tên)
                    // Giả định backend nhận ID cho categoryId:
                    value={category.categoryId || category.categoryName}
                  >
                    {category.categoryName || category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá từ (VNĐ)</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-vietnam-gold focus:border-vietnam-gold transition duration-200"
                placeholder="0"
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá đến (VNĐ)</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-vietnam-gold focus:border-vietnam-gold transition duration-200"
                placeholder="10000000"
              />
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-vietnam-gold text-vietnam-green rounded-lg font-semibold shadow-md hover:bg-yellow-600 transition duration-200"
            >
              Áp dụng bộ lọc
            </button>
            <button
              onClick={clearFilters}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-100 transition duration-200"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
        {/* END Filters */}

        {/* Products */}
        <section>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-vietnam-green"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedTrays.map((tray) => (
                <div
                  key={tray.productId}
                  className="bg-white rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col"
                >
                  <div className="relative">
                    <img
                      src={tray.productImage || 'https://placehold.co/600x400/23473d/ffffff?text=Mâm+Cúng'}
                      alt={tray.productName}
                      className=" object-cover transition-opacity duration-500 hover:opacity-90"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/23473d/ffffff?text=Mâm+Cúng'; }}
                    />
                    <div className="absolute top-0 right-0 p-3">
                      <span className="px-3 py-1 bg-vietnam-green text-white text-xs font-bold rounded-full shadow-md">
                        Mới
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <h3 className="text-xl font-serif font-semibold text-vietnam-green mb-1 line-clamp-2">
                        {tray.productName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {tray.productDescription}
                      </p>

                      {/* Tags theo vùng miền */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tray.regionName == 'Miền Bắc' && (
                          <Tag color='blue' className="bg-vietnam-gold/20 text-vietnam-green rounded-lg font-medium">{tray.regionName}</Tag>
                        )}

                        {tray.regionName == 'Miền Trung' && (
                          <Tag color='green' className="bg-vietnam-gold/20 text-vietnam-green rounded-lg font-medium">{tray.regionName}</Tag>
                        )}

                        {tray.regionName == 'Miền Nam' && (
                          <Tag color='orange' className="bg-vietnam-gold/20 text-vietnam-green rounded-lg font-medium">{tray.regionName}</Tag>
                        )}

                        {tray.regionName == 'Toàn Quốc' && (
                          <Tag color='purple' className="bg-vietnam-gold/20 text-vietnam-green rounded-lg font-medium">{tray.regionName}</Tag>
                        )}
                        
                        {/* Tags theo loại lễ - Mỗi loại có màu riêng */}
                        {tray.categoryName && (
                          <>
                            {console.log('Category name:', tray.categoryName)}
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
                            {/* Mặc định cho các loại lễ khác */}
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
                      {/* Giá */}
                      <div className="mb-4">
                        <span className="text-2xl font-bold text-vietnam-green">
                          {tray.price ? tray.price.toLocaleString('vi-VN') : 0} VNĐ
                        </span>
                      </div>

                      {/* 2 Nút hành động */}
                      <div className="flex gap-3 items-center">
                        {/* Nút Xem chi tiết - Bên trái */}
                        <button
                          onClick={() => handleViewDetails(tray.productId)}
                          className="flex-1 py-2.5 bg-white border-2 border-vietnam-green text-vietnam-green rounded-lg font-bold hover:bg-vietnam-green hover:text-white transition duration-300 shadow-sm transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                          <EyeOutlined className="text-lg" />
                          <span>Chi tiết</span>
                        </button>

                        {/* Nút Thêm vào giỏ - Bên phải */}
                        <button
                          onClick={() => handleAddToCart(tray)}
                          className="flex-1 py-2.5 bg-vietnam-green text-white rounded-lg font-bold hover:bg-emerald-700 transition duration-300 shadow-md transform hover:scale-[1.02] flex items-center justify-center gap-2"
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
          )}
        </section>
        {/* END Products */}

        {/* PHÂN TRANG */}
        {trays.length > 0 && !loading && totalPages > 1 && <Pagination />}

        {/* Không tìm thấy */}
        {trays.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg mt-8">
            <div className="text-gray-400 mb-4">
              <InboxOutlined className="text-6xl mx-auto" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-gray-600 mb-2">
              Không tìm thấy mâm cúng nào
            </h3>
            <p className="text-gray-500 mb-4">
              Hãy thử thay đổi bộ lọc hoặc xem tất cả sản phẩm
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 border border-vietnam-gold text-vietnam-green rounded-lg shadow-sm hover:bg-yellow-50 transition duration-200"
            >
              Xem tất cả
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrayCatalog;