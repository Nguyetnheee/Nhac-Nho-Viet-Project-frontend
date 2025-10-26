import React, { useEffect, useState } from 'react';
import { checklistService } from '../services/checklistService';
import { scrollToTop } from '../utils/scrollUtils';

const Checklist = () => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchChecklists();
    scrollToTop(true);
  }, []);

  const fetchChecklists = async () => {
    setLoading(true);
    try {
      const data = await checklistService.getChecklists();
      // lấy 3 checklist mẫu đầu tiên
      setChecklists(data.slice(0, 6));
    } catch (error) {
      console.error('Lỗi khi lấy checklist:', error);
      setChecklists([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-vietnam-cream">
      {/* HERO */}
      <section className="bg-gradient-to-r from-vietnam-red to-vietnam-red text-white py-16 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Checklist Lễ Hội</h1>
          <p className="text-base md:text-lg text-green-100 whitespace-nowrap text-ellipsis max-w-full">
            Nơi bạn có thể tìm, tạo và lưu các danh sách lễ vật hoặc hoạt động cần chuẩn bị cho từng lễ hội.
          </p>
        </div>

        {/* Ô tìm kiếm */}
        <div className="mt-10 flex justify-center">
          <input
            type="text"
            placeholder="Tìm lễ hội liên quan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 px-5 py-3 rounded-l-lg text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-vietnam-gold"
          />
          <button
            onClick={() => alert('Tính năng tìm kiếm đang phát triển')}
            className="bg-vietnam-gold text-vietnam-red px-6 py-3 rounded-r-lg font-semibold hover:bg-yellow-600 transition"
          >
            Tìm kiếm
          </button>
        </div>
      </section>

      {/* CHECKLIST MẪU */}
      <section className="py-12 max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-serif font-bold text-vietnam-red mb-8 text-center">
          Checklist của các lễ hội 
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-vietnam-green"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {checklists.map((item) => (
              <div
                key={item.checklistId}
                className="bg-green-50 border border-green-200 rounded-xl p-6 shadow hover:shadow-md transition"
              >
                <h3 className="text-xl font-bold text-vietnam-green mb-3">
                  {item.ritualName || 'Tên lễ hội'}
                </h3>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`item-${item.itemId}`}
                    className="h-5 w-5 text-vietnam-green border-green-400 rounded focus:ring-vietnam-green"
                  />
                  <label
                    htmlFor={`item-${item.itemId}`}
                    className="ml-3 text-gray-800 font-medium"
                  >
                    {item.itemName} ({item.quantity || 1})
                  </label>
                </div>
                {item.checkNote && (
                  <p className="text-sm text-gray-500 italic">{item.checkNote}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Checklist;
