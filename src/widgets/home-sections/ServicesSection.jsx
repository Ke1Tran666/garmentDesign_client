import { useEffect, useMemo, useState } from "react";
import { Calculator, FileText, PenTool, Scissors } from "lucide-react";
import { serviceApi } from "@/entities/service/api/serviceApi";

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
  <span className="rounded-full border border-border px-3 py-1 font-mono text-[10px] tracking-wider text-text-subtle uppercase">
    {label}
  </span>
);

const ServiceCard = ({ service, delay, className = "" }) => {
  const meta = serviceMeta[service.serviceCode] || {};
  const Icon = meta.icon || FileText;

  return (
    <div
      className={`card-hover group reveal rounded-2xl border border-border/60 bg-surface p-8 ${className}`}
      style={{ transitionDelay: delay }}
    >
      <div className="flex items-start gap-5">
        <div className="service-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand/10">
          <Icon className="h-6 w-6 text-brand" />
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="font-heading text-xl font-medium text-text-strong">
              {service.serviceName}
            </h3>

            <span className="rounded-full bg-brand/10 px-2 py-1 font-mono text-[10px] text-brand">
              {service.serviceCode}
            </span>
          </div>

          <p className="mb-4 text-sm leading-relaxed text-text-muted">
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
      { threshold: 0.15 },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [activeServices]);

  return (
    <section id="services" className="relative px-4 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <span className="reveal font-mono text-xs font-medium tracking-widest text-brand uppercase">
            Dịch vụ
          </span>

          <h2
            className="reveal mt-4 font-heading text-3xl font-medium tracking-tight text-text-strong md:text-5xl"
            style={{ transitionDelay: "100ms" }}
          >
            {loading ? "Đang tải" : activeServices.length} dịch vụ
            <span className="text-text-muted"> cốt lõi</span>
          </h2>

          <p
            className="font-body font-300 reveal mx-auto mt-4 max-w-lg text-text-muted!"
            style={{ transitionDelay: "200ms" }}
          >
            Đầy đủ công đoạn kỹ thuật cho ngành may mặc — từ bản vẽ đến con số
            sản xuất.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-text-muted">Đang tải dịch vụ...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
