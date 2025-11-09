import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-vietnam-green text-white ritual-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className=" bg-vietnam-gold rounded-full flex items-center justify-center">
                {/* <span className="text-vietnam-green font-bold text-lg">N</span> */}
                <img src={`${process.env.PUBLIC_URL}/android-icon-192x192.png`} alt="Nhắc Nhớ Việt" className="w-20 rounded-full object-cover border-2 border-vietnam-gold shadow-sm" />

              </div>
              <span className="font-serif text-xl font-bold">Nhắc Nhớ Việt</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Nền tảng tra cứu lễ hội và đặt mâm cúng truyền thống Việt Nam. 
              Giữ gìn và phát huy những giá trị văn hóa dân tộc.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-vietnam-gold transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/rituals" className="text-gray-300 hover:text-vietnam-gold transition-colors">
                  Tra cứu lễ
                </Link>
              </li>
              <li>
                <Link to="/trays" className="text-gray-300 hover:text-vietnam-gold transition-colors">
                  Mâm cúng
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-vietnam-gold transition-colors">
                  Giỏ hàng
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-gray-300 hover:text-vietnam-gold transition-colors">
                  Tin tức
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-gray-300 hover:text-vietnam-gold transition-colors">
                  Chính sách
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 Nhắc Nhớ Việt</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
