import { ArrowRight, Calendar, ChevronDown, FileCheck, Headphones, Phone, Play, ShieldCheck, Sparkles, Target, Zap } from "lucide-react";
import Navigation from "../layouts/MainLayout/Navigation";
import '../css/components.css'
import useReveal from "../hooks/useReveal";
import ProductsSection from "../sections/ProductsSection";
import ServicesSection from "../sections/ServicesSection";
import ProcessSection from "../sections/ProcessSection";
import TestimonialsSection from "../sections/TestimonialsSection";
import ContactSection from "../sections/ContactSection";
import Footer from "../layouts/MainLayout/Footer";

const Home = () => {

    useReveal();

    return (
        <>
            {/* NAVIGATION */}
            <Navigation />
            {/* HERO */}
            <section className="relative min-h-screen flex flex-col justify-end pb-10 overflow-hidden">

                {/* Blobs */}
                <div className="absolute top-20 right-1/4 w-125 h-125 bg-brand rounded-full hero-blob pointer-events-none blur-[128px]"></div>
                <div className="absolute bottom-20 left-1/4 w-87.5 h-87.5 bg-brand rounded-full hero-blob pointer-events-none blur-[128px]"></div>

                {/* background hero*/}
                <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" style={{ zIndex: 0 }}></div>

                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto pt-32">
                    <h1 className="font-heading font-medium tracking-tighter leading-[0.9] animate-fiu delay-1" style={{ fontSize: "clamp(2.8rem, 8vw, 6.5vw)", color: "#111827" }}>
                        Giải pháp thiết kế
                        <br />
                        <span className="text-brand">may mặc</span> chuyên nghiệp
                        <br />
                        cho mọi thương hiệu
                    </h1>
                    <p className="mt-8 text-muted font-light text-base md:text-lg max-w-2xl leading-relaxed animate-fiu delay-2">
                        Từ in sơ đồ, in rập, thiết kế đến tính định mức — HoaTran maymac cung cấp trọn gói giải pháp kỹ thuật
                        giúp tối ưu quy trình sản xuất thời trang của bạn.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 animate-fiu delay-3">
                        <a href="#" className="btn-shine bg-brand text-white font-heading font-medium text-base px-8 py-3.5 rounded-full tracking-wide transition-all duration-300 hover:bg-brand-dark hover:scale-105 hover:shadow-[0_8px_30px_rgba(1,146,245,0.3)] flex items-center gap-2">
                            Khám phá dịch vụ
                            <ArrowRight className="w-4 h-4" />
                        </a>
                        <a href="#" className="flex items-center gap-2.5 text-muted hover:text-dark text-base transition-colors duration-300 group">
                            <span className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:border-brand/40 transition-all duration-300">
                                <Play className="w-4 h-4 ml-0.5 group-hover:animate-play-ud" />
                            </span>
                            Xem quy trình làm việc
                        </a>
                    </div>
                </div>

                {/* Stats */}
                <div className="relative z-10 max-w-4xl mx-auto w-full animate-fiu delay-4" style={{ marginTop: 10 }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.03)]">
                        <div className="bg-white p-5 text-center">
                            <div className="font-heading text-2xl md:text-3xl font-medium text-dark counter" data-target="3000">0</div>
                            <div className="text-xs text-subtle mt-1 font-mono tracking-wider uppercase">Thiết kế</div>
                        </div>
                        <div className="bg-white p-5 text-center">
                            <div className="font-heading text-2xl md:text-3xl font-medium text-dark counter" data-target="500">0</div>
                            <div className="text-xs text-subtle mt-1 font-mono tracking-wider uppercase">Khách hàng</div>
                        </div>
                        <div className="bg-white p-5 text-center">
                            <div className="font-heading text-2xl md:text-3xl font-medium text-dark counter" data-target="8">0</div>
                            <div className="text-xs text-subtle mt-1 font-mono tracking-wider uppercase">Năm kinh nghiệm</div>
                        </div>
                        <div className="bg-white p-5 text-center">
                            <div className="font-heading text-2xl md:text-3xl font-medium text-brand counter" data-target="99">0</div>
                            <div className="text-xs text-subtle mt-1 font-mono tracking-wider uppercase">% Hài lòng</div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 scroll-hint" style={{ zIndex: 10 }}>
                    <ChevronDown className="w-5 h-5 text-subtle" />
                </div>
            </section>

            {/* ABOUT */}
            <section id="about" className="relative px-4 py-24 md:py-32">
                <div className="max-w-6xl mx-auto">
                    <div className="grid items-center grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">

                    {/* IMAGE */}
                    <div className="md:col-span-5 reveal">
                        <div
                        className="relative overflow-hidden rounded-3xl border-gradient img-hover shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]"
                        style={{ aspectRatio: "3 / 4" }}
                        >
                        <img
                            src="https://picsum.photos/seed/garment-studio-pro/600/800"
                            alt="Studio"
                            className="object-cover w-full h-full"
                        />

                        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />

                        <div className="absolute left-6 right-6 bottom-6 group-hover:animate-float rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand/10">
                                <ShieldCheck className="w-5 h-5 text-brand" />
                            </div>

                            <div>
                                <div className="text-sm font-medium font-heading text-dark">
                                Đội ngũ kỹ thuật
                                </div>

                                <div className="text-xs text-muted">
                                15+ chuyên viên lành nghề
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* CONTENT */}
                    <div className="md:col-span-7">

                        <div className="reveal">
                        <span className="text-xs font-mono font-medium tracking-widest uppercase text-brand">
                            Về chúng tôi
                        </span>
                        </div>

                        <h2
                        className="mt-4 text-3xl leading-tight tracking-tight md:text-5xl font-heading font-medium text-dark reveal"
                        style={{ transitionDelay: "100ms" }}
                        >
                        Đơn vị tiên phong về
                        <br />
                        <span className="text-muted">
                            kỹ thuật may mặc
                        </span>{" "}
                        tại Việt Nam
                        </h2>

                        <p
                        className="mt-6 text-base leading-relaxed md:text-lg text-muted font-light reveal"
                        style={{ transitionDelay: "200ms" }}
                        >
                        HoaTran maymac chuyên cung cấp các dịch vụ kỹ thuật thời trang bao gồm
                        in sơ đồ, in rập, thiết kế và tính định mức. Với hơn 8 năm kinh nghiệm,
                        chúng tôi đã đồng hành cùng hàng trăm thương hiệu thời trang trong và ngoài nước.
                        </p>

                        {/* FEATURES */}
                        <div className="grid grid-cols-1 gap-6 mt-10 sm:grid-cols-2">

                        <div
                            className="reveal"
                            style={{ transitionDelay: "300ms" }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand/10">
                                <Zap className="w-4 h-4 text-brand" />
                            </div>

                            <span className="text-sm font-medium font-heading text-dark">
                                Nhanh chóng
                            </span>
                            </div>

                            <p className="text-xs leading-relaxed text-subtle">
                            Xử lý đơn trong 24–48h, đáp ứng tiến độ sản xuất khắt khe.
                            </p>
                        </div>

                        <div
                            className="reveal"
                            style={{ transitionDelay: "400ms" }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand/10">
                                <Target className="w-4 h-4 text-brand" />
                            </div>

                            <span className="text-sm font-medium font-heading text-dark">
                                Chính xác
                            </span>
                            </div>

                            <p className="text-xs leading-relaxed text-subtle">
                            Sai số rập cắt &lt; 2mm, định mức chênh lệch &lt; 3%.
                            </p>
                        </div>

                        <div
                            className="reveal"
                            style={{ transitionDelay: "500ms" }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand/10">
                                <FileCheck className="w-4 h-4 text-brand" />
                            </div>

                            <span className="text-sm font-medium font-heading text-dark">
                                Chuẩn format
                            </span>
                            </div>

                            <p className="text-xs leading-relaxed text-subtle">
                            Sơ đồ, rập đúng chuẩn xuất khẩu, tương thích mọi phần mềm CAD.
                            </p>
                        </div>

                        <div
                            className="reveal"
                            style={{ transitionDelay: "600ms" }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand/10">
                                <Headphones className="w-4 h-4 text-brand" />
                            </div>

                            <span className="text-sm font-medium font-heading text-dark">
                                Hỗ trợ 1:1
                            </span>
                            </div>

                            <p className="text-xs leading-relaxed text-subtle">
                            Kỹ sư trực tiếp tư vấn, chỉnh sửa đến khi khách hàng hài lòng.
                            </p>
                        </div>

                        </div>
                    </div>
                    </div>
                </div>
            </section>

            {/* PRODUCTS */}
            <ProductsSection />

            {/* SERVICES */}
            <ServicesSection />

            {/* PROCESS */}
            <ProcessSection />

            {/* TESTIMONIALS */}
            <TestimonialsSection />

            {/* CTA */}
            <section className="relative py-24 md:py-32 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-3xl overflow-hidden reveal">
                        <div className="absolute inset-0 bg-linear-to-br from-brand via-brand-dark to-blue-800"></div>
                        <div className="absolute inset-0 opacity-10" style={{backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,backgroundSize: "30px 30px"}}>
                        </div>
                        <div className="relative z-10 p-10 md:p-16 text-center text-white">
                            <div
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm mb-8">
                                <Sparkles className="w-4 h-4"/>
                                <span className="text-xs font-mono tracking-widest uppercase">Miễn phí tư vấn</span>
                            </div>
                            <h2 className="font-heading text-3xl md:text-5xl font-medium tracking-tight leading-tight text-white">
                                Sẵn sàng tối ưu
                                <br/>
                                quy trình may mặc?
                            </h2>
                            <p className="text-white/70 font-body font-light mt-6 max-w-lg mx-auto">
                                Gửi yêu cầu ngay hôm nay — nhận báo giá chi tiết trong vòng 2 giờ làm việc.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                                <a href="#contact" className="btn-shine bg-white text-brand-dark font-heading font-medium text-base px-10 py-4 rounded-full tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex items-center gap-2">
                                    Đặt lịch tư vấn
                                    <Calendar className="w-4 h-4"/>
                                </a>
                                <a href="tel:+84901234567"
                                    className="flex items-center gap-2 text-white/70 hover:text-white font-body text-sm transition-colors duration-300">
                                    <Phone className="w-4 h-4"/>
                                    0918 414 470
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTACT */}
            <ContactSection />

            {/* FOOTER */}
            <Footer/>
        </>
    )
}

export default Home