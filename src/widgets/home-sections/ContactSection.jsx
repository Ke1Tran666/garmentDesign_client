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
      className="reveal flex items-center gap-4"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10">
        <Icon className="h-5 w-5 text-brand" />
      </div>
      <div>
        <div className="font-heading text-sm font-medium text-text-strong">
          {label}
        </div>
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
      className="space-y-6 rounded-2xl border border-border/60 bg-surface p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] md:p-10"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block font-mono text-xs tracking-wider text-text-subtle uppercase">
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
          <label className="mb-2 block font-mono text-xs tracking-wider text-text-subtle uppercase">
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
        <label className="mb-2 block font-mono text-xs tracking-wider text-text-subtle uppercase">
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
        <label className="mb-2 block font-mono text-xs tracking-wider text-text-subtle uppercase">
          Dịch vụ cần *
        </label>

        <select
          name="serviceCode"
          required
          className={`${inputCls} cursor-pointer appearance-none text-text-muted`}
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
        <label className="mb-2 block font-mono text-xs tracking-wider text-text-subtle uppercase">
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
        className="btn-shine flex w-full items-center justify-center gap-2 rounded-xl bg-brand! py-3.5 font-heading text-base font-medium tracking-wide text-white transition-all duration-300 hover:scale-[1.02] hover:bg-brand-dark hover:shadow-[0_8px_25px_rgba(1,146,245,0.3)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
        <Send className="h-4 w-4" />
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
      { threshold: 0.15 },
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
        "Vui lòng nhập email của bạn.",
      );
      return;
    }

    try {
      setSubmitting(true);

      await contactApi.send(payload);

      showNotification(
        "success",
        "Gửi thành công",
        "Chúng tôi sẽ phản hồi sớm nhất.",
      );

      form.reset();
    } catch (error) {
      console.error("Lỗi gửi liên hệ:", error);

      showNotification(
        "error",
        "Có lỗi xảy ra!",
        error?.response?.data?.message ||
          "Gửi yêu cầu thất bại. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative bg-surface-subtle/50 px-4 py-24 md:py-32"
    >
      <div className="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <span className="reveal font-mono text-xs font-medium tracking-widest text-brand uppercase">
              Liên hệ
            </span>

            <h2
              className="reveal mt-4 font-heading text-3xl font-medium tracking-tight text-text-strong md:text-4xl"
              style={{ transitionDelay: "100ms" }}
            >
              Kết nối với
              <br />
              <span className="text-text-muted">HoaTran maymac</span>
            </h2>

            <p
              className="font-body font-300 reveal mt-4 text-sm leading-relaxed text-text-muted"
              style={{ transitionDelay: "200ms" }}
            >
              Gửi form hoặc liên hệ trực tiếp. Chúng tôi phản hồi trong vòng 2
              giờ trong giờ hành chính.
            </p>

            <div className="mt-10 space-y-6">
              {CONTACT_INFO.map((item) => (
                <ContactInfo key={item.label} {...item} />
              ))}
            </div>
          </div>

          <div
            className="reveal md:col-span-7"
            style={{ transitionDelay: "200ms" }}
          >
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
