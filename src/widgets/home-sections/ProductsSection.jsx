import { useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "ao", label: "Áo" },
  { id: "quan", label: "Quần" },
  { id: "vay", label: "Váy / Đầm" },
];

const products = {
  all: [
    {
      id: 1,
      img: "shirt-white-design",
      name: "Áo Sơ Mi Slim",
      service: "In sơ đồ + In rập",
    },
    {
      id: 2,
      img: "trousers-dark-blue",
      name: "Quần Tây Công Sở",
      service: "Thiết kế + Tính định mức",
    },
    {
      id: 3,
      img: "dress-elegant-red",
      name: "Đầm Maxi Hoa",
      service: "Trọn gói 4 dịch vụ",
    },
    {
      id: 4,
      img: "polo-shirt-knit",
      name: "Áo Polo Knit",
      service: "In rập + Định mức",
    },
    {
      id: 5,
      img: "jacket-canvas-brown",
      name: "Áo Khoác Canvas",
      service: "In sơ đồ + Thiết kế",
    },
    {
      id: 6,
      img: "skirt-pleated-gray",
      name: "Chân Váy Nếp Gấp",
      service: "In rập + Tính định mức",
    },
  ],
  ao: [
    {
      id: 1,
      img: "tshirt-oversized-black",
      name: "Áo T-Shirt Oversized",
      service: "In sơ đồ + In rập",
    },
    {
      id: 2,
      img: "shirt-white-design",
      name: "Áo Sơ Mi Slim",
      service: "Trọn gói",
    },
  ],
  quan: [
    {
      id: 1,
      img: "trousers-dark-blue",
      name: "Quần Tây Công Sở",
      service: "Thiết kế + Định mức",
    },
  ],
  vay: [
    {
      id: 1,
      img: "dress-elegant-red",
      name: "Đầm Maxi Hoa",
      service: "Trọn gói 4 dịch vụ",
    },
    {
      id: 2,
      img: "skirt-pleated-gray",
      name: "Chân Váy Nếp Gấp",
      service: "In rập + Định mức",
    },
  ],
};

const ProductCard = ({ img, name, service }) => (
  <div className="card-hover group overflow-hidden rounded-2xl border border-border/60 bg-surface">
    <div className="img-hover aspect-4/5 overflow-hidden">
      <img
        src={`https://picsum.photos/seed/${img}/600/750.jpg`}
        alt={name}
        className="h-full w-full object-cover"
      />
    </div>
    <div className="p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-heading text-base font-medium text-text-strong">
            {name}
          </h3>
          <p className="mt-1 text-xs text-text-subtle">{service}</p>
        </div>
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border transition-all duration-300 group-hover:border-brand/40 group-hover:bg-brand-50 group-hover:text-brand">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  </div>
);

const ProductsSection = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isVisible, setIsVisible] = useState(true);
  const prevTabRef = useRef("all");

  const handleTabClick = (tabId) => {
    if (tabId === activeTab) return;

    setIsVisible(false);

    setTimeout(() => {
      prevTabRef.current = tabId;
      setActiveTab(tabId);

      setIsVisible(true);
    }, 220);
  };

  return (
    <section
      id="products"
      className="relative bg-surface-subtle/50 px-4 py-24 md:py-32"
    >
      <div className="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="reveal mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-mono text-xs font-medium tracking-widest text-brand uppercase">
              Sản phẩm
            </span>
            <h2 className="mt-4 font-heading text-3xl font-medium tracking-tight text-text-strong md:text-5xl">
              Sản phẩm của chúng tôi
            </h2>
            <p className="mt-3 max-w-lg font-light text-text-muted">
              Những sản phẩm thực tế chúng tôi đã hoàn thành cho khách hàng trên
              khắp Việt Nam.
            </p>
          </div>
          <a
            href="#"
            className="group inline-flex shrink-0 items-center gap-2 self-start font-heading text-base font-medium text-brand transition-all duration-300 hover:gap-3 md:self-auto"
          >
            Xem thêm
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>

        {/* Tab Buttons */}
        <div
          className="reveal mb-10 flex gap-2"
          style={{ transitionDelay: "150ms" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`tab-btn rounded-full border px-5 py-2 font-heading text-sm transition-all duration-300 hover:border-brand/30 ${activeTab === tab.id ? "active border-brand text-brand" : "border-border text-text-muted"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          id={`tab-${activeTab}`}
          className={`tab-content grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 ${isVisible ? "active" : ""}`}
        >
          {products[activeTab].map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
