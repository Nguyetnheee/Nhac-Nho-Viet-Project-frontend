import { createBrowserRouter } from "react-router-dom";
import App from "./App";

// Public Pages
import Home from "./pages/Home";
import RitualLookup from "./pages/RitualLookup";
import RitualDetail from "./pages/RitualDetail";
import TrayCatalog from "./pages/TrayCatalog";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Authentication Pages
import VerifyOTP from "./pages/VerifyOTP";
import VerifyResetOTP from "./pages/VerifyResetOTP";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Protected Pages
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import ShipperPanel from "./pages/ShipperPanel";
import StaffDashboard from "./pages/StaffDashboard";
import Checklist from "./pages/Checklist";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Public Routes - No authentication needed
      { 
        path: "login", 
        element: <Login /> 
      },
      { 
        path: "register", 
        element: <Register /> 
      },
      { 
        path: "verify-otp", 
        element: <VerifyOTP /> 
      },
      { 
        path: "forgot-password", 
        element: <ForgotPassword /> 
      },
      { 
        path: "verify-reset", 
        element: <VerifyResetOTP /> 
      },
      { 
        path: "reset-password", 
        element: <ResetPassword /> 
      },

      // Customer & Public Access Routes
      {
        index: true,
        element: <Home />,  // Home page is now public
      },
      {
        path: "rituals",
        element: <RitualLookup />,  // Make public - no authentication required
      },
      {
        path: "rituals/:id",
        element: <RitualDetail />,  // Make public - no authentication required
      },
      {
        path: "trays",
        element: <TrayCatalog />,  // Make public - browse products without login
      },
      {
        path: "trays/:id",
        element: <ProductDetail />,  // Make public - view product details without login
      },

      // Customer Only Routes
      {
        path: "cart",
        element: (
          <ProtectedRoute roles={["Customer"]}>
            <Cart />
          </ProtectedRoute>
        ),
      },
      {
        path: "checkout",
        element: (
          <ProtectedRoute roles={["Customer"]}>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute roles={["CUSTOMER", "STAFF", "ADMIN", "SHIPPER"]}>
            <Profile />
          </ProtectedRoute>
        ),
      },

      // Staff Only Route
      {
        path: "staff-dashboard",
        element: (
          <ProtectedRoute roles={["STAFF"]}>
            <StaffDashboard />
          </ProtectedRoute>
        ),
      },

      // Admin Only Route
      {
        path: "admin-dashboard",
        element: (
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminPanel />
          </ProtectedRoute>
        ),
      },

      // Shipper Only Route
      {
        path: "shipper-dashboard",
        element: (
          <ProtectedRoute roles={["SHIPPER"]}>
            <ShipperPanel />
          </ProtectedRoute>
        ),
      },

      // Shared Protected Routes
      {
        path: "checklist",
        element: (
          <ProtectedRoute roles={["CUSTOMER", "STAFF", "ADMIN", "SHIPPER"]}>
            <Checklist />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);