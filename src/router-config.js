import { createBrowserRouter } from "react-router-dom";
import App from "./App";

import Home from "./pages/Home";
import RitualLookup from "./pages/RitualLookup";
import RitualDetail from "./pages/RitualDetail";
import TrayCatalog from "./pages/TrayCatalog";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import ShipperPanel from "./pages/ShipperPanel";
import StaffDashboard from "./pages/StaffDashboard";
import Checklist from "./pages/Checklist";
import TestLogin from "./pages/TestLogin";

import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Public pages
      { index: true, element: <Home /> },
      { path: "rituals", element: <RitualLookup /> },
      { path: "rituals/:id", element: <RitualDetail /> },
      { path: "ritual/:id", element: <RitualDetail /> },
      { path: "trays", element: <TrayCatalog /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element: <Checkout /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "verify-otp", element: <VerifyOTP /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "test-login", element: <TestLogin /> },

      // Protected pages
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute roles={["Admin"]}>
            <AdminPanel />
          </ProtectedRoute>
        ),
      },
      {
        path: "shipper",
        element: (
          <ProtectedRoute roles={["Shipper"]}>
            <ShipperPanel />
          </ProtectedRoute>
        ),
      },
      {
        path: "staff",
        element: (
          <ProtectedRoute roles={["Staff", "Admin"]}>
            <StaffDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "checklist",
        element: (
          <ProtectedRoute>
            <Checklist />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
