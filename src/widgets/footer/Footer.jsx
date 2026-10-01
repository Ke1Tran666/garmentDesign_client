import { ArrowRight } from "lucide-react";
import { FaFacebookF, FaYoutube } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";
import { SiZalo } from "react-icons/si";
import { useNotification } from "@/app/providers/NotificationProvider";
import Logo from "@/shared/ui/brand/Logo";
import { newsletterApi } from "@/features/newsletter/api/newsletterApi";

const socials = [
  {
    href: "#",
    icon: FaFacebookF,
  },
  {
    href: "#",
    icon: FaInstagram,
  },
  {
    href: "#",
    icon: FaYoutube,
  },
  {
    href: "#",
    icon: SiZalo,
  },
];

const Footer = () => {
  const { showNotification } = useNotification();

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const email = form.email.value.trim();

    if (!email) {
      showNotification(
        "error",
        "Có lỗi xảy ra!",
        "Vui lòng nhập email của bạn.",
      );
      return;
    }

    try {
      const data = await newsletterApi.subscribe(email);

      showNotification(
        "success",
        "Đăng ký thành công!",
        data?.message || "Cảm ơn bạn đã đăng ký nhận tin.",
      );

      form.reset();
    } catch (error) {
      showNotification(
        "error",
        "Đăng ký thất bại!",
        error.response?.data?.message || "Không thể đăng ký nhận tin.",
      );
    }
  };

  return (
    <footer className="relative bg-surface px-4 py-16">
      <div className="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-border to-transparent"></div>

      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo textColor="text-text-strong" />

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-subtle">
              Đơn vị hàng đầu về dịch vụ kỹ thuật may mặc: in sơ đồ, in rập,
              thiết kế và tính định mức cho ngành thời trang Việt Nam.
            </p>

            <div className="mt-6 flex gap-3">
              {socials.map(({ href, icon: Icon }, i) => (
                <a
                  key={i}
                  href={href}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-subtle transition-all duration-300 hover:border-brand/30 hover:bg-brand-50 hover:text-brand"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-500 mb-4 font-mono text-xs tracking-widest text-text-subtle uppercase">
              Dịch vụ
            </h4>

            <ul className="space-y-3">
              <li>
                <a
                  href="#services"
                  className="text-sm text-text-muted transition-colors duration-300 hover:text-brand"
                >
                  In Sơ Đồ
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-sm text-text-muted transition-colors duration-300 hover:text-brand"
                >
                  In Rập
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-sm text-text-muted transition-colors duration-300 hover:text-brand"
                >
                  Thiết Kế
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-sm text-text-muted transition-colors duration-300 hover:text-brand"
                >
                  Tính Định Mức
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-500 mb-4 font-mono text-xs tracking-widest text-text-subtle uppercase">
              Về chúng tôi
            </h4>

            <ul className="space-y-3">
              <li>
                <a
                  href="#about"
                  className="text-sm text-text-muted transition-colors duration-300 hover:text-brand"
                >
                  Câu chuyện
                </a>
              </li>
              <li>
                <a
                  href="#process"
                  className="text-sm text-text-muted transition-colors duration-300 hover:text-brand"
                >
                  Quy trình
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  className="text-sm text-text-muted transition-colors duration-300 hover:text-brand"
                >
                  Đánh giá
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-text-muted transition-colors duration-300 hover:text-brand"
                >
                  Tuyển dụng
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="font-500 mb-4 font-mono text-xs tracking-widest text-text-subtle uppercase">
              Nhận tin cập nhật
            </h4>

            <p className="mb-4 text-sm text-text-subtle">
              Nhận tin tức mới nhất về kỹ thuật may mặc, dịch vụ thiết kế và các
              ưu đãi đặc biệt từ HoaTran maymac.
            </p>

            <form
              id="newsletterForm"
              className="flex gap-2"
              onSubmit={handleNewsletterSubmit}
            >
              <input
                type="email"
                name="email"
                placeholder="Email của bạn"
                required
                className="font-body flex-1 rounded-xl border border-border bg-surface-subtle px-4 py-2.5 text-sm text-text-strong transition-all placeholder:text-text-subtle/60 focus:border-brand/50 focus:ring-2 focus:ring-brand/10 focus:outline-none"
              />

              <button
                type="submit"
                className="font-500 rounded-xl bg-brand! px-5 py-2.5 font-heading text-sm text-white shadow-[0_4px_15px_rgba(1,146,245,0.25)] transition-all duration-300 hover:scale-105 hover:bg-brand-dark"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 md:flex-row">
          <div className="text-xs text-text-subtle">
            © 2025 HoaTran maymac. All rights reserved.
          </div>

          <div className="flex gap-6">
            <a
              href="#"
              className="text-xs text-text-subtle transition-colors hover:text-text-muted"
            >
              Chính sách bảo mật
            </a>
            <a
              href="#"
              className="text-xs text-text-subtle transition-colors hover:text-text-muted"
            >
              Điều khoản sử dụng
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
