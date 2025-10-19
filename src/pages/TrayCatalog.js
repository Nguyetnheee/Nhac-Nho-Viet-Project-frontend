import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trayService } from '../services/trayService';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';

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
  // State để lưu danh sách regions và categories từ API
  const [regions, setRegions] = useState([]);
  const [categories, setCategories] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        console.log('Fetching initial data...');
        
        // Fetch tất cả dữ liệu cần thiết
        const [regionsRes, categoriesRes, traysRes] = await Promise.all([
          trayService.getRegions(),
          trayService.getCategories(),
          trayService.getAllTrays()
        ]);
        
        console.log('Trays response:', traysRes);
        
        console.log('Raw responses:', {
          regions: regionsRes?.data,
          categories: categoriesRes?.data,
          trays: traysRes?.data
        });

        // Xử lý regions
        if (regionsRes?.data && Array.isArray(regionsRes.data)) {
          setRegions(regionsRes.data);
          console.log('Regions set:', regionsRes.data);
        } else {
          setRegions([]);
          console.error('Invalid regions data');
        }

        // Xử lý categories
        if (categoriesRes?.data && Array.isArray(categoriesRes.data)) {
          setCategories(categoriesRes.data);
          console.log('Categories set:', categoriesRes.data);
        } else {
          setCategories([]);
          console.error('Invalid categories data');
        }

        // Xử lý trays
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
      }
    };

    fetchInitialData();
  }, []);

  const fetchTrays = async () => {
    try {
      setLoading(true);
      const response = await trayService.getAllTrays();
      console.log('Fetch all trays response:', response.data);
      
      // Kiểm tra nếu có dữ liệu trong content
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
    try {
      setLoading(true);
      
      // Nếu có search query, ưu tiên tìm kiếm trước
      const searchQuery = filters.searchQuery?.trim();
      if (searchQuery) {
        console.log('Searching with query:', searchQuery);
        try {
          const response = await trayService.searchTrays(searchQuery);
          console.log('Search API response:', response);
          
          if (Array.isArray(response.data)) {
            console.log('Setting search results from array:', response.data);
            setTrays(response.data);
          } else if (response.data?.content) {
            console.log('Setting search results from content:', response.data.content);
            setTrays(response.data.content);
          } else {
            console.log('No results found');
            setTrays([]);
          }
        } catch (error) {
          console.error('Search error:', error);
          toast.error('Không thể tìm kiếm sản phẩm');
          setTrays([]);
        }
        return;
      }

      // Nếu không có search query, áp dụng các filter khác
      const filterParams = {
        regionId: filters.regionId || '',
        categoryId: filters.categoryId || '',
        minPrice: filters.minPrice || '',
        maxPrice: filters.maxPrice || ''
      };
      
      console.log('Final filter params:', filterParams);
      
      // Gọi API filter với params
      console.log('Calling filter API with params:', filterParams);
      const response = await trayService.filterTrays(filterParams);
      console.log('Filter response:', response);
      
      if (response?.data) {
        // Luôn lấy từ content vì API filter luôn trả về trong format này
        const productList = response.data.content;
        if (Array.isArray(productList)) {
          console.log('Setting filtered products:', productList);
          setTrays(productList.map(product => ({
            productId: product.productId,
            productName: product.productName,
            productDescription: product.productDescription,
            productImage: product.productImage,
            price: product.price,
            category: product.categoryName,
            region: product.regionName
          })));
        } else {
          console.log('No valid content in response:', response.data);
          setTrays([]);
        }
      } else {
        console.log('No data in response:', response);
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
    await fetchTrays(); // Đợi fetch hoàn tất
  };

  const handleAddToCart = (tray) => {
    console.log('Adding tray to cart:', tray);
    addToCart(tray.id, 1, {
      productName: tray.name,
      price: tray.price,
      imageUrl: tray.imageUrl,
      description: tray.description
    });
    toast.success('Đã thêm vào giỏ hàng!');
  };

  return (
    <div className="min-h-screen bg-vietnam-cream py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-vietnam-red mb-4">
            Catalog mâm cúng
          </h1>
          <p className="text-lg text-gray-600">
            Chọn mâm cúng phù hợp cho lễ hội của bạn
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => {
                  handleFilterChange('searchQuery', e.target.value);
                  // Clear other filters when searching
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
                className="w-full p-4 pl-12 text-lg border border-gray-300 rounded-lg focus:ring-vietnam-red focus:border-vietnam-red"
                placeholder="Tìm kiếm mâm cúng..."
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button 
              onClick={applyFilters}
              className="px-8 py-4 bg-vietnam-red text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center min-w-[120px] font-bold"
            >
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-vietnam-red mb-6">Bộ lọc</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">Vùng miền</label>
              <select
                value={filters.regionId}
                onChange={(e) => {
                  console.log('Selected region:', e.target.value);
                  handleFilterChange('regionId', e.target.value);
                }}
                className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-vietnam-red focus:border-vietnam-red"
              >
                <option value="">Tất cả</option>
                {regions && regions.length > 0 ? (
                  regions.map(region => (
                    <option 
                      key={region.regionId} 
                      value={region.regionId}
                    >
                      {region.regionName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Không có dữ liệu</option>
                )}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại mâm</label>
              <select
                value={filters.categoryId}
                onChange={(e) => {
                  console.log('Selected category:', e.target.value);
                  handleFilterChange('categoryId', e.target.value);
                }}
                className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-vietnam-red focus:border-vietnam-red"
              >
                <option value="">Tất cả</option>
                {categories && categories.length > 0 ? (
                  categories.map(category => (
                    <option 
                      key={category.categoryId} 
                      value={category.categoryId}
                    >
                      {category.categoryName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Không có dữ liệu</option>
                )}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá từ</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-vietnam-red focus:border-vietnam-red"
                placeholder="0"
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá đến</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-vietnam-red focus:border-vietnam-red"
                placeholder="10000000"
              />
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button onClick={applyFilters} className="btn-primary">
              Áp dụng bộ lọc
            </button>
            <button onClick={clearFilters} className="btn-outline">
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vietnam-red"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trays.map((tray) => (
              <div key={tray.productId} className="card hover:shadow-xl transition-shadow duration-300">
                <div className="card-content">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={tray.productImage || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'}
                      alt={tray.productName}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer"
                      onClick={() => navigate(`/products/${tray.productId}`)}
                    />
                  </div>
                  <div className="card-body">
                    <h3 
                      className="text-xl font-serif font-semibold text-vietnam-red mb-2 cursor-pointer hover:text-vietnam-gold transition-colors"
                      onClick={() => navigate(`/products/${tray.productId}`)}
                    >
                      {tray.productName}
                    </h3>
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {tray.productDescription}
                    </p>
                    
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {tray.region && (
                          <span className="px-2 py-1 bg-vietnam-gold text-vietnam-red text-xs rounded-full">
                            {tray.region}
                          </span>
                        )}
                        {tray.category && (
                          <span className="px-2 py-1 bg-vietnam-green text-white text-xs rounded-full">
                            {tray.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Bao gồm:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {tray.items?.slice(0, 3).map((item, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1 h-1 bg-vietnam-red rounded-full mr-2"></span>
                            {item}
                          </li>
                        ))}
                        {tray.items?.length > 3 && (
                          <li className="text-vietnam-red text-xs">
                            +{tray.items.length - 3} món khác
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <span className="text-2xl font-bold text-vietnam-red">
                        {tray.price.toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                  </div>
                  <div className="card-footer flex gap-2">
                    <button
                      onClick={() => navigate(`/products/${tray.productId}`)}
                      className="btn-outline flex-1"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => handleAddToCart(tray)}
                      className="btn-primary flex-1"
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {trays.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Không tìm thấy mâm cúng nào
            </h3>
            <p className="text-gray-500 mb-4">
              Hãy thử thay đổi bộ lọc hoặc xem tất cả sản phẩm
            </p>
            <button onClick={clearFilters} className="btn-outline">
              Xem tất cả
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrayCatalog;
