import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ritualService } from '../services/ritualService';
import { formatSolarDate } from '../utils/dateUtils';
import { scrollToTop } from '../utils/scrollUtils';

const RitualLookup = () => {
  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(search);
      searchRituals(search);
    } else {
      fetchAllRituals();
    }
    // Scroll to top when component mounts or search changes
    scrollToTop(true);
  }, [searchParams]);

  const fetchAllRituals = async () => {
    try {
      setLoading(true);
      const response = await ritualService.getAllRituals();
      setRituals(response.data);
    } catch (error) {
      console.error('Error fetching rituals:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchRituals = async (term) => {
    try {
      setLoading(true);
      const response = await ritualService.searchRituals(term);
      setRituals(response.data);
    } catch (error) {
      console.error('Error searching rituals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ search: searchTerm });
    } else {
      setSearchParams({});
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-vietnam-cream py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-vietnam-red mb-4">
            Tra cứu lễ hội
          </h1>
          <p className="text-lg text-gray-600">
            Tìm kiếm và khám phá các lễ hội truyền thống Việt Nam
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm lễ hội theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 input-field"
            />
            <button
              type="submit"
              className="btn-primary"
            >
              Tìm kiếm
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="btn-outline"
              >
                Xóa
              </button>
            )}
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vietnam-red"></div>
          </div>
        ) : (
          <>
            {rituals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rituals.map((ritual) => (
                  <div key={ritual.ritualId} className="card hover:shadow-xl transition-shadow duration-300">
                    <div className="card-content">
                      <div className="aspect-w-16 aspect-h-9 mb-4">
                        <img
                          src={ritual.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'}
                          alt={ritual.ritualName}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                      <div className="card-body">
                        <h3 className="text-xl font-serif font-semibold text-vietnam-red mb-2">
                          {ritual.ritualName}
                        </h3>
                        <div className="text-sm text-gray-600 mb-3">
                          <p>Âm lịch: {ritual.dateLunar}</p>
                          <p>Dương lịch: {formatSolarDate(ritual.dateSolar)}</p>
                          <p>Khu vực: {ritual.regionName}</p>
                        </div>
                        <p className="text-gray-700 mb-4 line-clamp-3">
                          {ritual.description || (ritual.meaning ? ritual.meaning.substring(0, 150) : '')}...
                        </p>
                        {/* Nếu có trường liên quan, có thể thêm ở đây */}
                      </div>
                      <div className="card-footer">
                        <Link
                          to={`/rituals/${ritual.ritualId}`}
                          className="btn-primary w-full text-center block"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Không tìm thấy lễ hội nào
                </h3>
                <p className="text-gray-500 mb-4">
                  Hãy thử tìm kiếm với từ khóa khác hoặc xem tất cả lễ hội
                </p>
                <button
                  onClick={handleClearSearch}
                  className="btn-outline"
                >
                  Xem tất cả lễ hội
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RitualLookup;
