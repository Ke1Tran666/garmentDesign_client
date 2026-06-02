import { useState } from "react";
import {
  Bell,
  User,
  LayoutDashboard,
  ClipboardList,
  FileText,
  BarChart2,
  Settings,
  Upload,
  X,
  Camera,
  ChevronDown,
  Settings2,
  Wrench,
  Shield,
  Globe,
  Monitor,
  BellRing,
  Lock,
  CreditCard,
  LineChart,
  FolderDown,
  Plug,
  HelpCircle,
  CircleDot,
} from "lucide-react";
import Logo from '../../components/common/Logo/Logo'
import FloatingInput from "../../components/ui/Form/FloatingInput";
import BirthdayInput from "../../components/ui/Form/BirthdayInput";
import GooeySearchBar from "@/components/ui/Search/GooeySearchBar";

const BRAND = "var(--color-brand)";
const BRAND_SHADOW = "rgba(1,146,245,0.35)";

// 4 nhóm tương ứng với 4 nút dưới
const GROUPS = [
  {
    btn: { icon: ChevronDown, bg: "#202124", shadow: "rgba(0,0,0,0.25)", dark: false },
    label: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard" },
      { icon: ClipboardList, label: "Appoint List" },
      { icon: FileText, label: "Reports" },
      { icon: User, label: "My Profile" },
      { icon: BarChart2, label: "Clinic Overview" },
    ],
    defaultItem: 0,
  },
  {
    btn: { icon: Settings, bg: "#ffffff", shadow: "rgba(15,23,42,0.08)", dark: true },
    label: "Settings",
    items: [
      { icon: Globe, label: "General" },
      { icon: BellRing, label: "Notifications" },
      { icon: Monitor, label: "Display" },
      { icon: Settings2, label: "Preferences" },
    ],
    defaultItem: 0,
  },
  {
    btn: { icon: CircleDot, bg: BRAND, shadow: BRAND_SHADOW, dark: false },
    label: "Account",
    items: [
      { icon: User, label: "My Profile" },
      { icon: Shield, label: "Security" },
      { icon: Lock, label: "Privacy" },
      { icon: CreditCard, label: "Billing" },
    ],
    defaultItem: 0,
  },
  {
    btn: { icon: Wrench, bg: "#ffffff", shadow: "rgba(15,23,42,0.08)", dark: true },
    label: "Tools",
    items: [
      { icon: LineChart, label: "Analytics" },
      { icon: FolderDown, label: "Export" },
      { icon: Plug, label: "Integrations" },
      { icon: HelpCircle, label: "Help" },
    ],
    defaultItem: 0,
  },
];

