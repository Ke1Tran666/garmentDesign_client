import { Star } from "lucide-react";

const stars = (count) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-4 h-4 ${i < count ? "text-brand fill-brand" : "text-subtle/30"}`} />
  ));

const testimonials = [
  {
    text: "In rập cực kỳ chuẩn, grading size đồng đều từ S đến 3XL. File DXF đưa thẳng vào máy cắt không cần chỉnh sửa gì thêm. Rất tiết kiệm thời gian.",
    name: "Thanh Hà", 
    initials: "TH", 
    role: "QC Manager — Xưởng may ABC", 
    stars: 5, 
    delay: 100,
  },
  {
    text: "Dịch vụ tính định mức giúp công ty mình giảm 8% chi phí nguyên liệu mỗi tháng. Bảng BOM chi tiết, dễ hiểu, xưởng sản xuất rất thích.",
    name: "Minh Luân", 
    initials: "ML", 
    role: "Giám đốc — Fashion Lab VN", 
    stars: 5, 
    delay: 250,
  },
  {
    text: "Đã dùng 3 dịch vụ: in sơ đồ, in rập và thiết kế. Quality ổn định, giao đúng deadline. Hợp tác được 2 năm rồi vẫn rất hài lòng.",
    name: "Phương Ngân", 
    initials: "PN", 
    role: "Founder — Ngân's Boutique", 
    stars: 4, 
    delay: 400,
  },
];

const TestimonialsSection = () => (
  <section id="testimonials" className="relative py-24 md:py-32 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-xs font-mono tracking-widest uppercase text-brand font-medium reveal">Đánh giá</span>
        <h2 className="font-heading text-3xl md:text-5xl font-medium tracking-tight mt-4 text-dark reveal" style={{ transitionDelay: "100ms" }}>
          Khách hàng <span className="text-muted1">nói gì</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map(({ text, name, initials, role, stars: count, delay }) => (
          <div key={name} className="card-hover rounded-2xl bg-surface border border-border/60 p-7 reveal" style={{ transitionDelay: `${delay}ms` }}>
            <div className="flex gap-1 mb-5">{stars(count)}</div>
            <p className="text-sm text-muted1 leading-relaxed mb-6">"{text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                <span className="font-heading text-sm font-medium text-brand">{initials}</span>
              </div>
              <div>
                <div className="text-sm font-heading font-medium text-dark">{name}</div>
                <div className="text-xs text-subtle">{role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;