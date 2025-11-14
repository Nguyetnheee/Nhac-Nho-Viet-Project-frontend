import React from "react";
// ⚠️ Import useLocation
import { Outlet, useLocation } from "react-router-dom"; 
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ChecklistProvider } from "./contexts/ChecklistContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ToastProvider } from "./components/ToastContainer";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import VoucherBanner from "./components/VoucherBanner";
import FacebookFloatButton from "./components/FacebookFloatButton";

function App() {
  // ⚠️ Khai báo useLocation
  const location = useLocation();
  const { pathname } = location;

  // ⚠️ Logic kiểm tra: Ẩn Navbar/Footer nếu route là Dashboard/Panel
  const isDashboardRoute = 
    pathname.startsWith('/admin-dashboard') ||
    pathname.startsWith('/manager-dashboard') ||
    pathname.startsWith('/staff-dashboard') ||
    pathname.startsWith('/shipper-dashboard') ||
    pathname.startsWith('/admin-login');

  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <ChecklistProvider>
            <CartProvider>
              {/* Layout chung của toàn bộ website */}
              <div className="min-h-screen flex flex-col">
                
                {/* Voucher Banner hiển thị nếu KHÔNG phải là trang Dashboard */}
                {!isDashboardRoute && <VoucherBanner />}
                
                {/* Navbar hiển thị nếu KHÔNG phải là trang Dashboard */}
                {!isDashboardRoute && <Navbar />}

                {/* Nội dung các trang sẽ được nhét vào đây */}
                <main className={`flex-grow ${isDashboardRoute ? 'mt-0' : 'pt-0'}`}>
                  <Outlet />
                </main>

                {/* Footer hiển thị nếu KHÔNG phải là trang Dashboard */}
                {!isDashboardRoute && <Footer />}
                
                {/* Facebook Float Button - chỉ hiển thị trên trang customer */}
                {!isDashboardRoute && <FacebookFloatButton />}
              </div>
            </CartProvider>
          </ChecklistProvider>
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;