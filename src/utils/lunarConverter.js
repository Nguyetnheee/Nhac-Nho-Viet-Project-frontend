import * as LunarJS from 'lunar-javascript';
const { Lunar } = LunarJS;

/**
 * Chuyển đổi ngày dương lịch sang âm lịch
 * @param {string|Date|dayjs} solarDate - Ngày dương lịch (YYYY-MM-DD hoặc Date object hoặc dayjs object)
 * @returns {string} - Ngày âm lịch dạng "DD/MM/YYYY"
 */
export const convertSolarToLunar = (solarDate) => {
  if (!solarDate) return '';
  
  try {
    let date;
    
    // Xử lý các loại input khác nhau
    if (typeof solarDate === 'string') {
      date = new Date(solarDate);
    } else if (solarDate instanceof Date) {
      date = solarDate;
    } else if (solarDate && typeof solarDate.toDate === 'function') {
      // dayjs object
      date = solarDate.toDate();
    } else if (solarDate && solarDate.$d) {
      // dayjs object (alternative format)
      date = solarDate.$d;
    } else {
      return '';
    }
    
    // Kiểm tra date hợp lệ
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Chuyển đổi sang âm lịch
    const lunar = Lunar.fromDate(date);
    // Lấy số thay vì chữ Hán
    const day = lunar.getDay();
    const month = lunar.getMonth();
    const year = lunar.getYear();
    
    // Format: "DD/MM/YYYY" (ví dụ: "23/09/2025")
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  } catch (error) {
    console.error('Error converting solar to lunar:', error);
    return '';
  }
};

/**
 * Chuyển đổi ngày dương lịch sang âm lịch (format đầy đủ)
 * @param {string|Date|dayjs} solarDate - Ngày dương lịch
 * @returns {string} - Ngày âm lịch dạng "Ngày DD tháng MM năm YYYY"
 */
export const convertSolarToLunarFull = (solarDate) => {
  if (!solarDate) return '';
  
  try {
    let date;
    
    if (typeof solarDate === 'string') {
      date = new Date(solarDate);
    } else if (solarDate instanceof Date) {
      date = solarDate;
    } else if (solarDate && typeof solarDate.toDate === 'function') {
      date = solarDate.toDate();
    } else if (solarDate && solarDate.$d) {
      date = solarDate.$d;
    } else {
      return '';
    }
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const lunar = Lunar.fromDate(date);
    // Lấy số thay vì chữ Hán
    const day = lunar.getDay();
    const month = lunar.getMonth();
    const year = lunar.getYear();
    
    return `Ngày ${String(day).padStart(2, '0')} tháng ${String(month).padStart(2, '0')} năm ${year}`;
  } catch (error) {
    console.error('Error converting solar to lunar:', error);
    return '';
  }
};

