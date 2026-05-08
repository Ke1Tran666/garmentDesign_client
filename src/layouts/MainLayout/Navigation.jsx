import { useState, useEffect } from "react";
import { Scissors } from 'lucide-react';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <a href="#" className="flex justify-center items-center gap-2.5 font-brand">
            <div className="w-9 h-9 bg-brand rounded-xl flex justify-center items-center shadow-[0_4px_15px_rgba(1,146,245,0.3)]">
              <Scissors className="text-white" />
            </div>
            <span className="text-text-primary font-brand font-semibold text-xl">
              HoaTran <span className="text-brand">maymac</span>
            </span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-m font-medium text-muted hover:text-dark transition-colors duration-300">Về Chúng tôi</a>
            <a href="#" className="text-m font-medium text-muted hover:text-dark transition-colors duration-300">Sản phẩm</a>
            <a href="#" className="text-m font-medium text-muted hover:text-dark transition-colors duration-300">Dịch vụ</a>
            <a href="#" className="text-m font-medium text-muted hover:text-dark transition-colors duration-300">Quy trình</a>
            <a href="#" className="btn-shine bg-brand text-white font-heading font-medium text-m px-6 py-4 rounded-full tracking-wide transition-all duration-300 hover:bg-brand-dark hover:scale-105 hover:shadow-[0_8px_25px_rgba(1,146,245,0.3)]">Liên hệ ngay</a>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;