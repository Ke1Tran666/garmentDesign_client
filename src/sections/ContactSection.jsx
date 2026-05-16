import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";

const CONTACT_INFO = [
    { 
        icon: MapPin,
        label: "Địa chỉ",
        value: "113/54/29 Lâm Thị Hố, Trung Mỹ Tây, TP.HCM",
        delay: 300 
    },
    { 
        icon: Mail,    
        label: "Email",   
        value: "info@hoatranmaymac.vn",            
        delay: 400 
    },
    { 
        icon: Clock,   
        label: "Giờ làm việc", 
        value: "T2–T6: 8:00–18:00 | T7: 9:00–15:00", 
        delay: 500 
    },
    { 
        icon: Phone,   
        label: "Hotline", 
        value: "0918 414 470 (Zalo)",        
        delay: 600 
    },
];

const SERVICES = ["In Sơ Đồ", "In Rập", "Thiết Kế", "Tính Định Mức", "Combo nhiều dịch vụ"];

const inputCls =
  "w-full bg-card-bg border border-border rounded-xl px-4 py-3 text-sm font-body text-dark placeholder-subtle/60 focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all";

const ContactInfo = ({ icon: Icon, label, value, delay }) => {
  return (
    <div className="flex items-center gap-4 reveal" style={{ transitionDelay: `${delay}ms` }}>
      <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-brand"/>
      </div>
      <div>
        <div className="text-sm font-heading font-medium text-dark">{label}</div>
        <div className="text-xs text-subtle">{value}</div>
      </div>
    </div>
  );
};

function ContactForm({ onSubmit }) {
  return (
    <form
      id="contactForm"
      onSubmit={onSubmit}
      className="rounded-2xl bg-white border border-border/60 p-8 md:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { label: "Họ tên *",          type: "text",  placeholder: "Nguyễn Văn A" },
          { label: "Số điện thoại *",   type: "tel",   placeholder: "090 123 4567" },
        ].map(({ label, type, placeholder }) => (
          <div key={label}>
            <label className="text-xs font-mono tracking-wider uppercase text-subtle mb-2 block">{label}</label>
            <input type={type} placeholder={placeholder} required className={inputCls} />
          </div>
        ))}
      </div>

      <div>
        <label className="text-xs font-mono tracking-wider uppercase text-subtle mb-2 block">Email *</label>
        <input type="email" placeholder="email@example.com" required className={inputCls} />
      </div>

      <div>
        <label className="text-xs font-mono tracking-wider uppercase text-subtle mb-2 block">Dịch vụ cần *</label>
        <select required className={`${inputCls} appearance-none cursor-pointer text-muted`} defaultValue="">
          <option value="" disabled>Chọn dịch vụ</option>
          {SERVICES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-mono tracking-wider uppercase text-subtle mb-2 block">Mô tả yêu cầu</label>
        <textarea
          rows={4}
          placeholder="Mô tả sản phẩm, số lượng, deadline..."
          className={`${inputCls} resize-none`}
        />
      </div>

      <button
        type="submit"
        className="btn-shine w-full bg-brand! text-white font-heading font-medium text-base py-3.5 rounded-xl tracking-wide transition-all duration-300 hover:bg-brand-dark hover:scale-[1.02] hover:shadow-[0_8px_25px_rgba(1,146,245,0.3)] flex items-center justify-center gap-2"
      >
        Gửi yêu cầu
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}

const ContactSection = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // showToast('Đã gửi thành công!', 'Chúng tôi sẽ phản hồi trong 2 giờ.');
    e.target.reset();
  };

  return (
    <section id="contact" className="relative py-24 md:py-32 px-4 bg-card-bg/50">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">

          {/* Left column */}
          <div className="md:col-span-5">
            <span className="text-xs font-mono tracking-widest uppercase text-brand font-medium reveal">Liên hệ</span>
            <h2
              className="font-heading text-3xl md:text-4xl font-medium tracking-tight mt-4 text-dark reveal"
              style={{ transitionDelay: "100ms" }}
            >
              Kết nối với<br />
              <span className="text-muted">HoaTran maymac</span>
            </h2>
            <p
              className="text-muted font-body font-300 mt-4 text-sm leading-relaxed reveal"
              style={{ transitionDelay: "200ms" }}
            >
              Gửi form hoặc liên hệ trực tiếp. Chúng tôi phản hồi trong vòng 2 giờ trong giờ hành chính.
            </p>

            <div className="mt-10 space-y-6">
              {CONTACT_INFO.map((item) => (
                <ContactInfo key={item.label} {...item} />
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="md:col-span-7 reveal" style={{ transitionDelay: "200ms" }}>
            <ContactForm onSubmit={handleSubmit} />
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;