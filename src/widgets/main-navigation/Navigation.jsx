import { useState, useEffect } from "react";
import { X } from "lucide-react";

import "@/shared/styles/components.css";
import Logo from "@/shared/ui/brand/Logo";

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <>
      {/* <!-- ==================== NAVIGATION ==================== --> */}
      <nav
        className={`fixed top-0 right-0 left-0 z-50 w-full border-b transition-all duration-500 ${
          scrolled ? "nav-scrolled border-border/60" : "border-transparent"
        }`}
        style={{
          paddingTop: scrolled ? "10px" : "20px",
          paddingBottom: scrolled ? "10px" : "20px",
          paddingLeft: "16px",
          paddingRight: "16px",
          background: scrolled ? "rgba(255, 255, 255, 0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
          boxShadow: scrolled ? "0 1px 20px rgba(0, 0, 0, 0.06)" : "none",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          {/* logo */}
          <Logo />
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#about"
              className="text-m font-medium text-text-muted transition-colors duration-300 hover:text-text-strong"
            >
              Về Chúng tôi
            </a>
            <a
              href="#products"
              className="text-m font-medium text-text-muted transition-colors duration-300 hover:text-text-strong"
            >
              Sản phẩm
            </a>
            <a
              href="#services"
              className="text-m font-medium text-text-muted transition-colors duration-300 hover:text-text-strong"
            >
              Dịch vụ
            </a>
            <a
              href="#process"
              className="text-m font-medium text-text-muted transition-colors duration-300 hover:text-text-strong"
            >
              Quy trình
            </a>
            <a
              href="#contact"
              className="btn-shine text-m rounded-full bg-brand px-6 py-4 font-heading font-medium tracking-wide text-white transition-all duration-300 hover:scale-105 hover:bg-brand-dark hover:shadow-[0_8px_25px_rgba(1,146,245,0.3)]"
            >
              Liên hệ ngay
            </a>
          </div>

          {/* Hamburger button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl border border-border transition-colors hover:border-brand/30 md:hidden"
          >
            <span className="block h-0.5 w-5 bg-foreground transition-all duration-300"></span>
            <span className="block h-0.5 w-5 bg-foreground transition-all duration-300"></span>
            <span className="block h-0.5 w-5 bg-foreground transition-all duration-300"></span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`mobile-menu fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-white/95 backdrop-blur-xl ${
          mobileOpen ? "open" : ""
        }`}
      >
        <button
          onClick={closeMobileMenu}
          className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-xl border border-border"
        >
          <X className="h-5 w-5 text-text-strong" />
        </button>

        <a
          href="#about"
          onClick={closeMobileMenu}
          className="mob-link font-500 font-heading text-2xl text-text-muted transition-colors hover:text-brand"
        >
          Về chúng tôi
        </a>
        <a
          href="#products"
          onClick={closeMobileMenu}
          className="mob-link font-500 font-heading text-2xl text-text-muted transition-colors hover:text-brand"
        >
          Sản phẩm
        </a>
        <a
          href="#services"
          onClick={closeMobileMenu}
          className="mob-link font-500 font-heading text-2xl text-text-muted transition-colors hover:text-brand"
        >
          Dịch vụ
        </a>
        <a
          href="#process"
          onClick={closeMobileMenu}
          className="mob-link font-500 font-heading text-2xl text-text-muted transition-colors hover:text-brand"
        >
          Quy trình
        </a>
        <a
          href="#contact"
          onClick={closeMobileMenu}
          className="mob-link font-500 mt-4 rounded-full bg-brand px-8 py-3 font-heading text-white transition-colors hover:bg-brand-dark"
        >
          Liên hệ ngay
        </a>
      </div>
    </>
  );
};

export default Navigation;
