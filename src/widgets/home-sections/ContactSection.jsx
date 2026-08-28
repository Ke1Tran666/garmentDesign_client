import { useEffect, useMemo, useState } from "react";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { useNotification } from "@/app/providers/NotificationProvider";
import { serviceApi } from "@/entities/service/api/serviceApi";
import { contactApi } from "@/features/contact/api/contactApi";

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Địa chỉ",
    value: "113/54/29 Lâm Thị Hố, Trung Mỹ Tây, TP.HCM",
    delay: 300,
  },
  {
    icon: Mail,
    label: "Email",
    value: "hoatranmaymac@gmail.com",
    delay: 400,
  },
  {
    icon: Clock,
    label: "Giờ làm việc",
    value: "T2–T6: 8:00–18:00 | T7: 9:00–15:00",
    delay: 500,
  },
  {
    icon: Phone,
    label: "Hotline",
    value: "0918 414 470 (Zalo)",
    delay: 600,
  },
];

const inputCls =
  "w-full bg-surface-subtle border border-border rounded-xl px-4 py-3 text-sm font-body text-text-strong placeholder:text-text-subtle/60 focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all";

const ContactInfo = ({ icon: Icon, label, value, delay }) => {
  return (
    <div
      className="flex items-center gap-4 reveal"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-brand" />
      </div>
      <div>
        <div className="text-sm font-heading font-medium text-text-strong">{label}</div>
        <div className="text-xs text-text-subtle">{value}</div>
      </div>
    </div>
  );
};

function ContactForm({ onSubmit, services, loadingServices, submitting }) {
  return (
    <form
      id="contactForm"
      onSubmit={onSubmit}
      className="rounded-2xl bg-surface border border-border/60 p-8 md:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-mono tracking-wider uppercase text-text-subtle mb-2 block">
            Họ tên *
          </label>
          <input
            name="fullName"
            type="text"
            placeholder="Nguyễn Văn A"
            required
            className={inputCls}
          />
        </div>

        <div>
          <label className="text-xs font-mono tracking-wider uppercase text-text-subtle mb-2 block">
            Số điện thoại *
          </label>
          <input
            name="phone"
            type="tel"
            placeholder="090 123 4567"
            required
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-mono tracking-wider uppercase text-text-subtle mb-2 block">
          Email *
        </label>
        <input
          name="email"
          type="email"
          placeholder="email@example.com"
          required
          className={inputCls}
        />
      </div>

      <div>
        <label className="text-xs font-mono tracking-wider uppercase text-text-subtle mb-2 block">
          Dịch vụ cần *
        </label>

        <select
          name="serviceCode"
          required
          className={`${inputCls} appearance-none cursor-pointer text-text-muted`}
          defaultValue=""
          disabled={loadingServices || submitting}
        >
          <option value="" disabled>
            {loadingServices ? "Đang tải dịch vụ..." : "Chọn dịch vụ"}
          </option>

          {services.map((service) => (
            <option key={service.serviceId} value={service.serviceCode}>
              {service.serviceName} - {service.serviceCode}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-mono tracking-wider uppercase text-text-subtle mb-2 block">
          Mô tả yêu cầu
        </label>
        <textarea
          name="message"
          rows={4}
          placeholder="Mô tả sản phẩm, số lượng, deadline..."
          className={`${inputCls} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-shine w-full bg-brand! text-white font-heading font-medium text-base py-3.5 rounded-xl tracking-wide transition-all duration-300 hover:bg-brand-dark hover:scale-[1.02] hover:shadow-[0_8px_25px_rgba(1,146,245,0.3)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}

const ContactSection = () => {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { showNotification } = useNotification();

  const activeServices = useMemo(() => {
    return services.filter((item) => {
      const status = item.status?.trim().toLowerCase();
      return !item.deletedAt && (!status || status === "active");
    });
  }, [services]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await serviceApi.getAll();
        setServices(data || []);
      } catch (error) {
        console.error("Lỗi lấy danh sách dịch vụ:", error);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [activeServices]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      serviceCode: formData.get("serviceCode"),
      message: formData.get("message"),
    };

    if (!payload.email) {
      showNotification(
        "error",
        "Có lỗi xảy ra!",
        "Vui lòng nhập email của bạn."
      );
      return;
    }

    try {
      setSubmitting(true);

      await contactApi.send(payload);

      showNotification(
        "success",
        "Gửi thành công",
        "Chúng tôi sẽ phản hồi sớm nhất."
      );

      form.reset();
    } catch (error) {
      console.error("Lỗi gửi liên hệ:", error);

      showNotification(
        "error",
        "Có lỗi xảy ra!",
        error?.response?.data?.message ||
          "Gửi yêu cầu thất bại. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 md:py-32 px-4 bg-surface-subtle/50">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-5">
            <span className="text-xs font-mono tracking-widest uppercase text-brand font-medium reveal">
              Liên hệ
            </span>

            <h2
              className="font-heading text-3xl md:text-4xl font-medium tracking-tight mt-4 text-text-strong reveal"
              style={{ transitionDelay: "100ms" }}
            >
              Kết nối với
              <br />
              <span className="text-text-muted">HoaTran maymac</span>
            </h2>

            <p
              className="text-text-muted font-body font-300 mt-4 text-sm leading-relaxed reveal"
              style={{ transitionDelay: "200ms" }}
            >
              Gửi form hoặc liên hệ trực tiếp. Chúng tôi phản hồi trong vòng 2 giờ trong giờ hành chính.
            </p>

            <div className="mt-10 space-y-6">
              {CONTACT_INFO.map((item) => (
                <ContactInfo key={item.label} {...item} />
              ))}
            </div>
          </div>

          <div className="md:col-span-7 reveal" style={{ transitionDelay: "200ms" }}>
            <ContactForm
              onSubmit={handleSubmit}
              services={activeServices}
              loadingServices={loadingServices}
              submitting={submitting}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
