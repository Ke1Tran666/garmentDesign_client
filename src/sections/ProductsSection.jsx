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
    { id: 1, img: "shirt-white-design", name: "Áo Sơ Mi Slim", service: "In sơ đồ + In rập" },
    { id: 2, img: "trousers-dark-blue", name: "Quần Tây Công Sở", service: "Thiết kế + Tính định mức" },
    { id: 3, img: "dress-elegant-red", name: "Đầm Maxi Hoa", service: "Trọn gói 4 dịch vụ" },
    { id: 4, img: "polo-shirt-knit", name: "Áo Polo Knit", service: "In rập + Định mức" },
    { id: 5, img: "jacket-canvas-brown", name: "Áo Khoác Canvas", service: "In sơ đồ + Thiết kế" },
    { id: 6, img: "skirt-pleated-gray", name: "Chân Váy Nếp Gấp", service: "In rập + Tính định mức" },
  ],
  ao: [
    { id: 1, img: "tshirt-oversized-black", name: "Áo T-Shirt Oversized", service: "In sơ đồ + In rập" },
    { id: 2, img: "shirt-white-design", name: "Áo Sơ Mi Slim", service: "Trọn gói" },
  ],
  quan: [
    { id: 1, img: "trousers-dark-blue", name: "Quần Tây Công Sở", service: "Thiết kế + Định mức" },
  ],
  vay: [
    { id: 1, img: "dress-elegant-red", name: "Đầm Maxi Hoa", service: "Trọn gói 4 dịch vụ" },
    { id: 2, img: "skirt-pleated-gray", name: "Chân Váy Nếp Gấp", service: "In rập + Định mức" },
  ],
};

const ProductCard = ({ img, name, service }) => (
  <div className="card-hover rounded-2xl overflow-hidden bg-white border border-border/60 group">
    <div className="img-hover aspect-4/5 overflow-hidden">
      <img
        src={`https://picsum.photos/seed/${img}/600/750.jpg`}
        alt={name}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-heading font-medium text-base text-dark">{name}</h3>
          <p className="text-xs text-subtle mt-1">{service}</p>
        </div>
        <span className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-brand/40 group-hover:text-brand group-hover:bg-brand-50 transition-all duration-300 shrink-0 mt-0.5">
          <ArrowUpRight className="w-3.5 h-3.5" />
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
    <section id="products" className="relative py-24 md:py-32 px-4 bg-card-bg/50">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 reveal">
          <div>
            <span className="text-xs font-mono tracking-widest uppercase text-brand font-medium">Sản phẩm</span>
            <h2 className="font-heading text-3xl md:text-5xl font-medium tracking-tight mt-4 text-dark">
              Sản phẩm của chúng tôi
            </h2>
            <p className="text-muted font-light mt-3 max-w-lg">
              Những sản phẩm thực tế chúng tôi đã hoàn thành cho khách hàng trên khắp Việt Nam.
            </p>
          </div>
          <a href="#" className="inline-flex items-center gap-2 text-brand font-heading font-medium text-base hover:gap-3 transition-all duration-300 self-start md:self-auto shrink-0 group">
            Xem thêm
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 mb-10 reveal" style={{ transitionDelay: "150ms" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`tab-btn text-sm font-heading px-5 py-2 rounded-full border transition-all duration-300 hover:border-brand/30 
                ${activeTab === tab.id ? "active border-brand text-brand" : "border-border text-muted"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          id={`tab-${activeTab}`}
          className={`tab-content grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 ${isVisible ? "active" : ""}`}>
          {products[activeTab].map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;