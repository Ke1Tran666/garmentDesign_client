import { Calculator, FileText, PenTool, Scissors } from "lucide-react";

const services = [
    {
        icon: FileText,
        title: "In Sơ Đồ",
        description: "In sơ đồ kỹ thuật (Tech Sketch) chi tiết đầy đủ chi tiết may, đường chỉ, vị trí accessories — chuẩn format xuất khẩu.",
        tags: ["Tech Sketch", "Spec Sheet", "Construction"],
        delay: "100ms"
    },
    {
        icon: Scissors,
        title: "In Rập",
        description: "Xây dựng rập cắt chính xác từ sơ đồ hoặc mẫu thực tế, hỗ trợ grading đa size, xuất file DXF/PLT tương thích mọi máy cắt.",
        tags: ["Pattern", "Grading", "DXF / PLT"],
        delay: "200ms"
    },
    {
        icon: PenTool,
        title: "Thiết Kế",
        description: "Sáng tạo thiết kế thời trang theo yêu cầu  — từ moodboard, phác thảo đến bản vẽ kỹ thuật hoàn chỉnh, thể hiện DNA thương hiệu.",
        tags: ["Moodboard", "Illustration", "Flat Sketch"],
        delay: "300ms"
    },
    {
        icon: Calculator,
        title: "Tính Định Mức",
        description: "Tính toán định mức nguyên phụ liệu chính xác — vải, chỉ, phụ kiện, giúp tối ưu chi phí và kiểm soát hàng tồn kho hiệu quả.",
        tags: ["BOM", "Costing", "Consumption"],
        delay: "400ms"
    },
];

const ServicesTag = ({label}) =>(
    <span className="text-[10px] font-mono tracking-wider uppercase px-3 py-1 rounded-full border border-border text-subtle">
        {label}
    </span>
);

const ServiceCard = ({icon: Icon, title, description, tags, delay}) =>(
    <div className="card-hover rounded-2xl bg-white border border-border/60 p-8 group reveal" style={{transitionDelay: delay}}>
        <div className="flex items-start gap-5">
            <div className="service-icon w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-brand"/>
            </div>
            <div>
                <h3 className="font-heading font-medium text-xl text-dark mb-2">
                    {title}  
                </h3>
                <p className="text-sm text-muted1 leading-relaxed mb-4">
                    {description}    
                </p>
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag)=>(
                        <ServicesTag key={tag} label={tag}/>
                    ))}
                </div>
            </div>
        </div>
    </div>
)

const ServicesSection = () => {
  return (
    <>
        <section id="services" className="relative py-24 md:py-32 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                        <span className="text-xs font-mono tracking-widest uppercase text-brand font-medium reveal">Dịch vụ</span>
                        <h2 className="font-heading text-3xl md:text-5xl font-medium tracking-tight mt-4 text-dark reveal" style={{transitionDelay:"100ms"}}>
                            4 dịch vụ
                            <span className="text-muted1"> cốt lõi</span>
                        </h2>
                        <p className="text-muted1 font-body font-300 mt-4 max-w-lg mx-auto reveal" style={{transitionDelay:"200ms"}}>
                            Đầy đủ công đoạn kỹ thuật cho ngành may mặc — từ bản vẽ đến con số sản xuất.
                        </p>
                </div>
        
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service)=>(
                        <ServiceCard key={service.title} {...service}/>
                    ))};
                </div>
            </div>
        </section>
    </>
  )
}

export default ServicesSection