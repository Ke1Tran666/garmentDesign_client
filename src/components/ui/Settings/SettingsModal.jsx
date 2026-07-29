import { X, Bell, Palette, Shield, User, SettingsIcon } from "lucide-react";
import { useState } from "react";

const tabs = [
    { key: "notifications", icon: <Bell size={18} />, label: "Notifications" },
    { key: "appearance",    icon: <Palette size={18} />, label: "Appearance" },
    { key: "security",      icon: <Shield size={18} />, label: "Security" },
    { key: "account",       icon: <User size={18} />, label: "Account" },
];

const contentMap = {
    notifications: {
        title: "Notifications",
        items: [
            { title: "Email Notifications", description: "Receive updates via email" },
            { title: "Order Updates", description: "Get notified when your order status changes" },
            { title: "Marketing Emails", description: "Receive promotions and announcements" },
        ],
    },
    appearance: {
        title: "Appearance",
        items: [
            { title: "Dark Mode", description: "Switch to dark color scheme" },
            { title: "Compact Layout", description: "Use a more compact interface density" },
        ],
    },
    security: {
        title: "Security",
        items: [
            { title: "Two-Factor Authentication", description: "Add an extra layer of protection" },
            { title: "Login Alerts", description: "Get notified of new sign-ins" },
        ],
    },
    account: {
        title: "Account",
        items: [
            { title: "Public Profile", description: "Make your profile visible to others" },
            { title: "Activity Status", description: "Show when you're active" },
        ],
    },
};

const SettingsModal = ({ open, onClose }) => {
    const [activeTab, setActiveTab] = useState("notifications");

    if (!open) return null;

    const { title, items } = contentMap[activeTab];

    return (
        <div className="fixed inset-0 z-9999 flex items-end justify-center sm:items-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="
                    relative w-full sm:w-[90vw] sm:max-w-4xl
                    h-[92dvh] sm:h-[80vh] sm:max-h-150
                    bg-surface rounded-t-3xl sm:rounded-3xl
                    shadow-2xl overflow-hidden
                    flex flex-col sm:flex-row
                "
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-surface-muted transition-colors"
                    aria-label="Close settings"
                >
                    <X size={20} />
                </button>

                {/* Sidebar — desktop */}
                <div className="hidden sm:flex flex-col w-60 border-r border-border bg-surface-subtle p-5 shrink-0">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                            <SettingsIcon className="h-5 w-5 text-brand" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-strong leading-tight">
                                Settings
                            </h2>
                            <p className="text-xs text-text-muted">
                                Manage your preferences
                            </p>
                        </div>
                    </div>

                    {tabs.map((tab) => (
                        <SidebarItem
                            key={tab.key}
                            icon={tab.icon}
                            label={tab.label}
                            active={activeTab === tab.key}
                            onClick={() => setActiveTab(tab.key)}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-8">
                    <h1 className="text-xl text-brand sm:text-2xl font-bold mb-6 sm:mb-8">
                        {title}
                    </h1>

                    {items.map((item) => (
                        <SettingItem
                            key={item.title}
                            title={item.title}
                            description={item.description}
                        />
                    ))}
                </div>

                {/* Tab bar — mobile (bottom nav) */}
                <div className="sm:hidden shrink-0 bg-white/95 pb-safe-bottom border-t-2 border-border">
                    <div className="flex items-center justify-center px-2 pt-2 pb-3">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`
                                        flex flex-col items-center gap-1
                                        flex-1 py-1 px-1
                                        transition-all rounded-xl
                                        ${isActive ? "text-brand" : "text-text-subtle"}
                                    `}
                                >
                                    <span className={`
                                        [&>svg]:w-5 [&>svg]:h-5
                                        transition-transform
                                        ${isActive ? "scale-110" : "scale-100"}
                                    `}>
                                        {tab.icon}
                                    </span>
                                    <span className={`
                                        text-[10px] font-medium tracking-wide
                                        ${isActive ? "text-brand" : "text-text-muted"}
                                    `}>
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Home indicator line */}
                    <div className="flex justify-center pb-1">
                        <div className="w-24 h-1 bg-gray-600 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`
            w-full flex items-center gap-3
            px-4 py-3 rounded-xl mb-1
            transition-all text-sm
            ${active
                ? "bg-brand! text-white"
                : "text-text-default hover:bg-surface-muted"
            }
        `}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const SettingItem = ({ title, description }) => (
    <div className="py-4 sm:py-5 border-b border-border flex items-center justify-between gap-4">
        <div className="min-w-0">
            <h3 className="font-semibold text-base sm:text-lg leading-snug">
                {title}
            </h3>
            <p className="text-sm text-text-muted mt-0.5">
                {description}
            </p>
        </div>

        <label className="relative inline-flex cursor-pointer items-center shrink-0">
            <input type="checkbox" className="peer sr-only" />
            <div
                className="
                    h-6 w-11 rounded-full
                    bg-gray-300
                    peer-checked:bg-brand
                    transition-all
                    after:absolute
                    after:left-0.5 after:top-0.5
                    after:h-5 after:w-5
                    after:rounded-full after:bg-surface
                    after:transition-all
                    peer-checked:after:translate-x-5
                "
            />
        </label>
    </div>
);

export default SettingsModal;
