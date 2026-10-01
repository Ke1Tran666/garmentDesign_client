const PROCESS = [
  {
    number: "01",
    title: "Nhận yêu cầu",
    description: "Bạn gửi mẫu ảnh, sketch hoặc mô tả sản phẩm cần thực hiện.",
    delay: "100ms",
  },
  {
    number: "02",
    title: "Phân tích & Báo giá",
    description:
      "Đội ngũ kỹ thuật phân tích độ phức tạp, báo giá và thời gian hoàn thành.",
    delay: "250ms",
  },
  {
    number: "03",
    title: "Thực hiện",
    description:
      "Tiến hành in sơ đồ, rập, thiết kế hoặc tính định mức theo yêu cầu.",
    delay: "400ms",
  },
  {
    number: "04",
    title: "Kiểm tra & Bàn giao",
    description:
      "QC kỹ thuật, chỉnh sửa theo feedback, bàn giao file cuối cùng.",
    delay: "550ms",
  },
];

const ProcessCard = ({ number, title, description, delay }) => (
  <div className="reveal text-center" style={{ transitionDelay: delay }}>
    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-brand/20 bg-surface shadow-[0_4px_20px_rgba(1,146,245,0.1)]">
      <span className="font-500 font-heading text-xl text-brand">{number}</span>
    </div>
    <h3 className="font-500 mb-2 font-heading text-lg text-text-strong">
      {title}
    </h3>
    <p className="text-sm leading-relaxed text-text-subtle">{description}</p>
  </div>
);

const ProcessSection = () => {
  return (
    <>
      <section
        id="process"
        className="relative bg-surface-subtle/50 px-4 py-24 md:py-32"
      >
        <div className="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-border to-transparent"></div>
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="reveal font-mono text-xs font-medium tracking-widest text-brand uppercase">
              Quy trình
            </span>
            <h2
              className="reveal mt-4 font-heading text-3xl font-medium tracking-tight text-text-strong md:text-5xl"
              style={{ transitionDelay: "100ms" }}
            >
              4 bước <span className="text-text-muted">đơn giản</span>
            </h2>
          </div>

          {/* <!-- 4 bước --> */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {PROCESS.map((process) => (
              <ProcessCard key={process.title} {...process} />
            ))}
          </div>

          {/* <!-- Image Năng lực — cách 4 bước đúng 20px, không có connecting line --> */}
          <div
            className="reveal mt-5 overflow-hidden rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]"
            style={{ transitionDelay: "300ms" }}
          >
            <div className="img-hover relative" style={{ aspectRatio: "21/9" }}>
              <img
                src="https://picsum.photos/seed/sewing-factory-bright/1400/600.jpg"
                alt="Xưởng"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute right-8 bottom-8 left-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <div className="font-500 mb-2 font-mono text-xs tracking-widest text-brand uppercase">
                    Năng lực
                  </div>
                  <div className="font-500 font-heading text-2xl text-white">
                    Xử lý 200+ đơn mỗi tháng
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="font-500 font-heading text-xl text-white">
                      24h
                    </div>
                    <div className="text-xs text-white/60">Sơ đồ</div>
                  </div>
                  <div className="text-center">
                    <div className="font-500 font-heading text-xl text-white">
                      48h
                    </div>
                    <div className="text-xs text-white/60">Rập cắt</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProcessSection;
