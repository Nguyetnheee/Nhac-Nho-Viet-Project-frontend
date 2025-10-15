import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ritualService } from '../services/ritualService';
import { formatSolarDate } from '../utils/dateUtils';
import { scrollToTop } from '../utils/scrollUtils';

const Home = () => {
  const [upcomingRituals, setUpcomingRituals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingRituals();
    // Scroll to top when component mounts
    scrollToTop(true);
  }, []);

  const fetchUpcomingRituals = async () => {
    try {
      const response = await ritualService.getAllRituals();
      // Sort by date and take first 3, filter out invalid dates
      const validRituals = response.data.filter(ritual => 
        ritual.dateSolar && 
        ritual.dateSolar !== 'Tùy theo ngày khởi công' && 
        ritual.dateSolar !== 'Tùy theo ngày sinh'
      );
      const sorted = validRituals.sort((a, b) => new Date(a.dateSolar) - new Date(b.dateSolar));
      setUpcomingRituals(sorted.slice(0, 3));
    } catch (error) {
      console.error('Error fetching rituals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/rituals?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-vietnam-red to-red-800 text-white py-20 ritual-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Nhắc Nhớ Việt
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Tra cứu lễ hội truyền thống và đặt mâm cúng Việt Nam
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Tìm kiếm lễ hội theo tên hoặc ngày..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-vietnam-gold"
              />
              <button
                type="submit"
                className="bg-vietnam-gold text-vietnam-red px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-600 transition-colors"
              >
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Upcoming Rituals */}
      <section className="py-16 bg-vietnam-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-vietnam-red mb-4">
              Sắp tới có lễ gì?
            </h2>
            <p className="text-lg text-gray-600">
              Khám phá các lễ hội sắp diễn ra và chuẩn bị mâm cúng phù hợp
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vietnam-red"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {upcomingRituals.map((ritual) => (
                <div key={ritual.id} className="card hover:shadow-xl transition-shadow duration-300">
                  <div className="card-content">
                    <div className="aspect-w-16 aspect-h-9 mb-4">
                      <img
                        src={ritual.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'}
                        alt={ritual.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                    <div className="card-body">
                      <h3 className="text-xl font-serif font-semibold text-vietnam-red mb-2">
                        {ritual.name}
                      </h3>
                      <div className="text-sm text-gray-600 mb-3">
                        <p>Âm lịch: {ritual.dateLunar}</p>
                        <p>Dương lịch: {formatSolarDate(ritual.dateSolar)}</p>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {ritual.description || ritual.meaning.substring(0, 150)}...
                      </p>
                    </div>
                    <div className="card-footer">
                      <Link
                        to={`/rituals/${ritual.id}`}
                        className="btn-primary w-full text-center block"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/rituals" className="btn-outline">
              Xem tất cả lễ hội
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-vietnam-red mb-4">
              Tại sao chọn chúng tôi?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-vietnam-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-vietnam-red" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-semibold text-vietnam-red mb-2">
                Tra cứu dễ dàng
              </h3>
              <p className="text-gray-600">
                Tìm kiếm lễ hội theo tên, ngày âm lịch hoặc dương lịch một cách nhanh chóng
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-vietnam-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-vietnam-red" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-semibold text-vietnam-red mb-2">
                Checklist đầy đủ
              </h3>
              <p className="text-gray-600">
                Danh sách đồ cúng chi tiết và bài khấn chuẩn cho từng lễ hội
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-vietnam-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-vietnam-red" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-semibold text-vietnam-red mb-2">
                Mâm cúng chất lượng
              </h3>
              <p className="text-gray-600">
                Đặt mâm cúng đầy đủ, chất lượng cao với giao hàng tận nơi
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
