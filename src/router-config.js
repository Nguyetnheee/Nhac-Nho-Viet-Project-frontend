import Home from "./pages/Home";
import RitualDetail from "./pages/RitualDetail";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";

export const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  },
  routes: [
    {
      path: "/",
      element: <Home />
    },
    {
      path: "/ritual/:id",
      element: <RitualDetail />
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />
    },
    {
      path: "/verify-otp",
      element: <VerifyOTP />
    },
    {
      path: "/reset-password",
      element: <ResetPassword />
    }
  ]
};