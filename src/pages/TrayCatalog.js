import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { trayService } from '../services/trayService';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 6; 

const TrayCatalog = () => {
  const navigate = useNavigate(); 
  
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
  const { addToCart } = useCart();
  
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
      
      if (filters.minPrice && filters.minPrice !== '') {
        // API filterTrays trong trayService đã xử lý chuyển đổi thành chuỗi
        filterParams.minPrice = filters.minPrice.toString();
      }
      if (filters.maxPrice && filters.maxPrice !== '') {
        filterParams.maxPrice = filters.maxPrice.toString();
      }
      
      console.log('Final filter params sent to API:', filterParams);
      
      const hasFilters = Object.keys(filterParams).length > 0;
      
      if (!hasFilters) {
        const response = await trayService.getAllTrays();
        if (response.data?.content) {
          setTrays(response.data.content);
        } else {
          setTrays([]);
        }
        return;
      }
      
      // Gọi API filter
      const response = await trayService.filterTrays(filterParams);
      console.log('Filter response content:', response?.data?.content);
      
      if (response.data?.content) {
        setTrays(response.data.content);
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
    addToCart(tray);
    toast.success('Đã thêm vào giỏ hàng!');
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
              className="page-link relative block py-1.5 px-3 rounded border-0 bg-transparent outline-none transition-all duration-300 text-gray-800 hover:text-vietnam-red focus:shadow-none"
              aria-label="Previous"
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>
          
          {pages.map(page => (
            <li key={page} className="page-item">
              <button 
                onClick={() => changePage(page)}
                className={`page-link relative block py-1.5 px-3 rounded-full border-0 outline-none transition-all duration-300 shadow-md ${
                  currentPage === page 
                  ? 'bg-vietnam-red text-white font-bold' 
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
              className="page-link relative block py-1.5 px-3 rounded border-0 bg-transparent outline-none transition-all duration-300 text-gray-800 hover:text-vietnam-red focus:shadow-none"
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
    <div className="min-h-screen bg-vietnam-cream pt-20 pb-8">
      
      {/* Hero Section (Giữ nguyên) */}
      <section className="bg-vietnam-red py-16 mb-12 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 drop-shadow-lg">
            Mâm Cúng Truyền Thống
          </h1>
          <p className="text-lg text-gray-200 drop-shadow">
            Chọn mâm cúng tinh tế, phù hợp với phong tục và vùng miền.
          </p>
        </div>
      </section>
      {/* END Hero Section */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-10 border-t-4 border-vietnam-gold">
            <h2 className="text-xl font-serif font-semibold text-vietnam-red mb-4">Bộ lọc & Tìm kiếm</h2>
            
            {/* Search Bar */}
            <div className="mb-6">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={filters.searchQuery}
                        onChange={(e) => {
                          handleFilterChange('searchQuery', e.target.value);
                          if (e.target.value.trim()) {
                            setFilters(prev => ({
                              ...prev,
                              regionId: '',
                              categoryId: '',
                              minPrice: '',
                              maxPrice: '',
                              searchQuery: e.target.value
                            }));
                          }
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
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    <button 
                      onClick={applyFilters}
                      className="px-6 py-2 bg-vietnam-red text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold shadow-md"
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
                className="px-6 py-2 bg-vietnam-gold text-vietnam-red rounded-lg font-semibold shadow-md hover:bg-yellow-600 transition duration-200"
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-vietnam-red"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedTrays.map((tray) => (
                <div 
                  key={tray.productId} 
                  onClick={() => handleViewDetails(tray.productId)} 
                  className="bg-white rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 cursor-pointer" 
                >
                  <div className="relative">
                    <img
                      src={tray.productImage || 'https://placehold.co/600x400/23473d/ffffff?text=Mâm+Cúng'}
                      alt={tray.productName}
                      className="w-full h-56 object-cover transition-opacity duration-500 hover:opacity-90"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/23473d/ffffff?text=Mâm+Cúng'; }}
                    />
                    <div className="absolute top-0 right-0 p-3">
                      <span className="px-3 py-1 bg-vietnam-red text-white text-xs font-bold rounded-full shadow-md">
                        Mới
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-xl font-serif font-semibold text-vietnam-red mb-1 line-clamp-2">
                        {tray.productName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {tray.productDescription}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tray.regionName && ( // Sử dụng regionName
                          <span className="px-2 py-1 bg-vietnam-gold/20 text-vietnam-red text-xs rounded-lg font-medium">
                            {tray.regionName}
                          </span>
                        )}
                        {tray.categoryName && ( // Sử dụng categoryName
                          <span className="px-2 py-1 bg-vietnam-green/20 text-vietnam-green text-xs rounded-lg font-medium">
                            {tray.categoryName}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {/* Giá */}
                      <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl font-bold text-vietnam-red">
                            {tray.price ? tray.price.toLocaleString('vi-VN') : 0} VNĐ
                          </span>
                      </div>
                      
                      {/* Nút Thêm vào giỏ - Dùng event stopPropagation để ngăn click vào giỏ hàng mở trang chi tiết */}
                      <button
                        onClick={(e) => {
                            e.stopPropagation(); 
                            handleAddToCart(tray);
                        }}
                        className="w-full py-2.5 bg-vietnam-red text-white rounded-lg font-bold hover:bg-red-700 transition duration-300 shadow-md transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                      >
                        {/* Icon giỏ hàng */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.023.824l.798 4.792a1.8 1.8 0 00.97.942v0c.954.269 1.636 1.066 1.636 2.072v2.793a1.5 1.5 0 001.5 1.5H19.5a1.5 1.5 0 001.5-1.5v-2.793c0-1.006-.682-1.803-1.636-2.072l-.798-4.792A1.8 1.8 0 0018.386 3H2.25z" />
                        </svg>
                        <span>Thêm vào giỏ hàng</span>
                      </button>
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
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-serif font-semibold text-gray-600 mb-2">
              Không tìm thấy mâm cúng nào
            </h3>
            <p className="text-gray-500 mb-4">
              Hãy thử thay đổi bộ lọc hoặc xem tất cả sản phẩm
            </p>
            <button 
              onClick={clearFilters} 
              className="px-6 py-2 border border-vietnam-gold text-vietnam-red rounded-lg shadow-sm hover:bg-yellow-50 transition duration-200"
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