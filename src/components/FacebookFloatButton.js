import React, { useState } from 'react';

const FacebookFloatButton = () => {
  const [showTooltip, setShowTooltip] = useState(true);
  
  // URL Facebook fanpage của Nhắc Nhớ Việt
  const facebookUrl = 'https://www.facebook.com/profile.php?id=61582970296339';

  const handleClick = () => {
    // Mở Facebook trong tab mới
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
    // Ẩn tooltip sau khi click
    setShowTooltip(false);
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px',
      }}
    >
      {/* Speech Bubble (Ô thoại) */}
      {showTooltip && (
        <div
          className="speech-bubble"
          style={{
            backgroundColor: 'white',
            color: '#1877F2', // Màu xanh dương Facebook
            padding: '12px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '200px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            position: 'relative',
            marginBottom: '8px',
            animation: 'fadeInSlide 0.5s ease-out',
            border: '1px solid rgba(24, 119, 242, 0.2)',
          }}
        >
          Khám phá thêm về Nhắc Nhớ Việt tại đây
          {/* Mũi tên chỉ về phía icon (bên phải) */}
          <div
            style={{
              position: 'absolute',
              right: '-8px',
              bottom: '20px',
              width: 0,
              height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: '8px solid white',
              filter: 'drop-shadow(2px 0 2px rgba(0, 0, 0, 0.1))',
            }}
          />
          {/* Nút đóng nhỏ */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            style={{
              position: 'absolute',
              top: '4px',
              right: '8px',
              background: 'rgba(24, 119, 242, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              color: '#1877F2',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              lineHeight: '1',
              padding: 0,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(24, 119, 242, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(24, 119, 242, 0.1)';
            }}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
      )}

      {/* Facebook Icon Button */}
      <div
        onClick={handleClick}
        className="cursor-pointer group"
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
        aria-label="Liên hệ Facebook Nhắc Nhớ Việt"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <img
          src="/icons8-facebook-96.png"
          alt="Facebook Nhắc Nhớ Việt"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%',
          }}
        />
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default FacebookFloatButton;

