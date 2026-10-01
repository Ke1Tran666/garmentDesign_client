import { Star } from "lucide-react";

const stars = (count) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${i < count ? "fill-brand text-brand" : "text-text-subtle/30"}`}
    />
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
  <section id="testimonials" className="relative px-4 py-24 md:py-32">
    <div className="mx-auto max-w-6xl">
      <div className="mb-16 text-center">
        <span className="reveal font-mono text-xs font-medium tracking-widest text-brand uppercase">
          Đánh giá
        </span>
        <h2
          className="reveal mt-4 font-heading text-3xl font-medium tracking-tight text-text-strong md:text-5xl"
          style={{ transitionDelay: "100ms" }}
        >
          Khách hàng <span className="text-text-muted">nói gì</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map(
          ({ text, name, initials, role, stars: count, delay }) => (
            <div
              key={name}
              className="card-hover reveal rounded-2xl border border-border/60 bg-surface p-7"
              style={{ transitionDelay: `${delay}ms` }}
            >
              <div className="mb-5 flex gap-1">{stars(count)}</div>
              <p className="mb-6 text-sm leading-relaxed text-text-muted">
                "{text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                  <span className="font-heading text-sm font-medium text-brand">
                    {initials}
                  </span>
                </div>
                <div>
                  <div className="font-heading text-sm font-medium text-text-strong">
                    {name}
                  </div>
                  <div className="text-xs text-text-subtle">{role}</div>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
