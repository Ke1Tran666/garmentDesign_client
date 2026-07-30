import { useEffect, useMemo, useState } from "react";
import { Calculator, FileText, PenTool, Scissors } from "lucide-react";
import { serviceApi } from "@/api/serviceApi";

const serviceMeta = {
  DES001: {
    icon: PenTool,
  },
  MAR001: {
    icon: FileText,
  },
  PAT001: {
    icon: Scissors,
  },
  GRA001: {
    icon: Scissors,
  },
  CON001: {
    icon: Calculator,
  },
};

const ServicesTag = ({ label }) => (
  <span className="text-[10px] font-mono tracking-wider uppercase px-3 py-1 rounded-full border border-border text-text-subtle">
    {label}
  </span>
);

const ServiceCard = ({ service, delay, className = "" }) => {
  const meta = serviceMeta[service.serviceCode] || {};
  const Icon = meta.icon || FileText;

  return (
    <div
      className={`card-hover rounded-2xl bg-surface border border-border/60 p-8 group reveal ${className}`}
      style={{ transitionDelay: delay }}
    >
      <div className="flex items-start gap-5">
        <div className="service-icon w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-brand" />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-heading font-medium text-xl text-text-strong">
              {service.serviceName}
            </h3>

            <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-brand/10 text-brand">
              {service.serviceCode}
            </span>
          </div>

          <p className="text-sm text-text-muted leading-relaxed mb-4">
            {service.description || "Chưa có mô tả dịch vụ."}
          </p>

          <div className="flex flex-wrap gap-2">
            {(service.tags
            ? service.tags.split(",").map((tag) => tag.trim())
            : [service.unitType]
            ).map((tag) => (
            <ServicesTag key={tag} label={tag} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ServicesSection = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
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

  return (
    <section id="services" className="relative py-24 md:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-mono tracking-widest uppercase text-brand font-medium reveal">
            Dịch vụ
          </span>

          <h2
            className="font-heading text-3xl md:text-5xl font-medium tracking-tight mt-4 text-text-strong reveal"
            style={{ transitionDelay: "100ms" }}
          >
            {loading ? "Đang tải" : activeServices.length} dịch vụ
            <span className="text-text-muted"> cốt lõi</span>
          </h2>

          <p
            className="text-text-muted! font-body font-300 mt-4 max-w-lg mx-auto reveal"
            style={{ transitionDelay: "200ms" }}
          >
            Đầy đủ công đoạn kỹ thuật cho ngành may mặc — từ bản vẽ đến con số sản xuất.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-text-muted">Đang tải dịch vụ...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeServices.map((service, index) => {
              const isLastOdd =
                activeServices.length % 2 !== 0 &&
                index === activeServices.length - 1;

              return (
                <ServiceCard
                  key={service.serviceId}
                  service={service}
                  delay={`${(index + 1) * 100}ms`}
                  className={isLastOdd ? "md:col-span-2" : ""}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;