
const PROCESS = [
    {
        number:"01",
        title: "Nhận yêu cầu",
        description: "Bạn gửi mẫu ảnh, sketch hoặc mô tả sản phẩm cần thực hiện.",
        delay: "100ms"
    },
    {
        number:"02",
        title: "Phân tích & Báo giá",
        description: "Đội ngũ kỹ thuật phân tích độ phức tạp, báo giá và thời gian hoàn thành.",
        delay: "250ms"
    },
    {
        number:"03",
        title: "Thực hiện",
        description: "Tiến hành in sơ đồ, rập, thiết kế hoặc tính định mức theo yêu cầu.",
        delay: "400ms"
    },
    {
        number:"04",
        title: "Kiểm tra & Bàn giao",
        description: "QC kỹ thuật, chỉnh sửa theo feedback, bàn giao file cuối cùng.",
        delay: "550ms"
    }
];

const ProcessCard = ({number,title, description,delay}) =>(
    <div className="reveal text-center" style={{transitionDelay:delay}}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border-2 border-brand/20 shadow-[0_4px_20px_rgba(1,146,245,0.1)] mb-6">
            <span className="font-heading text-xl font-500 text-brand">{number}</span>
        </div>
        <h3 className="font-heading font-500 text-lg text-dark mb-2">{title}</h3>
        <p className="text-sm text-subtle leading-relaxed">{description}</p>
    </div>
)

const ProcessSection = () => {
  return (
    <>
        <section id="process" className="relative py-24 md:py-32 px-4 bg-card-bg/50">
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent">
            </div>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-xs font-mono tracking-widest uppercase text-brand font-medium reveal">Quy trình</span>
                    <h2 className="font-heading text-3xl md:text-5xl font-medium tracking-tight mt-4 text-dark reveal" style={{transitionDelay:"100ms"}}>
                        4 bước <span className="text-muted">đơn giản</span>
                    </h2>
                </div>

                {/* <!-- 4 bước --> */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {PROCESS.map((process)=>(
                        <ProcessCard key={process.title} {...process}/>
                    ))}
                </div>

                {/* <!-- Image Năng lực — cách 4 bước đúng 20px, không có connecting line --> */}
                <div className="mt-5 rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] reveal"
                    style={{transitionDelay:"300ms"}}>
                    <div className="relative img-hover" style={{aspectRatio: "21/9"}}>
                        <img src="https://picsum.photos/seed/sewing-factory-bright/1400/600.jpg" alt="Xưởng" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent"></div>
                        <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                            <div>
                                <div className="text-xs font-mono tracking-widest uppercase text-brand mb-2 font-500">Năng lực
                                </div>
                                <div className="font-heading text-2xl font-500 text-white">Xử lý 200+ đơn mỗi tháng</div>
                            </div>
                            <div className="flex gap-6">
                                <div className="text-center">
                                    <div className="font-heading text-xl font-500 text-white">24h</div>
                                    <div className="text-xs text-white/60">Sơ đồ</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-heading text-xl font-500 text-white">48h</div>
                                    <div className="text-xs text-white/60">Rập cắt</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </>
  )
}

export default ProcessSection