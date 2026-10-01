import {
  ArrowRight,
  Calendar,
  ChevronDown,
  FileCheck,
  Headphones,
  Phone,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import Navigation from "@/widgets/main-navigation/Navigation";
import "@/shared/styles/components.css";
import useReveal from "@/shared/hooks/useReveal";
import ProductsSection from "@/widgets/home-sections/ProductsSection";
import ServicesSection from "@/widgets/home-sections/ServicesSection";
import ProcessSection from "@/widgets/home-sections/ProcessSection";
import TestimonialsSection from "@/widgets/home-sections/TestimonialsSection";
import ContactSection from "@/widgets/home-sections/ContactSection";
import Footer from "@/widgets/footer/Footer";
import FloatingButtons from "@/widgets/floating-actions/FloatingButtons";

const Home = () => {
  useReveal();

  return (
    <>
      {/* NAVIGATION */}
      <Navigation />
      {/* HERO */}
      <section className="relative flex min-h-screen flex-col justify-end overflow-hidden pb-10">
        {/* Blobs */}
        <div className="hero-blob pointer-events-none absolute top-20 right-1/4 h-125 w-125 rounded-full bg-brand blur-[128px]"></div>
        <div className="hero-blob pointer-events-none absolute bottom-20 left-1/4 h-87.5 w-87.5 rounded-full bg-brand blur-[128px]"></div>

        {/* background hero*/}
        <div
          className="grid-bg pointer-events-none absolute inset-0 opacity-60"
          style={{ zIndex: 0 }}
        ></div>

        {/* Content */}
        <div className="relative z-10 mx-auto flex max-w-5xl flex-1 flex-col items-center justify-center px-4 pt-32 text-center">
          <h1
            className="animate-fiu font-heading leading-[0.9] font-medium tracking-tighter delay-1"
            style={{ fontSize: "clamp(2.8rem, 8vw, 6.5vw)" }}
          >
            Giải pháp thiết kế
            <br />
            <span className="text-brand">may mặc</span> chuyên nghiệp
            <br />
            cho mọi thương hiệu
          </h1>
          <p className="animate-fiu mt-8 max-w-2xl text-base leading-relaxed font-light text-text-muted delay-2 md:text-lg">
            Từ in sơ đồ, in rập, thiết kế đến tính định mức — HoaTran maymac
            cung cấp trọn gói giải pháp kỹ thuật giúp tối ưu quy trình sản xuất
            thời trang của bạn.
          </p>
          <div className="animate-fiu mt-10 flex flex-col items-center gap-4 delay-3 sm:flex-row">
            <a
              href="#"
              className="btn-shine flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 font-heading text-base font-medium tracking-wide text-white transition-all duration-300 hover:scale-105 hover:bg-brand-dark hover:shadow-[0_8px_30px_rgba(1,146,245,0.3)]"
            >
              Khám phá dịch vụ
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="group flex items-center gap-2.5 text-base text-text-muted transition-colors duration-300 hover:text-text-strong"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-all duration-300 group-hover:border-brand/40">
                <Play className="ml-0.5 h-4 w-4 group-hover:animate-play-ud" />
              </span>
              Xem quy trình làm việc
            </a>
          </div>
        </div>

        {/* Stats */}
        <div
          className="animate-fiu relative z-10 mx-auto w-full max-w-4xl delay-4"
          style={{ marginTop: 10 }}
        >
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border shadow-[0_0_40px_rgba(0,0,0,0.03)] md:grid-cols-4">
            <div className="bg-surface p-5 text-center">
              <div
                className="counter font-heading text-2xl font-medium text-text-strong md:text-3xl"
                data-target="3000"
              >
                0
              </div>
              <div className="mt-1 font-mono text-xs tracking-wider text-text-subtle uppercase">
                Thiết kế
              </div>
            </div>
            <div className="bg-surface p-5 text-center">
              <div
                className="counter font-heading text-2xl font-medium text-text-strong md:text-3xl"
                data-target="500"
              >
                0
              </div>
              <div className="mt-1 font-mono text-xs tracking-wider text-text-subtle uppercase">
                Khách hàng
              </div>
            </div>
            <div className="bg-surface p-5 text-center">
              <div
                className="counter font-heading text-2xl font-medium text-text-strong md:text-3xl"
                data-target="8"
              >
                0
              </div>
              <div className="mt-1 font-mono text-xs tracking-wider text-text-subtle uppercase">
                Năm kinh nghiệm
              </div>
            </div>
            <div className="bg-surface p-5 text-center">
              <div
                className="counter font-heading text-2xl font-medium text-brand md:text-3xl"
                data-target="99"
              >
                0
              </div>
              <div className="mt-1 font-mono text-xs tracking-wider text-text-subtle uppercase">
                % Hài lòng
              </div>
            </div>
          </div>
        </div>

        <div
          className="scroll-hint absolute bottom-3 left-1/2 -translate-x-1/2"
          style={{ zIndex: 10 }}
        >
          <ChevronDown className="h-5 w-5 text-text-subtle" />
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative px-4 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-16">
            {/* IMAGE */}
            <div className="reveal md:col-span-5">
              <div
                className="border-gradient img-hover relative overflow-hidden rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]"
                style={{ aspectRatio: "3 / 4" }}
              >
                <img
                  src="https://picsum.photos/seed/garment-studio-pro/600/800"
                  alt="Studio"
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />

                <div className="absolute right-6 bottom-6 left-6 rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur-xl group-hover:animate-float">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                      <ShieldCheck className="h-5 w-5 text-brand" />
                    </div>

                    <div>
                      <div className="font-heading text-sm font-medium text-text-strong">
                        Đội ngũ kỹ thuật
                      </div>

                      <div className="text-xs text-text-muted">
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
                <span className="font-mono text-xs font-medium tracking-widest text-brand uppercase">
                  Về chúng tôi
                </span>
              </div>

              <h2
                className="reveal mt-4 font-heading text-3xl leading-tight font-medium tracking-tight text-text-strong md:text-5xl"
                style={{ transitionDelay: "100ms" }}
              >
                Đơn vị tiên phong về
                <br />
                <span className="text-text-muted">kỹ thuật may mặc</span> tại
                Việt Nam
              </h2>

              <p
                className="reveal mt-6 text-base leading-relaxed font-light text-text-muted md:text-lg"
                style={{ transitionDelay: "200ms" }}
              >
                HoaTran maymac chuyên cung cấp các dịch vụ kỹ thuật thời trang
                bao gồm in sơ đồ, in rập, thiết kế và tính định mức. Với hơn 8
                năm kinh nghiệm, chúng tôi đã đồng hành cùng hàng trăm thương
                hiệu thời trang trong và ngoài nước.
              </p>

              {/* FEATURES */}
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="reveal" style={{ transitionDelay: "300ms" }}>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
                      <Zap className="h-4 w-4 text-brand" />
                    </div>

                    <span className="font-heading text-sm font-medium text-text-strong">
                      Nhanh chóng
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-text-subtle">
                    Xử lý đơn trong 24–48h, đáp ứng tiến độ sản xuất khắt khe.
                  </p>
                </div>

                <div className="reveal" style={{ transitionDelay: "400ms" }}>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
                      <Target className="h-4 w-4 text-brand" />
                    </div>

                    <span className="font-heading text-sm font-medium text-text-strong">
                      Chính xác
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-text-subtle">
                    Sai số rập cắt &lt; 2mm, định mức chênh lệch &lt; 3%.
                  </p>
                </div>

                <div className="reveal" style={{ transitionDelay: "500ms" }}>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
                      <FileCheck className="h-4 w-4 text-brand" />
                    </div>

                    <span className="font-heading text-sm font-medium text-text-strong">
                      Chuẩn format
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-text-subtle">
                    Sơ đồ, rập đúng chuẩn xuất khẩu, tương thích mọi phần mềm
                    CAD.
                  </p>
                </div>

                <div className="reveal" style={{ transitionDelay: "600ms" }}>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
                      <Headphones className="h-4 w-4 text-brand" />
                    </div>

                    <span className="font-heading text-sm font-medium text-text-strong">
                      Hỗ trợ 1:1
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-text-subtle">
                    Kỹ sư trực tiếp tư vấn, chỉnh sửa đến khi khách hàng hài
                    lòng.
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
      <section className="relative px-4 py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="reveal relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-linear-to-br from-brand via-brand-dark to-blue-800"></div>
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,
                backgroundSize: "30px 30px",
              }}
            ></div>
            <div className="relative z-10 p-10 text-center text-white md:p-16">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                <span className="font-mono text-xs tracking-widest uppercase">
                  Miễn phí tư vấn
                </span>
              </div>
              <h2 className="font-heading text-3xl leading-tight font-medium tracking-tight text-white md:text-5xl">
                Sẵn sàng tối ưu
                <br />
                quy trình may mặc?
              </h2>
              <p className="font-body mx-auto mt-6 max-w-lg font-light text-white/70">
                Gửi yêu cầu ngay hôm nay — nhận báo giá chi tiết trong vòng 2
                giờ làm việc.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="#contact"
                  className="btn-shine flex items-center gap-2 rounded-full bg-surface px-10 py-4 font-heading text-base font-medium tracking-wide text-brand-dark transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
                >
                  Đặt lịch tư vấn
                  <Calendar className="h-4 w-4" />
                </a>
                <a
                  href="tel:+84918414470"
                  className="font-body flex items-center gap-2 text-sm text-white/70 transition-colors duration-300 hover:text-white"
                >
                  <Phone className="h-4 w-4" />
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
      <Footer />

      {/* SCROLL To TOP BUTTON */}
      <FloatingButtons />
    </>
  );
};

export default Home;
