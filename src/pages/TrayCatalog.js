import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trayService } from '../services/trayService';
import { useCart } from '../contexts/CartContext';

const TrayCatalog = () => {
  const [trays, setTrays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    region: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });
  const { addToCart } = useCart();

  useEffect(() => {
    fetchTrays();
  }, []);

  const fetchTrays = async () => {
    try {
      setLoading(true);
      const response = await trayService.getAllTrays();
      setTrays(response.data);
    } catch (error) {
      console.error('Error fetching trays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      let response;
      
      if (filters.region) {
        response = await trayService.getTraysByRegion(filters.region);
      } else if (filters.category) {
        response = await trayService.getTraysByCategory(filters.category);
      } else if (filters.minPrice && filters.maxPrice) {
        response = await trayService.getTraysByPriceRange(
          parseFloat(filters.minPrice),
          parseFloat(filters.maxPrice)
        );
      } else {
        response = await trayService.getAllTrays();
      }
      
      setTrays(response.data);
    } catch (error) {
      console.error('Error filtering trays:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      region: '',
      category: '',
      minPrice: '',
      maxPrice: ''
    });
    fetchTrays();
  };

  const handleAddToCart = (tray) => {
    addToCart(tray);
    alert('Đã thêm vào giỏ hàng!');
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

        {/* Filters */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-vietnam-red mb-6">Bộ lọc</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vùng miền</label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="input-field"
              >
                <option value="">Tất cả</option>
                <option value="Miền Bắc">Miền Bắc</option>
                <option value="Miền Trung">Miền Trung</option>
                <option value="Miền Nam">Miền Nam</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-field"
              >
                <option value="">Tất cả</option>
                <option value="Cơ bản">Cơ bản</option>
                <option value="Cao cấp">Cao cấp</option>
                <option value="Đặc biệt">Đặc biệt</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá từ</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="input-field"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá đến</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="input-field"
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
              <div key={tray.id} className="card hover:shadow-xl transition-shadow duration-300">
                <div className="card-content">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={tray.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'}
                      alt={tray.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <div className="card-body">
                    <h3 className="text-xl font-serif font-semibold text-vietnam-red mb-2">
                      {tray.name}
                    </h3>
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {tray.description}
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
                  <div className="card-footer">
                    <button
                      onClick={() => handleAddToCart(tray)}
                      className="btn-primary w-full"
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
