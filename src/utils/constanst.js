// src/utils/constants.js (Hoặc đặt trực tiếp trong DashboardLayout.js)
export const DRAWER_OPEN_WIDTH = 240;
export const DRAWER_CLOSE_WIDTH = 110;

// Hook mô phỏng useBreakpoints (Chỉ cần kiểm tra màn hình nhỏ/lớn)
export const useScreenSize = () => {
  const isMobileScreen = window.innerWidth < 600; // Giả định SM breakpoint là 600px
  const down = (size) => size === 'sm' && isMobileScreen;
  return { down, isMobileScreen };
};