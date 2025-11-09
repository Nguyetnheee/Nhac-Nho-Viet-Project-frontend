import React, { useState, useEffect } from "react";

const VoucherBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Kiểm tra localStorage xem banner đã được đóng chưa
    const isDismissed = localStorage.getItem("voucherBannerDismissed");
    
    // Nếu chưa được đóng, hiển thị banner sau một chút delay để có animation
    if (!isDismissed) {
      setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
        // Chặn scroll khi modal mở
        document.body.style.overflow = "hidden";
      }, 300);
    }

    // Cleanup: khôi phục scroll khi component unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleClose = () => {
    // Animation đóng
    setIsAnimating(false);
    // Khôi phục scroll
    document.body.style.overflow = "unset";
    setTimeout(() => {
      // Lưu vào localStorage khi người dùng đóng banner
      localStorage.setItem("voucherBannerDismissed", "true");
      setIsVisible(false);
    }, 300);
  };

  const handleBackdropClick = (e) => {
    // Chỉ đóng khi click vào backdrop, không đóng khi click vào modal
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Không hiển thị nếu đã đóng
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop overlay tối */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal pop-up ở giữa */}
      <div
        className={`relative z-10 max-w-[90%] md:max-w-[600px] lg:max-w-[700px] transition-all duration-300 transform ${
          isAnimating ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Image Container */}
        <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden">
          <img
            src="/voucher-banner.png"
            alt="Voucher Banner"
            className="w-full h-auto object-contain"
          />
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 md:top-3 md:right-3 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 z-20"
            aria-label="Đóng banner"
            title="Đóng"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 md:h-6 md:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherBanner;

