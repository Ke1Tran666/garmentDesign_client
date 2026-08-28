import AuthBackground from "@/features/auth/ui/AuthBackground";
import BackHomeButton from "@/shared/ui/button/BackHomeButton";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-brand font-brand">
      {/* BACKGROUND */}
      <AuthBackground />

      {/* CONTENT */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-8">
        <Outlet />
      </div>

      {/* BUTTON BACK HOME */}
      <BackHomeButton />
    </div>
  );
};

export default AuthLayout;
