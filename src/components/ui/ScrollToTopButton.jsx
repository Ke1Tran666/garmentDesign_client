import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton = () => {

    const [show, setShow] = useState(false);
    const [scrollPercent, setScrollPercent] = useState(0);

    useEffect(() => {

        const handleScroll = () => {

            const scrollTop = window.scrollY;

            const documentHeight =
                document.documentElement.scrollHeight - window.innerHeight;

            const percent = Math.round((scrollTop / documentHeight) * 100);

            setScrollPercent(percent);

            setShow(scrollTop > 300);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };

    }, []);

    const handleScrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">

            {/* percent */}
            <div
                className={`absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-semibold text-dark transition-all duration-300
                ${show ? "opacity-100" : "opacity-0"}`}
            >
                {scrollPercent}%
            </div>

            {/* button */}
            <button
                onClick={handleScrollToTop}
                className={`w-12 h-12 rounded-full bg-brand! text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110
                ${show
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-10 pointer-events-none"
                    }`}
            >
                <ArrowUp size={20} />
            </button>
        </div>
    );
};

export default ScrollToTopButton;