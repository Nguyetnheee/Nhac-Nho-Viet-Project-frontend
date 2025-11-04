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
import Notifications from "./pages/Notifications";
import AdminPanel from "./pages/AdminPanel";
import ShipperPanel from "./pages/ShipperPanel";
import StaffDashboard from "./pages/StaffDashboard";
import Checklist from "./pages/Checklist";
import PaymentResult from "./pages/PaymentResult";
import OrderSuccess from "./pages/OrderSuccess";
import PendingOrderDetail from "./pages/PendingOrderDetail";

// Demo Pages
import ToastDemo from "./pages/ToastDemo";
import ToastColorDemo from "./components/ToastColorDemo";
import CustomAlertDemo from "./components/CustomAlertDemo";
import AlertTestPage from "./pages/AlertTestPage";
import CSSVerificationPage from "./pages/CSSVerificationPage";
import DebugOrders from "./pages/DebugOrders";
import TestTokenDebug from "./pages/TestTokenDebug";
import DebugRitualDetail from "./pages/DebugRitualDetail";
import DebugChecklist from "./pages/DebugChecklist";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./pages/staff/AdminLogin";

export const router = createBrowserRouter(
  [
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

      // Demo Routes - For testing and development
      {
        path: "toast-demo",
        element: <ToastDemo />
      },
      {
        path: "toast-colors",
        element: <ToastColorDemo />
      },
      {
        path: "custom-alerts",
        element: <CustomAlertDemo />
      },
      {
        path: "alert-test",
        element: <AlertTestPage />
      },
      {
        path: "css-verification",
        element: <CSSVerificationPage />
      },
      {
        path: "debug-orders",
        element: <DebugOrders />
      },
      {
        path: "debug-token",
        element: <TestTokenDebug />
      },
      {
        path: "debug-ritual/:id",
        element: <DebugRitualDetail />
      },
      {
        path: "debug-checklist",
        element: <DebugChecklist />
      },

      // Customer Only Routes
      {
        path: "cart",
        element: (
          <ProtectedRoute roles={["CUSTOMER"]}>
            <Cart />
          </ProtectedRoute>
        )
      },
      {
        path: "checkout",
        element: (
          <ProtectedRoute roles={["CUSTOMER"]}>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: "payment-result",
        element: (
          <ProtectedRoute roles={["CUSTOMER"]}>
            <PaymentResult />
          </ProtectedRoute>
        ),
      },
      {
        path: "payment/success",
        element: (
          <ProtectedRoute roles={["CUSTOMER"]}>
            <PaymentResult />
          </ProtectedRoute>
        ),
      },
      {
        path: "payment/cancel",
        element: (
          <ProtectedRoute roles={["CUSTOMER"]}>
            <PaymentResult />
          </ProtectedRoute>
        ),
      },
      {
        path: "order-success/:orderId",
        element: (
          <ProtectedRoute roles={["CUSTOMER"]}>
            <OrderSuccess />
          </ProtectedRoute>
        ),
      },
      {
        path: "order-success",
        element: (
          <ProtectedRoute roles={["CUSTOMER"]}>
            <OrderSuccess />
          </ProtectedRoute>
        ),
      },
      {
        path: "pending-order/:orderId",
        element: (
          <ProtectedRoute roles={["CUSTOMER"]}>
            <PendingOrderDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "pending-order",
        element: (
          <ProtectedRoute roles={["CUSTOMER"]}>
            <PendingOrderDetail />
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
      {
        path: "notifications",
        element: (
          <ProtectedRoute roles={["CUSTOMER"]}>
            <Notifications />
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

      // Admin Login Route - For Admin, Staff & Shipper
      {
        path: "admin-login",
        element: <AdminLogin />
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
],
{
  future: {
    v7_startTransition: true,
  },
}
);