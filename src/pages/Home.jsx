import { ArrowRight, ChevronDown, Play } from "lucide-react";
import Navigation from "../layouts/MainLayout/Navigation";

const Home = () => {
  return (
    <>
        {/* NAVIGATION */}
        <Navigation />
        {/* HERO */}
        <section className="relative min-h-screen flex flex-col justify-end pb-10 overflow-hidden">
            {/* Blobs */}
            <div className="absolute top-20 right-0 w-[320px] h-[320px] bg-brand rounded-full hero-blob pointer-events-none" style={{ zIndex: 0, opacity: 0.15 }}></div>
            <div className="absolute bottom-20 left-0 w-[220px] h-[220px] bg-brand rounded-full hero-blob pointer-events-none" style={{ zIndex: 0, opacity: 0.15, animationDelay: "-4s" }}></div>
            <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" style={{ zIndex: 0 }}></div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto pt-32">
                <h1 className="font-heading font-500 tracking-tighter leading-[0.9] animate-fiu delay-1" style={{ fontSize: "clamp(2.8rem, 8vw, 6.5vw)", color: "#111827" }}>
                    Giải pháp thiết kế
                    <br />
                    <span className="text-brand">may mặc</span> chuyên nghiệp
                    <br />
                    cho mọi thương hiệu
                </h1>
                <p className="mt-8 text-muted font-body font-300 text-base md:text-lg max-w-2xl leading-relaxed animate-fiu delay-2">
                    Từ in sơ đồ, in rập, thiết kế đến tính định mức — HoaTran maymac cung cấp trọn gói giải pháp kỹ thuật
                    giúp tối ưu quy trình sản xuất thời trang của bạn.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 animate-fiu delay-3">
                    <a href="#" className="btn-shine bg-brand text-white font-heading font-500 text-base px-8 py-3.5 rounded-full tracking-wide transition-all duration-300 hover:bg-brand-dark hover:scale-105 hover:shadow-[0_8px_30px_rgba(1,146,245,0.3)] flex items-center gap-2">
                        Khám phá dịch vụ
                        <ArrowRight className="w-4 h-4" />
                    </a>
                    <a href="#" className="flex items-center gap-2.5 text-muted hover:text-dark font-body text-sm transition-colors duration-300 group">
                        <span className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:border-brand/40 group-hover:bg-brand-50 transition-all duration-300">
                            <Play className="w-4 h-4 ml-0.5" />
                        </span>
                        Xem quy trình làm việc
                    </a>
                </div>
            </div>

            {/* Stats */}
            <div className="relative z-10 max-w-4xl mx-auto w-full animate-fiu delay-4" style={{ marginTop: 10 }}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.03)]">
                    <div className="bg-white p-5 text-center">
                        <div className="font-heading text-2xl md:text-3xl font-500 text-dark counter" data-target="3000">0</div>
                        <div className="text-xs text-subtle mt-1 font-mono tracking-wider uppercase">Thiết kế</div>
                    </div>
                    <div className="bg-white p-5 text-center">
                        <div className="font-heading text-2xl md:text-3xl font-500 text-dark counter" data-target="500">0</div>
                        <div className="text-xs text-subtle mt-1 font-mono tracking-wider uppercase">Khách hàng</div>
                    </div>
                    <div className="bg-white p-5 text-center">
                        <div className="font-heading text-2xl md:text-3xl font-500 text-dark counter" data-target="8">0</div>
                        <div className="text-xs text-subtle mt-1 font-mono tracking-wider uppercase">Năm kinh nghiệm</div>
                    </div>
                    <div className="bg-white p-5 text-center">
                        <div className="font-heading text-2xl md:text-3xl font-500 text-brand counter" data-target="99">0</div>
                        <div className="text-xs text-subtle mt-1 font-mono tracking-wider uppercase">% Hài lòng</div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 scroll-hint" style={{ zIndex: 10 }}>
                <ChevronDown className="w-5 h-5 text-subtle" />
            </div>
        </section>
    </>
  )
}

export default Home