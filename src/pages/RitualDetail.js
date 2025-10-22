import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ritualService } from '../services/ritualService';
import { scrollToTop } from '../utils/scrollUtils';

const RitualDetail = () => {
  const { id } = useParams();
  const [ritual, setRitual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRitual();
    scrollToTop(true);
  }, [id]);

  const fetchRitual = async () => {
    try {
      const response = await ritualService.getRitualById(id);
      setRitual(response);
    } catch (error) {
      console.error('Error fetching ritual:', error);
      setError('Không thể tải thông tin nghi lễ');
    } finally {
      setLoading(false);
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
            <h1 className="text-2xl font-bold text-vietnam-red mb-4">
              {error || 'Không tìm thấy nghi lễ'}
            </h1>
            <Link to="/" className="btn-primary">
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vietnam-cream to-white">
      <div className="relative bg-gradient-to-r from-vietnam-red to-red-800 text-white py-16">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <nav className="flex items-center space-x-2 text-sm mb-8">
            <Link to="/" className="hover:text-vietnam-gold transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link to="/" className="hover:text-vietnam-gold transition-colors">
              Nghi lễ
            </Link>
            <span>/</span>
            <span className="text-vietnam-gold">{ritual.ritualName}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6 leading-tight">
                {ritual.ritualName}
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold text-vietnam-gold mb-2">Vùng miền</h3>
                  <p className="text-lg">{ritual.region}</p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold text-vietnam-gold mb-2">Trạng thái</h3>
                  <p className="text-lg">
                    {ritual.active ? 'Đang hoạt động' : 'Không hoạt động'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-serif font-bold text-vietnam-red mb-6">
            Mô tả chi tiết
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {ritual.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RitualDetail;