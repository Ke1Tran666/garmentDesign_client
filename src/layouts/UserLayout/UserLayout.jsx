import { useEffect, useState } from "react";
import {
  Bell,
  User,
  LayoutDashboard,
  ClipboardList,
  FileText,
  BarChart2,
  Settings,
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
  ChevronRight,
  MapPin,
} from "lucide-react";

import Logo from "../../components/common/Logo/Logo";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import defaultAvatar from "@/assets/images/avatar-default.jpg";
import { USER_API } from "@/api/config";
import { ButtonIcon } from "@/components/ui/Button/Button";
import GooeySearchBar from "@/components/ui/Search/GooeyInput/GooeySearchBar";

const BRAND = "var(--color-brand)";
const BRAND_SHADOW = "rgba(1,146,245,0.35)";

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
      { 
        icon: User, 
        label: "My Profile",
        text:"Personal Information", 
        path: "/user/profile" 
      },{ 
        icon: MapPin, 
        label: "My Address", 
        text:"Personal address", 
        path: "/user/address" },
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

const UserLayout = ({ title = "My Account" }) => {
  const [activeGroup, setActiveGroup] = useState(2);
  const [activeItem, setActiveItem] = useState(0);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const currentGroup = GROUPS[activeGroup];
  
  useEffect(() => {
  const loadUser = async () => {
    try {
      const idUser = localStorage.getItem("idUser");

      if (!idUser) return;

      const response = await axios.get(
        `${USER_API}/me/${idUser}`
      );

      setUser(response.data?.user);
    } catch (error) {
      console.error("Không thể tải thông tin user:", error);
    }
  };

  loadUser();
}, []);

  const handleGroupChange = (gIndex) => {
    setActiveGroup(gIndex);
    setActiveItem(GROUPS[gIndex].defaultItem);
  };

  // Lời Chào theo thời gian
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 10) return "Chào buổi sáng";
    if (hour >= 10 && hour < 13) return "Chào buổi trưa";
    if (hour >= 13 && hour < 18) return "Chào buổi chiều";

    return "Chào buổi tối";
  };

  return (
    <div className="mx-auto flex min-h-screen w-full overflow-hidden bg-zinc-50">
      <aside className="flex w-72 flex-col px-6 py-8">
          <Logo />

          <div className="mb-10 mt-10 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-[#101828]">
              {getGreeting()}
          </h2>

          <h3 className="mt-2 text-base font-semibold text-[#1570EF]">
              {user?.fullName || user?.userCode || "Guest"}
          </h3>

          <p className="mt-3 text-sm text-[#667085]">
              {new Date().toLocaleDateString("vi-VN", {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              })}
          </p>
          </div>

          <nav className="mt-4 space-y-1">
          {currentGroup.items.map((item, index) => {
              const Icon = item.icon;

              return (
              <SidebarItem
                  key={item.label}
                  icon={<Icon size={18} />}
                  label={item.label}
                  active={
                    activeItem === index ||
                    location.pathname === item.path
                  }
                  onClick={() => {
                    setActiveItem(index);

                    if (item.path) {
                      navigate(item.path);
                    }
                  }}
              />
              );
          })}
          </nav>

          <div className="mt-3 flex items-center justify-center gap-3">
          {GROUPS.map((group, gIndex) => {
              const isActive = activeGroup === gIndex;
              const BtnIcon = group.btn.icon;

              return (
              <button
                  key={group.label}
                  type="button"
                  onClick={() => handleGroupChange(gIndex)}
                  style={
                  isActive
                      ? {
                          backgroundColor: group.btn.bg,
                          boxShadow: `0 10px 25px ${group.btn.shadow}`,
                      }
                      : {}
                  }
                  className={`flex items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-1 hover:scale-105 ${
                  isActive
                      ? `h-12 w-12 ${
                          group.btn.dark ? "text-gray-700" : "text-white"
                      }`
                      : "h-10 w-10 bg-white text-gray-400 shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:bg-gray-50"
                  }`}
              >
                  <BtnIcon size={isActive ? 18 : 16} />
              </button>
              );
          })}
          </div>

          <p
          className="mt-3 text-center text-sm font-medium transition-all duration-300"
          style={{
              color:
              currentGroup.btn.bg === "#ffffff"
                  ? "#64748b"
                  : currentGroup.btn.bg,
          }}
          >
          {currentGroup.label}
          </p>
      </aside>

      <main className="flex-1 bg-white rounded-xl m-2 p-8">
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-center mb-4">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
            <span>Home</span>

            <ChevronRight size={14} />

            <span className="font-medium text-gray-700">
              {currentGroup.label}
            </span>

            <ChevronRight size={14} />

            <span className="font-medium text-gray-700">
              {currentGroup.items[activeItem]?.label}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-4">
              <ButtonIcon
                icon={Bell}
                sizeIcon={22}
                className="
                  relative
                  bg-linear-to-br from-indigo-500 to-brand shadow-lg
                  hover:from-indigo-600 hover:to-brand hover:shadow-xl
                  active:scale-95
                "
                classNameIcon="text-white"
              >
                <span 
                  className="
                    absolute right-2 top-2 h-2.5 w-2.5 animate-pulse rounded-full bg-yellow-300 shadow-lg shadow-yellow-300/50
                    " 
                />
              </ButtonIcon>
            </div>
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || defaultAvatar}
                alt={user?.fullName || "User"}
                className="h-10 w-10 rounded-xl object-cover"
              />

              <span className="font-semibold text-gray-800">
                {user?.fullName || "Guest"}
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <header className="flex justify-between items-center py-6 border-b-3 border-zinc-50">
          <div className="flex flex-col gap-2 justify-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {currentGroup.items[activeItem]?.label || title}
            </h2>
            <p className="text-m text-[#667085]">
              {currentGroup.items[activeItem]?.text}
            </p>
          </div>
          <div>
            <GooeySearchBar
              value={searchKeyword}
              onSearch={setSearchKeyword}
            />
          </div>
        </header>

        {/* Section */}
        <section className="p-4">
          <Outlet context={{ searchKeyword }} />
        </section>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }) => {
  return (
    <button
      type="button"
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

export default UserLayout;