# Toast Notification System

## Tổng quan
Hệ thống Toast đã được tích hợp với Ant Design Alert component để hiển thị thông báo đẹp mắt và nhất quán trên toàn bộ ứng dụng.

## Tính năng

### 4 loại thông báo
- **Success** (Thành công) - Màu xanh lá
- **Error** (Lỗi) - Màu đỏ  
- **Warning** (Cảnh báo) - Màu vàng
- **Info** (Thông tin) - Màu xanh dương

### Đặc điểm
- ✅ Icon tự động theo loại thông báo
- ✅ Có thể đóng thủ công với nút X
- ✅ Tự động biến mất sau thời gian được cài đặt
- ✅ Animation mượt mà khi xuất hiện
- ✅ Responsive trên mobile
- ✅ Hỗ trợ cả message ngắn và description chi tiết
- ✅ Thời gian hiển thị tùy chỉnh cho mỗi loại

## Cách sử dụng

### 1. Import hook
```javascript
import { useToast } from '../components/ToastContainer';
```

### 2. Sử dụng trong component
```javascript
const YourComponent = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  // Chỉ với message
  const handleSuccess = () => {
    showSuccess('Lưu thành công!');
  };

  // Với message và description
  const handleError = () => {
    showError(
      'Lỗi hệ thống!', 
      'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'
    );
  };

  // Với thời gian tùy chỉnh (milliseconds)
  const handleWarning = () => {
    showWarning(
      'Cảnh báo!', 
      'Vui lòng kiểm tra lại thông tin.', 
      3000 // 3 giây
    );
  };

  // ...rest of component
};
```

### 3. Thời gian hiển thị mặc định
- **Success**: 4 giây
- **Info**: 4 giây  
- **Warning**: 5 giây
- **Error**: 6 giây

## Ví dụ thực tế

### Login thành công
```javascript
showSuccess('Đăng nhập thành công!', 'Chào mừng bạn trở lại.');
```

### Validation lỗi
```javascript
showError('Dữ liệu không hợp lệ!', 'Email hoặc mật khẩu không đúng định dạng.');
```

### Cảnh báo trước khi xóa
```javascript
showWarning('Cảnh báo!', 'Hành động này không thể hoàn tác.');
```

### Thông tin hướng dẫn
```javascript
showInfo('Mẹo!', 'Bạn có thể sử dụng phím tắt Ctrl+S để lưu nhanh.');
```

## Vị trí hiển thị
Toast sẽ xuất hiện ở góc phải trên màn hình và tự động stack theo chiều dọc.

## Styling
- Sử dụng gradient background cho mỗi loại
- Box shadow và border-left để phân biệt
- Hover effect nâng nhẹ toast
- Animation slide-in từ phải sang trái

## Demo
Để xem demo, truy cập trang `/staff-login` và sử dụng các button demo ở cuối form đăng nhập.

## Tích hợp hiện tại
- ✅ `StaffLogin.js` - Thông báo đăng nhập/lỗi
- ✅ Wrapped trong `App.js` với `ToastProvider`
- 🔄 Có thể tích hợp vào các trang khác như Cart, Profile, AdminPanel, etc.

## File liên quan
- `src/components/ToastContainer.js` - Component chính
- `src/components/ToastContainer.css` - Styling
- `src/pages/ToastDemo.js` - Demo page (optional)
- `src/pages/staff/StaffLogin.js` - Ví dụ tích hợp