// src/helpers/format-functions.js

// Hàm định dạng tiền tệ cho VNĐ
export const currencyFormat = (amount, options = {}) => {
    // Dùng locale 'vi-VN' và currency 'VND'
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency',
        currency: 'VND',
        // VNĐ không dùng số thập phân, nên đặt minimumFractionDigits là 0
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0,
    }).format(amount);
};