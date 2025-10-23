// src/pages/RitualDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ritualService } from '../services/ritualService';
import { scrollToTop } from '../utils/scrollUtils';

const BACKEND_BASE = 'https://isp-7jpp.onrender.com';

const RitualDetail = () => {
  const { id } = useParams();
  const [ritual, setRitual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRitual = async () => {
      setLoading(true);
      try {
        const response = await ritualService.getRitualById(id);
        const data = response?.data || response;
        setRitual(data);
      } catch (err) {
        console.error('Error fetching ritual:', err);
        setError('Không thể tải thông tin nghi lễ');
      } finally {
        setLoading(false);
      }
    };

    fetchRitual();
    scrollToTop(true);
  }, [id]);

  const getImageUrl = (url) => {
    if (!url) {
      return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200';
    }
    return url.startsWith('http') ? url : `${BACKEND_BASE}${url}`;
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
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-vietnam-red to-red-800 text-white py-16">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-8">
            <Link to="/" className="hover:text-vietnam-gold transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link to="/rituals" className="hover:text-vietnam-gold transition-colors">
              Nghi lễ
            </Link>
            <span>/</span>
            <span className="text-vietnam-gold">{ritual.ritualName}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: text info */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6 leading-tight">
                {ritual.ritualName}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold text-vietnam-gold mb-2">Vùng miền</h3>
                  <p className="text-lg">{ritual.regionName || '—'}</p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold text-vietnam-gold mb-2">Âm lịch</h3>
                  <p className="text-lg">{ritual.dateLunar || '—'}</p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 sm:col-span-2">
                  <h3 className="font-semibold text-vietnam-gold mb-2">Dương lịch</h3>
                  <p className="text-lg">
                    {/* hiển thị yyyy-mm-dd dạng Việt đơn giản */}
                    {ritual.dateSolar
                      ? new Date(ritual.dateSolar).toLocaleDateString('vi-VN')
                      : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: image (✅ đã bật) */}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img
                src={getImageUrl(ritual.imageUrl)}
                alt={ritual.ritualName}
                className="w-full h-80 object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-serif font-bold text-vietnam-red mb-6">
            Mô tả chi tiết
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {ritual.description || '—'}
            </p>
          </div>

          {ritual.meaning && (
            <>
              <h2 className="text-2xl font-serif font-bold text-vietnam-red mt-10 mb-4">
                Ý nghĩa
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {ritual.meaning}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RitualDetail;
