import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { cart, loading } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const getCartItemCount = () => {
    if (!cart?.items || loading) return 0;
    return cart.items.length;
  };

  return (
    <nav className="bg-vietnam-red shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-vietnam-gold rounded-full flex items-center justify-center">
                <span className="text-vietnam-red font-bold text-lg">N</span>
              </div>
              <span className="text-white font-serif text-xl font-bold">
                Nhắc Nhớ Việt
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-white hover:text-vietnam-gold px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Trang chủ
            </Link>
            <Link
              to="/rituals"
              className="text-white hover:text-vietnam-gold px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Tra cứu lễ
            </Link>
            {isAuthenticated && (
              <Link
                to="/checklist"
                className="text-white hover:text-vietnam-gold px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Checklist
              </Link>
            )}
            <Link
              to="/trays"
              className="text-white hover:text-vietnam-gold px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Mâm cúng
            </Link>
              <Link
              to="/cart"
              className="text-white hover:text-vietnam-gold px-3 py-2 rounded-md text-sm font-medium transition-colors relative"
            >
              Giỏ hàng
              {!loading && getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-vietnam-gold text-vietnam-red text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="text-white hover:text-vietnam-gold px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Tài khoản
                </Link>
                
                {user?.role === 'Admin' && (
                  <Link
                    to="/admin"
                    className="text-white hover:text-vietnam-gold transition-colors"
                  >
                    Quản trị
                  </Link>
                )}
                {user?.role === 'Staff' && (
                  <Link
                    to="/staff"
                    className="text-white hover:text-vietnam-gold transition-colors"
                  >
                    Quản lý cửa hàng
                  </Link>
                )}
                {user?.role === 'Shipper' && (
                  <Link
                    to="/shipper"
                    className="text-white hover:text-vietnam-gold transition-colors"
                  >
                    Giao hàng
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="bg-vietnam-gold text-vietnam-red px-4 py-2 rounded-md text-sm font-medium hover:bg-vietnam-gold/90 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:text-vietnam-gold px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-vietnam-gold text-vietnam-red px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-vietnam-gold focus:outline-none focus:text-vietnam-gold"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden relative z-50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-vietnam-red">
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
            <Link
              to="/cart"
              className="text-white hover:text-vietnam-gold block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Giỏ hàng ({getCartItemCount()})
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="text-white hover:text-vietnam-gold block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Thông tin cá nhân
                </Link>
                {user?.role === 'Admin' && (
                  <Link
                    to="/admin"
                    className="text-white hover:text-vietnam-gold block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Quản trị
                  </Link>
                )}
                {user?.role === 'Shipper' && (
                  <Link
                    to="/shipper"
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
