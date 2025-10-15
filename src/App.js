import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { router } from './router-config';
import { ToastProvider } from './components/ToastContainer';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import RitualLookup from './pages/RitualLookup';
import RitualDetail from './pages/RitualDetail';
import TrayCatalog from './pages/TrayCatalog';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import ShipperPanel from './pages/ShipperPanel';
import TestLogin from './pages/TestLogin';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/rituals" element={<RitualLookup />} />
                <Route path="/rituals/:id" element={<RitualDetail />} />
                <Route path="/trays" element={<TrayCatalog />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/test-login" element={<TestLogin />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute roles={['Admin']}>
                    <AdminPanel />
                  </ProtectedRoute>
                } />
                <Route path="/shipper" element={
                  <ProtectedRoute roles={['Shipper']}>
                    <ShipperPanel />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
          </Router>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
