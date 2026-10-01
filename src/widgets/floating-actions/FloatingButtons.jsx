import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, LogIn, User, Settings, LogOut } from "lucide-react";
import SettingsModal from "@/features/settings/ui/SettingsModal";
import { ButtonIcon } from "@/shared/ui/button/Button";
import { useAuth } from "@/features/auth/model/useAuth";
import { getAccountPathByRole } from "@/features/auth/lib/authRole";

const FloatingButtons = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  const menuRef = useRef(null);

  const navigate = useNavigate();

  const { user, loading, logout } = useAuth();

  const isLoggedIn = Boolean(user);

  const accountPath = isLoggedIn ? getAccountPathByRole(user.role) : "/login";

  // Detect thiết bị có touch (mobile/tablet) hay không
  const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches;

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent =
        documentHeight > 0 ? Math.round((scrollTop / documentHeight) * 100) : 0;
      setScrollPercent(percent);
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── Đóng menu khi touch ra ngoài (chỉ cần thiết trên mobile) ─────────────
  useEffect(() => {
    const handleOutside = (e) => {
      if (
        isTouchDevice() &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("touchstart", handleOutside);
    return () => document.removeEventListener("touchstart", handleOutside);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Desktop: hover mở menu, click navigate ngay ──────────────────────────
  const handleMouseEnter = () => {
    if (!isTouchDevice()) setMenuOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice()) setMenuOpen(false);
  };

  const handleMainButtonClick = () => {
    if (loading) return;

    if (isTouchDevice()) {
      /*
       * Mobile: lần đầu mở menu,
       * lần thứ hai mới chuyển trang.
       */
      if (!menuOpen) {
        setMenuOpen(true);
        return;
      }

      setMenuOpen(false);
      navigate(accountPath);

      return;
    }

    /*
     * Desktop: nhấn nút chuyển trang.
     */
    navigate(accountPath);
  };

  const handleLogout = async () => {
    setMenuOpen(false);

    try {
      await logout();
    } finally {
      navigate("/", {
        replace: true,
      });
    }
  };

  return (
    <>
      <div className="fixed right-6 bottom-6 z-50 flex items-end gap-3">
        {/* LOGIN / PROFILE MENU */}
        <div
          ref={menuRef}
          className="relative h-35 w-35"
          onMouseLeave={handleMouseLeave}
        >
          {/* SETTING BUTTON */}
          <ButtonIcon
            icon={Settings}
            sizeIcon={18}
            onClick={() => {
              setMenuOpen(false);
              setOpenSettings(true);
            }}
            className={`absolute top-2 right-2 border border-border bg-surface! text-text-strong! hover:bg-foreground! hover:text-white! ${
              menuOpen
                ? "pointer-events-auto scale-100 opacity-100"
                : "pointer-events-none scale-50 opacity-0"
            } `}
          />

          {/* LOGOUT BUTTON */}
          {isLoggedIn && (
            <ButtonIcon
              icon={LogOut}
              sizeIcon={18}
              onClick={handleLogout}
              className={`absolute bottom-2 left-2 bg-danger! text-white! hover:bg-danger/90! ${
                menuOpen
                  ? "pointer-events-auto scale-100 opacity-100"
                  : "pointer-events-none scale-50 opacity-0"
              } `}
            />
          )}

          {/* TOOLTIP */}
          <div
            className={`pointer-events-none absolute -right-1 bottom-14 rounded-md bg-foreground! px-3 py-1 text-xs font-medium whitespace-nowrap text-white! shadow-lg transition-all duration-300 ${
              menuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            } `}
          >
            {loading ? "Checking..." : isLoggedIn ? "Profile" : "Login"}
          </div>

          {/* MAIN BUTTON */}
          <ButtonIcon
            icon={isLoggedIn ? User : LogIn}
            sizeIcon={20}
            disabled={loading}
            onMouseEnter={handleMouseEnter}
            onClick={handleMainButtonClick}
            className="absolute right-0 bottom-0 h-12 w-12 bg-foreground! text-white"
          />
        </div>

        {/* SCROLL TOP */}
        <div
          className={`relative transition-all duration-300 ${
            showScrollTop
              ? "pointer-events-auto w-12 translate-x-0 opacity-100"
              : "pointer-events-none w-0 translate-x-5 opacity-0"
          }`}
        >
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-semibold text-text-strong">
            {scrollPercent}%
          </div>
          <ButtonIcon
            icon={ArrowUp}
            sizeIcon={20}
            onClick={handleScrollToTop}
            className="h-12 w-12 bg-brand! text-white"
          />
        </div>
      </div>

      <SettingsModal
        open={openSettings}
        onClose={() => setOpenSettings(false)}
      />
    </>
  );
};

export default FloatingButtons;