const ProfilePage = () => {
  const [activeGroup, setActiveGroup] = useState(2);   // mặc định nhóm Account (brand)
  const [activeItem, setActiveItem] = useState(0);     // item đầu tiên trong nhóm


  const currentGroup = GROUPS[activeGroup];

  const handleGroupChange = (gIndex) => {
    setActiveGroup(gIndex);
    setActiveItem(GROUPS[gIndex].defaultItem);
  };


  const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 10) {
    return "Chào buổi sáng";
  }

  if (hour >= 10 && hour < 13) {
    return "Chào buổi trưa";
  }

  if (hour >= 13 && hour < 18) {
    return "Chào buổi chiều";
  }

  return "Chào buổi tối";
};

  return (
    <div className="min-h-screen bg-[#eef3f9] p-6">
      <div className="mx-auto flex min-h-180 max-w-7xl overflow-hidden rounded-4xl bg-white shadow-xl">

        {/* LEFT SIDEBAR */}
        <aside className="w-70 bg-white px-7 py-8 flex flex-col">
          {/* LOGO */}
          <Logo />

          {/* GREETING */}
          <div className="mb-10 mt-10 flex flex-col justify-center items-center">
            <h2 className="text-2xl font-semibold leading-tight text-gray-900">
              {getGreeting()}
            </h2>
            <h3
                className="mt-1 text-xl font-bold"
                style={{ color: BRAND }}
            >
                Kei Tran
            </h3>
            <p className="mt-2 text-sm text-gray-400">
                {new Date().toLocaleDateString("vi-VN", {
                weekday: "short",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                })}
            </p>
          </div>

          {/* MENU — nội dung thay đổi theo nhóm */}
          <nav className="rounded-3xl bg-[#f6f8fc] p-4">
            {currentGroup.items.map((item, index) => {
              const Icon = item.icon;
              return (
                <SidebarItem
                  key={item.label}
                  icon={<Icon size={18} />}
                  label={item.label}
                  active={activeItem === index}
                  onClick={() => setActiveItem(index)}
                />
              );
            })}
          </nav>

          {/* BOTTOM FLOATING BUTTONS */}
          <div className="mt-3 flex items-center justify-center gap-3">
            {GROUPS.map((group, gIndex) => {
              const isActive = activeGroup === gIndex;
              const BtnIcon = group.btn.icon;
              return (
                <button
                  key={group.label}
                  onClick={() => handleGroupChange(gIndex)}
                  style={
                    isActive
                      ? {
                          backgroundColor: group.btn.bg,
                          boxShadow: `0 10px 25px ${group.btn.shadow}`,
                        }
                      : {}
                  }
                  className={`flex items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-1 hover:scale-105
                    ${isActive
                      ? `h-12 w-12 ${group.btn.dark ? "text-gray-700" : "text-white"}`
                      : "h-10 w-10 bg-white text-gray-400 shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:bg-gray-50"
                    }`}
                >
                  <BtnIcon size={isActive ? 18 : 16} />
                </button>
              );
            })}
          </div>

          {/* Label nhóm đang active */}
          <p
            className="mt-3 text-center text-sm font-medium transition-all duration-300"
            style={{
              color: currentGroup.btn.bg === "#ffffff" ? "#64748b" : currentGroup.btn.bg,
            }}
          >
            {currentGroup.label}
          </p>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="flex-1 bg-[#f5f7fb]">
          {/* HEADER */}
          <header className="flex h-22 items-center justify-between bg-white px-8">
            {/* SEARCH */}
            <div className="flex-1">
              <GooeySearchBar />
            </div>

            <div className="flex items-center gap-4">
              <button className="relative flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-brand hover:from-indigo-600 hover:to-brand transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95">
                <Bell size={20} className="text-white" />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-yellow-300 shadow-lg shadow-yellow-300/50 animate-pulse"></span>
              </button>

              <div className="flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/100?img=12"
                  alt="avatar"
                  className="h-11 w-11 rounded-full object-cover"
                />
                <span className="font-semibold text-gray-800">Kei Tran</span>
              </div>
            </div>
          </header>

          <section className="p-8">
            <p className="mb-4 text-sm text-gray-400">
              Home <span className="mx-2">›</span>
              <span className="font-medium text-gray-700">
                {currentGroup.label} › {currentGroup.items[activeItem]?.label}
              </span>
            </p>

            <h2 className="mb-6 text-3xl font-bold text-gray-900">
              My Account
            </h2>

            {/* FORM CARD */}
            <div className="rounded-[28px] bg-white shadow-sm">
              <div className="border-b px-8 py-5">
                <h3 className="text-xl font-semibold text-gray-900">
                  Personal Information
                </h3>
              </div>

              <form className="p-8">
                {/* AVATAR */}
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <img
                        src="https://i.pravatar.cc/120?img=12"
                        alt="avatar"
                        className="h-24 w-24 rounded-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full text-white shadow"
                        style={{ backgroundColor: BRAND }}
                      >
                        <Camera size={16} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white"
                      style={{ backgroundColor: BRAND }}
                    >
                      <Upload size={16} />
                      Tải lên
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-full border! border-red-300! px-5 py-2.5 text-sm font-medium text-red-500"
                    >
                      <X size={16} />
                      Xóa
                    </button>
                  </div>

                  <span className="rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-600">
                    Active
                  </span>
                </div>

                {/* INPUTS */}
                <div className="grid grid-cols-2 gap-6">
                  <FloatingInput
                    label="Full Name"
                    value="Kei Tran"
                    containerClassName="w-full"
                    className="border-gray-300! bg-white! text-gray-700! placeholder:text-transparent! focus:border-brand!"
                    labelClassName="text-gray-500! peer-valid:text-brand! peer-focus:text-brand!"
                  />

                  <FloatingInput
                    label="User Code"
                    value="TRAU0312345"
                    containerClassName="w-full"
                    className="border-gray-300! bg-white! text-gray-700! placeholder:text-transparent! focus:border-brand!"
                    labelClassName="text-gray-500! peer-valid:text-brand! peer-focus:text-brand!"
                  />

                  <FloatingInput
                    type="email"
                    label="Email"
                    value="ke1tran666@gmail.com"
                    containerClassName="w-full"
                    className="border-gray-300! bg-white! text-gray-700! placeholder:text-transparent! focus:border-brand!"
                    labelClassName="text-gray-500! peer-valid:text-brand! peer-focus:text-brand!"
                  />

                  <FloatingInput
                    label="Phone"
                    value="0898122048"
                    containerClassName="w-full"
                    className="border-gray-300! bg-white! text-gray-700! placeholder:text-transparent! focus:border-brand!"
                    labelClassName="text-gray-500! peer-valid:text-brand! peer-focus:text-brand!"
                  />

                  <div className="col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Date of Birth
                    </label>

                    <BirthdayInput
                      onChange={(value) => console.log(value)}
                      inputClassName="
                        border-gray-300!
                        bg-white!
                        text-gray-700!
                        placeholder:text-gray-400!
                        focus:border-brand!
                        focus:shadow-[0_0_0_3px_rgba(1,146,245,0.12)]!
                      "
                      calendarButtonClassName="
                        border-gray-300!
                        bg-[#f5f7fb]!
                        text-gray-600!
                        hover:bg-gray-100!
                        hover:border-brand!
                      "
                      popupClassName="border-gray-200!"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="mb-3 block text-sm font-semibold text-gray-700">
                      Gender
                    </label>

                    <div className="flex gap-8">
                      <Radio label="Male" name="gender" />
                      <Radio label="Female" name="gender" />
                      <Radio label="Unknown" name="gender" />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <FloatingInput
                      label="Company"
                      placeholder="Garment Design Company"
                      containerClassName="w-full"
                      className="border-gray-300! bg-white! text-gray-700! placeholder:text-transparent! focus:border-brand!"
                      labelClassName="text-gray-500! peer-valid:text-brand! peer-focus:text-brand!"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    className="rounded-full px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
                    style={{ backgroundColor: BRAND }}
                  >
                    Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={active ? { color: BRAND } : {}}
      className={`mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-white shadow-sm"
          : "text-gray-500 hover:bg-white hover:text-gray-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

const Radio = ({ label, name }) => {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
      <input type="radio" name={name} className="h-4 w-4" style={{ accentColor: BRAND }} />
      {label}
    </label>
  );
};

export default ProfilePage;
