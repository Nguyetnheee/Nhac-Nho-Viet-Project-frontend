import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MenuOutlined } from '@ant-design/icons';
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import NotificationBell from "./NotificationBell";
import * as cartService from "../services/cartService";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItems, loading, getTotalItems } = useCart(); // ✅ Lấy getTotalItems từ context
  const [cartCount, setCartCount] = useState(0);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  // ✅ Không cần fetch nữa, lấy trực tiếp từ context
  useEffect(() => {
    if (isAuthenticated && user?.role === 'CUSTOMER') {
      // Lấy số lượng từ context thay vì gọi API
      const count = getTotalItems ? getTotalItems() : cartItems?.length || 0;
      setCartCount(count);
    } else {
      setCartCount(0);
    }
  }, [cartItems, loading, isAuthenticated, user, getTotalItems]); // ✅ Thêm dependencies

  return (
    <nav className="bg-vietnam-green shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={`${process.env.PUBLIC_URL}/favicon-96x96.png`}
              alt="Nhắc Nhớ Việt"
              className="w-10 h-10 rounded-full object-cover border-2 border-vietnam-gold shadow-sm"
            />
            <span className="text-white font-serif text-xl font-bold">
              Nhắc Nhớ Việt
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-white hover:text-vietnam-gold px-3 py-2 rounded-md text-sm font-medium"
            >
              Trang chủ
            </Link>
            <Link
              to="/rituals"
              className="text-white hover:text-vietnam-gold px-3 py-2 rounded-md text-sm font-medium"
            >
              Tra cứu lễ
            </Link>
            {isAuthenticated && (
              <Link
                to="/checklist"
                className="text-white hover:text-vietnam-gold px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Danh mục
              </Link>
            )}
            <Link
              to="/trays"
              className="text-white hover:text-vietnam-gold px-3 py-2 rounded-md text-sm font-medium"
            >
              Mâm cúng
            </Link>
            {isAuthenticated && (
              <Link
                to="/cart"
                className="text-white hover:text-vietnam-gold px-3 py-2 rounded-md text-sm font-medium relative"
              >
                Giỏ hàng
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user?.role === 'ROLE_CUSTOMER' && <NotificationBell />}
                <Link
                  to="/profile"
                  className="text-white hover:text-vietnam-gold px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Tài khoản
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin-dashboard"
                    className="text-white hover:text-vietnam-gold transition-colors"
                  >
                    Quản trị
                  </Link>
                )}
                {user?.role === 'SHIPPER' && (
                  <Link
                    to="/shipper-dashboard"
                    className="text-white hover:text-vietnam-gold transition-colors"
                  >
                    Giao hàng
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-vietnam-gold text-vietnam-green px-4 py-2 rounded-md text-sm font-medium hover:bg-vietnam-gold/90 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:text-vietnam-gold text-sm font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-vietnam-gold text-vietnam-green px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-600 transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-vietnam-gold focus:outline-none"
            >
              <MenuOutlined className="text-2xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden relative z-50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-vietnam-green">
            <Link
              to="/"
              className="text-white hover:text-vietnam-gold block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              to="/rituals"
              className="text-white hover:text-vietnam-gold block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Tra cứu lễ
            </Link>
            <Link
              to="/trays"
              className="text-white hover:text-vietnam-gold block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Mâm cúng
            </Link>
            {isAuthenticated && (
              <Link
                to="/checklist"
                className="text-white hover:text-vietnam-gold block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Danh mục
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/cart"
                className="text-white hover:text-vietnam-gold block px-3 py-2 rounded-md text-base font-medium relative"
                onClick={() => setIsMenuOpen(false)}
              >
                Giỏ hàng
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="text-white hover:text-vietnam-gold block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Thông tin cá nhân
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin-dashboard"
                    className="text-white hover:text-vietnam-gold block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Quản trị
                  </Link>
                )}
                {user?.role === 'SHIPPER' && (
                  <Link
                    to="/shipper-dashboard"
                    className="text-white hover:text-vietnam-gold block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Giao hàng
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-vietnam-gold block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-vietnam-gold block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="text-white hover:text-vietnam-gold block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
