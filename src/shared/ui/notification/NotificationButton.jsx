import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCheck,
  ChevronRight,
  ClipboardList,
  Layers,
  Sparkles,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "order",
    title: "Đơn dịch vụ mới #ORD-9821",
    content: "Khách hàng Nguyễn Hoàng Mai đã đặt dịch vụ May đo Áo Vest Cao Cấp.",
    time: "5 phút trước",
    unread: true,
    link: "/admin/service-orders",
  },
  {
    id: "notif-2",
    type: "design",
    title: "Bản vẽ 3D đã sẵn sàng",
    content: "Kỹ thuật viên đã tải lên mô phỏng 3D hoàn chỉnh cho đơn #ORD-9810.",
    time: "25 phút trước",
    unread: true,
    link: "/admin/service-orders",
  },
  {
    id: "notif-3",
    type: "user",
    title: "Thành viên mới đăng ký",
    content: "Khách hàng tran.van.nam@gmail.com vừa khởi tạo tài khoản thành viên.",
    time: "1 giờ trước",
    unread: true,
    link: "/admin/users",
  },
  {
    id: "notif-4",
    type: "order",
    title: "Xác nhận đặt cọc thành công",
    content: "Đã ghi nhận thanh toán đặt cọc 1.500.000đ cho đơn hàng #ORD-9790.",
    time: "3 giờ trước",
    unread: false,
    link: "/admin/service-orders",
  },
  {
    id: "notif-5",
    type: "system",
    title: "Hệ thống vận hành tối ưu",
    content: "Máy chủ lưu trữ và xử lý bản vẽ 3D đã được đồng bộ tối ưu hóa.",
    time: "1 ngày trước",
    unread: false,
    link: "/admin/dashboard",
  },
];

const FILTER_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc" },
  { key: "order", label: "Đơn dịch vụ" },
  { key: "system", label: "Hệ thống" },
];

const getNotificationMeta = (type) => {
  switch (type) {
    case "order":
      return {
        icon: ClipboardList,
        iconWrap: "bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand",
      };
    case "design":
      return {
        icon: Layers,
        iconWrap: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
      };
    case "user":
      return {
        icon: UserPlus,
        iconWrap: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
      };
    case "system":
    default:
      return {
        icon: Sparkles,
        iconWrap: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
      };
  }
};

const NotificationButton = ({ onClick }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("app-user-notifications");
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const containerRef = useRef(null);

  // Sync notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("app-user-notifications", JSON.stringify(notifications));
    } catch {
      // ignore storage errors
    }
  }, [notifications]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleToggle = () => {
    if (onClick) {
      onClick();
    }
    setIsOpen((prev) => !prev);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleItemClick = (notif) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n)),
    );
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleDeleteItem = (e, id) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Filter list
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return n.unread;
    if (activeTab === "order") return n.type === "order" || n.type === "design";
    if (activeTab === "system") return n.type === "system" || n.type === "user";
    return true;
  });

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Xem thông báo hệ thống"
        aria-expanded={isOpen}
        className={`relative flex h-9.5 w-9.5 items-center justify-center rounded-xl border transition-all cursor-pointer ${
          isOpen
            ? "border-brand bg-brand/10 text-brand dark:bg-brand/20 dark:border-brand"
            : "border-slate-200/90 bg-white text-slate-600 hover:border-brand/40 hover:bg-slate-50 hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        } shadow-2xs active:scale-95`}
      >
        <Bell size={18} className="stroke-[2.2]" />

        {/* Unread badge with pulse dot */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Popover */}
      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 top-full z-50 mt-2 w-88 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-black/5 sm:w-96 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-4 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                Thông báo
              </h3>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                  {unreadCount} mới
                </span>
              ) : (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  Đã đọc hết
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand cursor-pointer dark:text-slate-400 dark:hover:bg-slate-800"
                  title="Đánh dấu tất cả là đã đọc"
                >
                  <CheckCheck size={14} />
                  <span className="hidden sm:inline">Đã đọc tất cả</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer dark:hover:bg-rose-950/50"
                  title="Xóa tất cả thông báo"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-100 px-3 py-1.5 dark:border-slate-800 gap-1 bg-slate-50/50 dark:bg-slate-800/40">
            {FILTER_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-brand shadow-xs dark:bg-slate-800 dark:text-brand"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Notification Items List */}
          <div className="max-h-84 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <Bell size={22} className="stroke-[1.7]" />
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Không có thông báo nào
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {activeTab === "unread"
                    ? "Bạn đã đọc hết tất cả thông báo."
                    : "Hộp thư thông báo của bạn đang trống."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const meta = getNotificationMeta(notif.type);
                const IconComponent = meta.icon;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                      notif.unread
                        ? "bg-sky-50/30 hover:bg-sky-50/60 dark:bg-sky-950/20 dark:hover:bg-sky-950/30"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    {/* Category Icon */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${meta.iconWrap}`}
                    >
                      <IconComponent size={17} className="stroke-[2.2]" />
                    </div>

                    {/* Content details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                          {notif.title}
                        </span>
                        {notif.unread && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {notif.content}
                      </p>
                      <span className="mt-1.5 inline-block text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        {notif.time}
                      </span>
                    </div>

                    {/* Delete single notification button */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteItem(e, notif.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-opacity cursor-pointer"
                      title="Xóa thông báo này"
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50/80 p-2.5 text-center dark:border-slate-800 dark:bg-slate-800/50">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate("/admin/service-orders");
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand transition-colors hover:text-brand-hover cursor-pointer"
            >
              <span>Xem danh sách đơn dịch vụ</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
