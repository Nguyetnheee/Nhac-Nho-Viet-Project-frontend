import React from "react";
import { Outlet } from "react-router-dom"; 
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ChecklistProvider } from "./contexts/ChecklistContext";
import { ToastProvider } from "./components/ToastContainer";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ChecklistProvider>
          <CartProvider>
            {/* Layout chung của toàn bộ website */}
            <div className="min-h-screen flex flex-col">
              {/*Navbar hiển thị trên mọi trang */}
              <Navbar />

              {/*Nội dung các trang sẽ được nhét vào đây */}
              <main className="flex-grow">
                <Outlet />
              </main>

              {/*Footer hiển thị trên mọi trang */}
              <Footer />
            </div>
          </CartProvider>
        </ChecklistProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
