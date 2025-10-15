import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
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
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-vietnam-gold text-vietnam-red text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-white hover:text-vietnam-gold px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <span>{user?.name}</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Thông tin cá nhân
                    </Link>
                    {user?.role === 'Admin' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Quản trị
                      </Link>
                    )}
                    {user?.role === 'Shipper' && (
                      <Link
                        to="/shipper"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Giao hàng
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
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
              Giỏ hàng ({getTotalItems()})
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
