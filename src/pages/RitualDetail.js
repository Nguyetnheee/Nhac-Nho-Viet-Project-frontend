import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ritualService } from '../services/ritualService';
import { trayService } from '../services/trayService';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/ToastContainer';
import { formatSolarDate } from '../utils/dateUtils';
import { scrollToTop, scrollToTopWithDelay } from '../utils/scrollUtils';

// Component để xử lý link đến lễ hội liên quan
const RelatedRitualLink = ({ ritualName }) => {
  const [ritualId, setRitualId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    findRitualId();
  }, [ritualName]);

  const findRitualId = async () => {
    try {
      const response = await ritualService.getAllRituals();
      const foundRitual = response.data.find(ritual => 
        ritual.name.toLowerCase().includes(ritualName.toLowerCase()) ||
        ritualName.toLowerCase().includes(ritual.name.toLowerCase())
      );
      if (foundRitual) {
        setRitualId(foundRitual.id);
      }
    } catch (error) {
      console.error('Error finding related ritual:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (ritualId) {
      navigate(`/rituals/${ritualId}`);
      // Scroll to top after navigation
      scrollToTopWithDelay(100);
    } else {
      // Fallback to search if ID not found
      navigate(`/rituals?search=${encodeURIComponent(ritualName)}`);
      scrollToTopWithDelay(100);
    }
  };

  if (loading) {
    return (
      <div className="block p-4 bg-vietnam-cream rounded-lg animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="block w-full p-4 bg-vietnam-cream rounded-lg hover:bg-vietnam-gold hover:bg-opacity-20 transition-all duration-300 hover:shadow-md group text-left"
    >
      <div className="flex items-center space-x-3">
        <span className="text-vietnam-red group-hover:text-vietnam-gold transition-colors">→</span>
        <span className="font-medium text-gray-700 group-hover:text-vietnam-red transition-colors">
          {ritualName}
        </span>
      </div>
    </button>
  );
};

const RitualDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { showSuccess } = useToast();
  const [ritual, setRitual] = useState(null);
  const [trays, setTrays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trayLoading, setTrayLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRitual();
    fetchTrays();
    // Scroll to top when component mounts or ID changes
    scrollToTop(true);
  }, [id]);

  const fetchRitual = async () => {
    try {
      const response = await ritualService.getRitualById(id);
      const data = response.data;
      setRitual({
        id: data.id,
        active: data.active,
        description: data.description,
        region: data.region,
        ritual_name: data.ritual_name,
      });
    } catch (error) {
      console.error('Error fetching ritual:', error);
      setError('Không thể tải thông tin lễ hội');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrays = async () => {
    try {
      const response = await trayService.getTraysByRitual(id);
      setTrays(response.data);
    } catch (error) {
      console.error('Error fetching trays:', error);
    } finally {
      setTrayLoading(false);
    }
  };

  const handleAddToCart = (tray) => {
    addToCart(tray.id, 1, {
      productName: tray.name,
      price: tray.price,
      imageUrl: tray.imageUrl,
      description: tray.description
    });
    // Show success message
    showSuccess(`Đã thêm "${tray.name}" vào giỏ hàng!`);
  };

  const copyPrayer = () => {
    if (ritual?.prayerText) {
      navigator.clipboard.writeText(ritual.prayerText);
      showSuccess('Đã copy bài khấn vào clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-vietnam-cream to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vietnam-red"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ritual) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-vietnam-cream to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-vietnam-red mb-4">Không tìm thấy lễ hội</h1>
            <Link to="/rituals" className="btn-primary">
              Quay lại danh sách lễ hội
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vietnam-cream to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-vietnam-red to-red-800 text-white py-16">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <nav className="flex items-center space-x-2 text-sm mb-8">
            <Link to="/" className="hover:text-vietnam-gold transition-colors">Trang chủ</Link>
            <span>/</span>
            <Link to="/rituals" className="hover:text-vietnam-gold transition-colors">Lễ hội</Link>
            <span>/</span>
            <span className="text-vietnam-gold">{ritual.ritual_name}</span>
          </nav>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6 leading-tight">
                {ritual.ritual_name}
              </h1>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                {ritual.description}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold text-vietnam-gold mb-2">Ngày âm lịch</h3>
                  <p className="text-lg">{ritual.dateLunar}</p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold text-vietnam-gold mb-2">Ngày dương lịch</h3>
                  <p className="text-lg">{formatSolarDate(ritual.dateSolar)}</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={ritual.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'}
                  alt={ritual.name}
                  className="w-full h-80 object-cover rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-vietnam-gold rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏮</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Checklist Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-vietnam-red rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl">✓</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-vietnam-red">
                  Checklist đồ cúng
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ritual.checklist?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-vietnam-cream rounded-lg hover:bg-vietnam-gold hover:bg-opacity-20 transition-colors">
                    <input
                      type="checkbox"
                      id={`checklist-${index}`}
                      className="w-5 h-5 text-vietnam-red rounded focus:ring-vietnam-red focus:ring-2"
                    />
                    <label htmlFor={`checklist-${index}`} className="text-gray-700 font-medium cursor-pointer">
                      {item}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Prayer Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-vietnam-gold rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-xl">📿</span>
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-vietnam-red">
                    Bài khấn
                  </h2>
                </div>
                <button
                  onClick={copyPrayer}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <span>📋</span>
                  <span>Copy bài khấn</span>
                </button>
              </div>
              
              <div className="bg-gradient-to-r from-vietnam-cream to-yellow-50 p-6 rounded-xl border-l-4 border-vietnam-gold">
                <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-serif text-lg">
                  {ritual.prayerText}
                </pre>
              </div>
            </div>

            {/* Related Rituals */}
            {ritual.relatedRituals && ritual.relatedRituals.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-vietnam-green rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-xl">🔗</span>
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-vietnam-red">
                    Lễ hội liên quan
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ritual.relatedRituals.map((related, index) => (
                    <RelatedRitualLink 
                      key={index} 
                      ritualName={related} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            {/* Suggested Trays */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-vietnam-red rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-lg">🍽️</span>
                </div>
                <h2 className="text-xl font-serif font-bold text-vietnam-red">
                  Mâm cúng gợi ý
                </h2>
              </div>
              
              {trayLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vietnam-red"></div>
                </div>
              ) : trays.length > 0 ? (
                <div className="space-y-4">
                  {trays.map((tray) => (
                    <div key={tray.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-vietnam-red">
                      <div className="aspect-w-16 aspect-h-9 mb-3">
                        <img
                          src={tray.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300'}
                          alt={tray.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                      <h3 className="font-semibold text-vietnam-red mb-2 line-clamp-2">{tray.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tray.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-vietnam-red">
                          {tray.price.toLocaleString('vi-VN')} VNĐ
                        </span>
                        <button
                          onClick={() => handleAddToCart(tray)}
                          className="btn-primary text-sm px-4 py-2 flex items-center space-x-1"
                        >
                          <span>🛒</span>
                          <span>Thêm vào giỏ</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🍽️</div>
                  <p className="text-gray-500">
                    Chưa có mâm cúng nào cho lễ hội này
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RitualDetail;