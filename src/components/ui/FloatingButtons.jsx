import { useEffect, useRef, useState } from "react";
import { ArrowUp, LogIn, User, Settings, LogOut } from "lucide-react";
import SettingsModal from "./Settings/SettingsModal";

const FloatingButtons = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [scrollPercent, setScrollPercent] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);

    const menuRef = useRef(null);
    const user = JSON.parse(localStorage.getItem("user"));

    // Detect thiết bị có touch (mobile/tablet) hay không
    const isTouchDevice = () =>
        window.matchMedia("(pointer: coarse)").matches;

    // ─── Scroll tracking ───────────────────────────────────────────────────────
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
            // Mobile: lần 1 mở menu, lần 2 navigate
            if (!menuOpen) {
                setMenuOpen(true);
            } else {
                setMenuOpen(false);
                window.location.href = user ? "/profile" : "/login";
            }
        } else {
            // Desktop: click navigate luôn (menu đã mở bằng hover)
            window.location.href = user ? "/profile" : "/login";
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
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
                    <button
                        onClick={() => {
                            setMenuOpen(false);
                            setOpenSettings(true);
                        }}
                        className={`
                            absolute top-2 right-2
                            w-10 h-10 rounded-full
                            bg-white! text-dark!
                            shadow-lg border border-gray-200
                            flex items-center justify-center
                            transition-all duration-300
                            hover:scale-110
                            hover:bg-dark!
                            hover:text-white!
                            ${menuOpen
                                ? "opacity-100 scale-100 pointer-events-auto"
                                : "opacity-0 scale-50 pointer-events-none"}
                        `}
                    >
                        <Settings size={18} />
                    </button>

                    {/* LOGOUT BUTTON */}
                    {user && (
                        <button
                            onClick={handleLogout}
                            className={`
                                absolute bottom-2 left-2
                                w-10 h-10 rounded-full
                                bg-red-500! text-white!
                                shadow-lg
                                flex items-center justify-center
                                transition-all duration-300
                                hover:scale-110
                                hover:bg-red-600!
                                ${menuOpen
                                    ? "opacity-100 scale-100 pointer-events-auto"
                                    : "opacity-0 scale-50 pointer-events-none"}
                            `}
                        >
                            <LogOut size={18} />
                        </button>
                    )}

                    {/* TOOLTIP */}
                    <div
                        className={`
                            absolute bottom-14 -right-1
                            px-3 py-1 rounded-md
                            bg-dark! text-white! text-xs font-medium
                            whitespace-nowrap shadow-lg
                            pointer-events-none
                            transition-all duration-300
                            ${menuOpen
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-2"}
                        `}
                    >
                        {user ? "Profile" : "Login"}
                    </div>

                    {/* MAIN BUTTON */}
                    <button
                        onMouseEnter={handleMouseEnter}
                        onClick={handleMainButtonClick}
                        className="
                            absolute bottom-0 right-0
                            w-12 h-12 rounded-full
                            bg-dark! text-white
                            flex items-center justify-center
                            shadow-lg
                            transition-all duration-300
                            hover:scale-110
                        "
                    >
                        {user ? <User size={20} /> : <LogIn size={20} />}
                    </button>
                </div>

                {/* SCROLL TOP */}
                <div
                    className={`relative transition-all duration-300 ${
                        showScrollTop
                            ? "w-12 opacity-100 translate-x-0 pointer-events-auto"
                            : "w-0 opacity-0 translate-x-5 pointer-events-none"
                    }`}
                >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-semibold text-dark">
                        {scrollPercent}%
                    </div>
                    <button
                        onClick={handleScrollToTop}
                        className="
                            w-12 h-12 rounded-full
                            bg-brand! text-white
                            flex items-center justify-center
                            shadow-lg
                            transition-all duration-300
                            hover:scale-110
                        "
                    >
                        <ArrowUp size={20} />
                    </button>
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
