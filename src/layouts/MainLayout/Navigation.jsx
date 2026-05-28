import { useState, useEffect } from "react";
import { X } from 'lucide-react';

import '../../css/components.css'
import Logo from "../../components/ui/Logo/Logo";

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <>
      {/* <!-- ==================== NAVIGATION ==================== --> */}
      <nav
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500 border-b ${
          scrolled ? 'nav-scrolled border-gray-200/60' : 'border-transparent'
        }`}
        style={{
          paddingTop: scrolled ? '10px' : '20px',
          paddingBottom: scrolled ? '10px' : '20px',
          paddingLeft: '16px',
          paddingRight: '16px',
          background: scrolled ? 'rgba(255, 255, 255, 0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          boxShadow: scrolled ? '0 1px 20px rgba(0, 0, 0, 0.06)' : 'none',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* logo */}
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-m font-medium text-muted hover:text-dark transition-colors duration-300">Về Chúng tôi</a>
            <a href="#products" className="text-m font-medium text-muted hover:text-dark transition-colors duration-300">Sản phẩm</a>
            <a href="#services" className="text-m font-medium text-muted hover:text-dark transition-colors duration-300">Dịch vụ</a>
            <a href="#process" className="text-m font-medium text-muted hover:text-dark transition-colors duration-300">Quy trình</a>
            <a href="#contact" className="btn-shine bg-brand text-white font-heading font-medium text-m px-6 py-4 rounded-full tracking-wide transition-all duration-300 hover:bg-brand-dark hover:scale-105 hover:shadow-[0_8px_25px_rgba(1,146,245,0.3)]">Liên hệ ngay</a>
          </div>

          {/* Hamburger button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border hover:border-brand/30 transition-colors"
          >
            <span className="block w-5 h-0.5 bg-dark transition-all duration-300"></span>
            <span className="block w-5 h-0.5 bg-dark transition-all duration-300"></span>
            <span className="block w-5 h-0.5 bg-dark transition-all duration-300"></span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`mobile-menu fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 ${
          mobileOpen ? 'open' : ''
        }`}
      >
        <button
          onClick={closeMobileMenu}
          className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-xl border border-border"
        >
          <X className="w-5 h-5 text-dark" />
        </button>

        <a href="#about" onClick={closeMobileMenu} className="mob-link text-2xl font-heading font-500 text-muted hover:text-brand transition-colors">Về chúng tôi</a>
        <a href="#products" onClick={closeMobileMenu} className="mob-link text-2xl font-heading font-500 text-muted hover:text-brand transition-colors">Sản phẩm</a>
        <a href="#services" onClick={closeMobileMenu} className="mob-link text-2xl font-heading font-500 text-muted hover:text-brand transition-colors">Dịch vụ</a>
        <a href="#process" onClick={closeMobileMenu} className="mob-link text-2xl font-heading font-500 text-muted hover:text-brand transition-colors">Quy trình</a>
        <a href="#contact" onClick={closeMobileMenu} className="mob-link mt-4 bg-brand text-white font-heading font-500 px-8 py-3 rounded-full hover:bg-brand-dark transition-colors">
          Liên hệ ngay
        </a>
      </div>
    </>
  );
};

export default Navigation;