import { X } from "lucide-react";
import AdminBrand from "./AdminBrand";
import AdminNavList from "./AdminNavList";
import AdminUserProfile from "./AdminUserProfile";

export const AdminMobileDrawer = ({ isOpen, onClose, user, onLogout }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs md:hidden"
      onClick={onClose}
    >
      <div
        className="flex h-full w-72 max-w-[85vw] flex-col bg-white p-5 shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <AdminBrand showBadge={false} />
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Đóng menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 space-y-5 overflow-y-auto py-4">
          <AdminNavList
            userRole={user}
            onItemClick={onClose}
            showWebsiteLink={true}
          />
        </div>

        {/* Footer with User info & Logout */}
        <AdminUserProfile user={user} onLogout={onLogout} variant="drawer" />
      </div>
    </div>
  );
};

export default AdminMobileDrawer;
