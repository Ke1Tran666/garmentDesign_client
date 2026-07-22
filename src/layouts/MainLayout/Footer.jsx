import { ArrowRight } from "lucide-react";
import { FaFacebookF, FaYoutube } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";
import { SiZalo } from "react-icons/si";
import { useNotification } from "@/components/ui/Notification/NotificationContext";
import Logo from "../../components/common/Logo/Logo";
import { newsletterApi } from "@/api/newsletterApi";

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
        "Vui lòng nhập email của bạn."
        );
        return;
    }

    try {
    const data =
        await newsletterApi.subscribe(email);

    showNotification(
        "success",
        "Đăng ký thành công!",
        data?.message ||
        "Cảm ơn bạn đã đăng ký nhận tin.",
    );

    form.reset();
    } catch (error) {
    showNotification(
        "error",
        "Đăng ký thất bại!",
        error.response?.data?.message ||
        "Không thể đăng ký nhận tin.",
    );
    }
    };

    return (
        <footer className="relative py-16 px-4 bg-white">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent"></div>

        <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
                <Logo textColor="text-dark" />

                <p className="text-sm text-subtle mt-4 leading-relaxed max-w-xs">
                Đơn vị hàng đầu về dịch vụ kỹ thuật may mặc: in sơ đồ, in rập,
                thiết kế và tính định mức cho ngành thời trang Việt Nam.
                </p>

                <div className="flex gap-3 mt-6">
                {socials.map(({ href, icon: Icon }, i) => (
                    <a
                    key={i}
                    href={href}
                    className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-subtle hover:text-brand hover:border-brand/30 hover:bg-brand-50 transition-all duration-300"
                    >
                    <Icon className="w-4 h-4" />
                    </a>
                ))}
                </div>
            </div>

            <div className="md:col-span-2">
                <h4 className="text-xs font-mono tracking-widest uppercase text-subtle mb-4 font-500">
                Dịch vụ
                </h4>

                <ul className="space-y-3">
                <li>
                    <a
                    href="#services"
                    className="text-sm text-muted1 hover:text-brand transition-colors duration-300"
                    >
                    In Sơ Đồ
                    </a>
                </li>
                <li>
                    <a
                    href="#services"
                    className="text-sm text-muted1 hover:text-brand transition-colors duration-300"
                    >
                    In Rập
                    </a>
                </li>
                <li>
                    <a
                    href="#services"
                    className="text-sm text-muted1 hover:text-brand transition-colors duration-300"
                    >
                    Thiết Kế
                    </a>
                </li>
                <li>
                    <a
                    href="#services"
                    className="text-sm text-muted1 hover:text-brand transition-colors duration-300"
                    >
                    Tính Định Mức
                    </a>
                </li>
                </ul>
            </div>

            <div className="md:col-span-2">
                <h4 className="text-xs font-mono tracking-widest uppercase text-subtle mb-4 font-500">
                Về chúng tôi
                </h4>

                <ul className="space-y-3">
                <li>
                    <a
                    href="#about"
                    className="text-sm text-muted1 hover:text-brand transition-colors duration-300"
                    >
                    Câu chuyện
                    </a>
                </li>
                <li>
                    <a
                    href="#process"
                    className="text-sm text-muted1 hover:text-brand transition-colors duration-300"
                    >
                    Quy trình
                    </a>
                </li>
                <li>
                    <a
                    href="#testimonials"
                    className="text-sm text-muted1 hover:text-brand transition-colors duration-300"
                    >
                    Đánh giá
                    </a>
                </li>
                <li>
                    <a
                    href="#"
                    className="text-sm text-muted1 hover:text-brand transition-colors duration-300"
                    >
                    Tuyển dụng
                    </a>
                </li>
                </ul>
            </div>

            <div className="md:col-span-4">
                <h4 className="text-xs font-mono tracking-widest uppercase text-subtle mb-4 font-500">
                Nhận tin cập nhật
                </h4>

                <p className="text-sm text-subtle mb-4">
                Nhận tin tức mới nhất về kỹ thuật may mặc, dịch vụ thiết kế và
                các ưu đãi đặc biệt từ HoaTran maymac.
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
                    className="flex-1 bg-card-bg border border-border rounded-xl px-4 py-2.5 text-sm font-body text-dark placeholder-subtle/60 focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all"
                />

                <button
                    type="submit"
                    className="bg-brand! text-white px-5 py-2.5 rounded-xl font-heading font-500 text-sm hover:bg-brand-dark hover:scale-105 transition-all duration-300 shadow-[0_4px_15px_rgba(1,146,245,0.25)]"
                >
                    <ArrowRight className="w-4 h-4" />
                </button>
                </form>
            </div>
            </div>

            <div className="mt-16 pt-8 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-subtle">
                © 2025 HoaTran maymac. All rights reserved.
            </div>

            <div className="flex gap-6">
                <a
                href="#"
                className="text-xs text-subtle hover:text-muted1 transition-colors"
                >
                Chính sách bảo mật
                </a>
                <a
                href="#"
                className="text-xs text-subtle hover:text-muted1 transition-colors"
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