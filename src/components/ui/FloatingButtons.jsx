import { useEffect, useState } from "react";
import { ArrowUp, LogIn, User } from "lucide-react";

const FloatingButtons = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [scrollPercent, setScrollPercent] = useState(0);

    // ví dụ user đã đăng nhập
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const documentHeight =
                document.documentElement.scrollHeight - window.innerHeight;

            const percent = documentHeight > 0
                ? Math.round((scrollTop / documentHeight) * 100)
                : 0;

            setScrollPercent(percent);
            setShowScrollTop(scrollTop > 300);
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleScrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleLoginOrAccount = () => {
        if (user) {
            // đã đăng nhập
            window.location.href = "/profile";
        } else {
            // chưa đăng nhập
            window.location.href = "/login";
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
            <button
                onClick={handleLoginOrAccount}
                className="w-12 h-12 rounded-full bg-dark! text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
            >
                {user ? <User size={20} /> : <LogIn size={20} />}
            </button>

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
                    className="w-12 h-12 rounded-full bg-brand! text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                >
                    <ArrowUp size={20} />
                </button>
            </div>
        </div>
    );
};

export default FloatingButtons;