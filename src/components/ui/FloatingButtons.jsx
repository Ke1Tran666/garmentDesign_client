import { useEffect, useRef, useState } from "react";
import { ArrowUp, LogIn, User, Settings, LogOut } from "lucide-react";
import SettingsModal from "./Settings/SettingsModal";
import { ButtonIcon } from "./Button/Button";
import { authStorage } from "@/lib/authStorage";
import { getAccountPathByRole } from "@/lib/authRole";

const FloatingButtons = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [scrollPercent, setScrollPercent] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);

    const menuRef = useRef(null);
    // local database
    const token = authStorage.getToken();
    const idUser = authStorage.getUserId();
    const role = authStorage.getRole();

    const isLoggedIn = Boolean( token && idUser);

    const accountPath = isLoggedIn ? getAccountPathByRole(role) : "/login";

    // Detect thiết bị có touch (mobile/tablet) hay không
    const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches;

    // Scroll tracking
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const documentHeight =
                document.documentElement.scrollHeight - window.innerHeight;
            const percent =
                documentHeight > 0
                    ? Math.round((scrollTop / documentHeight) * 100)
                    : 0;
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
        if (isTouchDevice()) {
            // Mobile: lần đầu mở menu,
            // lần thứ hai mới chuyển trang.
            if (!menuOpen) {
            setMenuOpen(true);
            return;
            }

            setMenuOpen(false);
            window.location.href = accountPath;

            return;
        }

    // Desktop: nhấn nút sẽ chuyển trang.
    window.location.href = accountPath;
    };

    const handleLogout = () => {
        authStorage.clear();
        window.location.reload();
    };

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">

                {/* LOGIN / PROFILE MENU */}
                <div
                    ref={menuRef}
                    className="relative w-35 h-35"
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
                        className={`
                            absolute top-2 right-2
                            border border-border
                            bg-surface! text-text-strong!
                            hover:bg-foreground! hover:text-white!
                            ${menuOpen
                            ? "opacity-100 scale-100 pointer-events-auto"
                            : "opacity-0 scale-50 pointer-events-none"}
                        `}
                    />

                    {/* LOGOUT BUTTON */}
                    {isLoggedIn && (
                        <ButtonIcon
                            icon={LogOut}
                            sizeIcon={18}
                            onClick={handleLogout}
                            className={`
                                absolute bottom-2 left-2
                                  bg-danger! text-white! hover:bg-danger/90!
                                ${menuOpen
                                ? "opacity-100 scale-100 pointer-events-auto"
                                : "opacity-0 scale-50 pointer-events-none"}
                            `}
                        />
                    )}

                    {/* TOOLTIP */}
                    <div
                        className={`
                            absolute bottom-14 -right-1
                            px-3 py-1 rounded-md
                            bg-foreground! text-white! text-xs font-medium
                            whitespace-nowrap shadow-lg
                            pointer-events-none
                            transition-all duration-300
                            ${menuOpen
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-2"}
                        `}
                    >
                        {isLoggedIn ? "Profile" : "Login"}
                    </div>

                    {/* MAIN BUTTON */}
                    <ButtonIcon
                        icon={isLoggedIn ? User : LogIn}
                        sizeIcon={20}
                        onMouseEnter={handleMouseEnter}
                        onClick={handleMainButtonClick}
                        className="
                            absolute bottom-0 right-0 h-12 w-12
                            bg-foreground! text-white
                        "
                    />
                </div>

                {/* SCROLL TOP */}
                <div
                    className={`relative transition-all duration-300 ${
                        showScrollTop
                            ? "w-12 opacity-100 translate-x-0 pointer-events-auto"
                            : "w-0 opacity-0 translate-x-5 pointer-events-none"
                    }`}
                >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-semibold text-text-strong">
                        {scrollPercent}%
                    </div>
                    <ButtonIcon
                        icon={ArrowUp}
                        sizeIcon={20}
                        onClick={handleScrollToTop}
                        className="bg-brand! text-white h-12 w-12"
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
