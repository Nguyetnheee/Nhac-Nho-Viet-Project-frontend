// src/helpers/format-functions.js

// Hàm định dạng tiền tệ cho VNĐ
export const currencyFormat = (amount, options = {}) => {
    // Format số với dấu phân cách hàng nghìn và thêm VNĐ
    const validAmount = Number(amount);
    if (isNaN(validAmount)) {
        return '0 VNĐ';
    }
    return new Intl.NumberFormat('vi-VN').format(validAmount) + ' VNĐ';
};