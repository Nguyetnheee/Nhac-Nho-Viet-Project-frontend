import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { cart, loading } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const getCartItemCount = () => {
    if (!cart?.items || loading) return 0;
    return cart.items.length;
  };

  return (
    <nav className="bg-vietnam-red shadow-lg relative z-50">
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
                className="text-white hover:text-vietnam-gold px-3 py-2 rounded-md text-sm font-medium"
              >
                Checklist
              </Link>
            )}
            <Link
              to="/trays"
              className="text-white hover:text-vietnam-gold px-3 py-2 rounded-md text-sm font-medium"
            >
              Mâm cúng
            </Link>
            <Link
              to="/cart"
              className="text-white hover:text-vietnam-gold px-3 py-2 rounded-md text-sm font-medium relative"
            >
              Giỏ hàng
              {!loading && getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-vietnam-gold text-vietnam-red text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </Link>

            {/* User Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="text-white hover:text-vietnam-gold px-3 py-2 rounded-md text-sm font-medium"
                >
                  Tài khoản
                </Link>

                {user?.role === "Admin" && (
                  <Link
                    to="/admin"
                    className="text-white hover:text-vietnam-gold"
                  >
                    Quản trị
                  </Link>
                )}
                {user?.role === "Staff" && (
                  <Link
                    to="/staff"
                    className="text-white hover:text-vietnam-gold"
                  >
                    Quản lý cửa hàng
                  </Link>
                )}
                {user?.role === "Shipper" && (
                  <Link
                    to="/shipper"
                    className="text-white hover:text-vietnam-gold"
                  >
                    Giao hàng
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-vietnam-gold text-vietnam-red px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors"
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
                  className="bg-vietnam-gold text-vietnam-red px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-600 transition"
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
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-vietnam-red px-4 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="block text-white hover:text-vietnam-gold"
          >
            Trang chủ
          </Link>
          <Link
            to="/rituals"
            onClick={() => setIsMenuOpen(false)}
            className="block text-white hover:text-vietnam-gold"
          >
            Tra cứu lễ
          </Link>
          <Link
            to="/trays"
            onClick={() => setIsMenuOpen(false)}
            className="block text-white hover:text-vietnam-gold"
          >
            Mâm cúng
          </Link>
          <Link
            to="/cart"
            onClick={() => setIsMenuOpen(false)}
            className="block text-white hover:text-vietnam-gold"
          >
            Giỏ hàng ({getCartItemCount()})
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="block text-white hover:text-vietnam-gold"
              >
                Tài khoản
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left text-white hover:text-vietnam-gold"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block text-white hover:text-vietnam-gold"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="block text-white hover:text-vietnam-gold"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
