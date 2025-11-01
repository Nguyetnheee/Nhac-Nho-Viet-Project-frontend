import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { checklistService } from '../services/checklistService';
import { scrollToTop } from '../utils/scrollUtils';
import { groupChecklistsByRitualName } from '../utils/dataUtils'; 

const Checklist = () => {
  const navigate = useNavigate(); 
  
  const [checklistsByRitual, setChecklistsByRitual] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchChecklists();
    scrollToTop(true);
  }, []);

  const fetchChecklists = async () => {
    setLoading(true);
    try {
      console.log('🔍 Checklist page: Fetching all checklists...');
      const data = await checklistService.getChecklists();
      console.log('✅ Checklist page: Data received:', data);
      console.log('📊 Total checklist items:', Array.isArray(data) ? data.length : 'Not an array');
      
      const groupedData = groupChecklistsByRitualName(data);
      console.log('📋 Grouped by ritual:', groupedData);
      console.log('🎯 Displaying first 6 rituals:', groupedData.slice(0, 6));
      
      setChecklistsByRitual(groupedData.slice(0, 6)); 
    } catch (error) {
      console.error('❌ Checklist page: Error fetching checklists:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setChecklistsByRitual([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewDetails = (ritualId) => {
    navigate(`/rituals/${ritualId}`); 
  };


  return (
    <div className="min-h-screen bg-vietnam-cream font-sans transition-all duration-300">
      {/* HERO SECTION - Đã chỉnh sửa */}
      <section 
        className="relative py-24 text-center overflow-hidden shadow-2xl"
        style={{
          backgroundImage: "url('/hero-background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Lớp overlay màu xanh mờ (opacity-70) */}
        <div className="absolute inset-0 bg-vietnam-green/70 backdrop-blur-[1px] transition-opacity duration-500"></div>

        {/* ⚠️ CHỖ CẦN CHỈNH: Điều chỉnh giới hạn chiều rộng cho nội dung hero */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-white"> 
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 drop-shadow-lg">Checklist Lễ Hội</h1>
          <p 
            className="text-base md:text-lg text-green-100 drop-shadow-md"
            // Giữ nguyên max-w-full để đảm bảo dòng chữ trắng vẫn giới hạn trong max-w-3xl
            // Chúng ta sẽ áp dụng giới hạn này cho thanh search
          >
            Nơi bạn có thể tìm, tạo và lưu các danh sách lễ vật hoặc hoạt động cần chuẩn bị cho từng lễ hội.
          </p>
        </div>

        {/* ⚠️ CHỖ CẦN CHỈNH: Phần tìm kiếm */}
        {/* Áp dụng giới hạn chiều rộng max-w-3xl giống như nội dung text, và thêm margin auto (mx-auto) */}
        <div className="relative z-10 mt-10 flex justify-center max-w-3xl mx-auto px-6 transition-transform duration-500 hover:scale-[1.02]">
          <input
            type="text"
            placeholder="Tìm lễ hội liên quan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // Thay đổi w-80 thành flex-grow để input chiếm hết không gian có thể
            className="flex-grow px-5 py-3 rounded-l-lg text-gray-800 border-none focus:outline-none focus:ring-4 focus:ring-vietnam-gold/50 shadow-lg"
          />
          <button
            onClick={() => alert('Tính năng tìm kiếm đang phát triển')}
            className="bg-vietnam-gold text-vietnam-green px-6 py-3 rounded-r-lg font-semibold hover:bg-yellow-600 transition duration-300 shadow-lg"
          >
            Tìm kiếm
          </button>
        </div>
      </section>

      {/* CHECKLIST MẪU */}
      <section className="py-12 max-w-6xl mx-auto px-6">

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-vietnam-green"></div>
          </div>
        ) : checklistsByRitual.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-vietnam-green mb-4">
                Chưa có checklist nào
              </h3>
              <p className="text-gray-600 mb-6">
                Hiện tại chưa có danh sách checklist nào trong hệ thống. 
                Vui lòng thử lại sau hoặc liên hệ quản trị viên.
              </p>
              <button
                onClick={fetchChecklists}
                className="bg-vietnam-green text-white px-6 py-3 rounded-lg hover:bg-vietnam-green/90 transition-colors"
              >
                🔄 Tải lại
              </button>
              <div className="mt-4">
                <a
                  href="/debug-checklist"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  🔍 Debug API (Kiểm tra lỗi)
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6"> 
            {checklistsByRitual.map((ritualChecklist) => (
              <div
                key={ritualChecklist.ritualId} 
                className="relative rounded-xl overflow-hidden shadow-2xl border border-amber-300/60 transition-transform duration-300 hover:scale-[1.03] hover:shadow-3xl"
                style={{
                  backgroundImage: "url('/checklist-background.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-white/65 backdrop-blur-[1px]"></div>

                {/* Nội dung checklist */}
                <div className="relative z-10 p-4 md:p-5 text-stone-800 text-sm flex flex-col h-full">
                  {/* Tiêu đề màu cam */}
                  <h3 className="text-xl font-bold text-amber-600 drop-shadow mb-4 border-b pb-2 border-amber-300/60">
                    {ritualChecklist.ritualName || 'Tên lễ hội'} 
                    <span className='ml-2 text-sm font-normal text-stone-700'>
                       ({ritualChecklist.items.length} mục)
                    </span>
                  </h3>
                  
                  {/* Danh sách mục */}
                  <div className="space-y-3 overflow-y-auto max-h-80 pr-2 flex-grow"> 
                      {ritualChecklist.items.map((item) => (
                        <div
                          key={item.checklistId} 
                          className="bg-white/70 p-3 rounded-lg shadow-sm border border-amber-200/70 transition-all duration-300 hover:bg-amber-100/80 hover:shadow-md"
                        >
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              id={`item-${item.checklistId}-${ritualChecklist.ritualId}`}
                              className="mt-1 h-5 w-5 accent-amber-600 border-amber-400 rounded focus:ring-amber-600 shrink-0 cursor-pointer"
                              readOnly
                            />
                            <label
                              htmlFor={`item-${item.checklistId}-${ritualChecklist.ritualId}`}
                              className="ml-3 text-stone-800 font-medium text-base flex-1 cursor-pointer"
                            >
                              {item.itemName} 
                              {item.quantity > 1 && (
                                  <span className="ml-2 text-xs px-1.5 py-[2px] rounded bg-amber-200/70 text-stone-800 border border-amber-300 whitespace-nowrap">
                                    x{item.quantity}
                                  </span>
                              )}
                            </label>
                          </div>
                          {item.checkNote && (
                            <p className="text-sm text-stone-600 italic mt-1 ml-8">
                              {item.checkNote}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                  
                  {/* Nút xem chi tiết lễ hội */}
                  <div className="mt-6 pt-4 border-t border-amber-300/60 text-center mt-auto">
                      <button
                          onClick={() => handleViewDetails(ritualChecklist.ritualId)} 
                          className="bg-vietnam-gold text-stone-800 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition duration-300 hover:shadow-md"
                      >
                          Xem chi tiết lễ hội
                      </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Checklist;