import { useState } from "react";
import {
  AlertTriangle,
  Info,
  KeyRound,
  Mail,
  RotateCcw,
  Save,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { useNotification } from "@/app/providers/NotificationProvider";
import { userApi } from "@/entities/user/api/userApi";
import { useAuth } from "@/features/auth/model/useAuth";
import { StatusBadge } from "@/shared/ui/badge/StatusBadge";
import PageHeader from "@/shared/ui/heading/PageHeader";
import PasswordInput from "@/shared/ui/input/PasswordInput";
import { PortalSectionCard } from "@/shared/ui/section/Section";
import Switch from "@/shared/ui/switch/Switch";

const TWO_FACTOR_METHODS = [
  {
    id: "email",
    title: "Xác thực qua Email",
    description: "Nhận mã xác thực OTP qua địa chỉ email đã đăng ký.",
    icon: Mail,
  },
  {
    id: "sms",
    title: "Xác thực qua SMS",
    description: "Nhận mã xác thực OTP qua số điện thoại đã đăng ký.",
    icon: Smartphone,
  },
  {
    id: "authenticator",
    title: "Ứng dụng Authenticator",
    description:
      "Sử dụng Google Authenticator hoặc Microsoft Authenticator để tạo mã 6 số.",
    icon: ShieldCheck,
  },
];

const SecurityPage = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { showNotification } = useNotification();
  const { user } = useAuth();

  const isActive =
    String(user?.status || "")
      .trim()
      .toLowerCase() === "active";

  const validatePassword = () => {
    if (!oldPassword.trim()) {
      showNotification("error", "Lỗi", "Vui lòng nhập mật khẩu hiện tại.");
      return false;
    }

    if (newPassword.length < 8) {
      showNotification("error", "Lỗi", "Mật khẩu mới phải có ít nhất 8 ký tự.");
      return false;
    }

    if (newPassword !== confirmPassword) {
      showNotification("error", "Lỗi", "Xác nhận mật khẩu không khớp.");
      return false;
    }

    if (oldPassword === newPassword) {
      showNotification(
        "error",
        "Lỗi",
        "Mật khẩu mới phải khác mật khẩu hiện tại.",
      );
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!isActive) {
      showNotification(
        "error",
        "Tài khoản chưa kích hoạt",
        "Bạn cần xác thực email hoặc số điện thoại và thêm ít nhất một địa chỉ.",
      );
      return;
    }
    if (!validatePassword()) return;

    try {
      setSubmitting(true);

      await userApi.changePassword({
        oldPassword,
        newPassword,
      });

      showNotification(
        "success",
        "Thành công",
        "Đổi mật khẩu thành công. Các thiết bị khác đã được đăng xuất.",
      );

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      showNotification(
        "error",
        "Thất bại",
        error?.response?.data?.message || "Không thể đổi mật khẩu.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = Boolean(
    isActive && oldPassword && newPassword && confirmPassword && !submitting,
  );

  const handleResetPasswordForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="animate-in space-y-6 duration-200 fade-in">
      {/* 1. Page Header */}
      <PageHeader
        title="Bảo mật tài khoản"
        badge={
          <StatusBadge
            label={isActive ? "Đã kích hoạt" : "Chưa kích hoạt"}
            tone={isActive ? "success" : "warning"}
          />
        }
        description="Cập nhật mật khẩu định kỳ và quản lý các lớp bảo vệ đăng nhập cho tài khoản."
      />

      {/* 2. 2-Column Security Cards */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Change Password */}
        <PortalSectionCard
          title="Đổi mật khẩu"
          description="Thay đổi mật khẩu đăng nhập tài khoản của bạn"
          icon={KeyRound}
        >
          {!isActive && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs leading-5 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>
                Bạn cần xác thực email hoặc số điện thoại và thêm ít nhất một
                địa chỉ trước khi sử dụng tính năng đổi mật khẩu.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <InputPassword
              label="Mật khẩu hiện tại"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
            />
            <InputPassword
              label="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <InputPassword
            label="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-white">
              <Info size={15} className="text-brand" />
              <span>Yêu cầu mật khẩu an toàn</span>
            </div>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-slate-500 dark:text-slate-400">
              <li>Mật khẩu phải có tối thiểu 8 ký tự.</li>
              <li>Nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</li>
              <li>Mật khẩu mới phải khác mật khẩu hiện tại.</li>
            </ul>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={handleResetPasswordForm}
              className="inline-flex h-9.5 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <RotateCcw size={14} />
              <span>Đặt lại</span>
            </button>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleChangePassword}
              className="inline-flex h-9.5 cursor-pointer items-center gap-1.5 rounded-xl bg-brand! px-5 text-xs font-semibold text-white! shadow-sm shadow-brand/25 transition hover:bg-brand-hover! disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={14} />
              <span>{submitting ? "Đang lưu..." : "Lưu mật khẩu"}</span>
            </button>
          </div>
        </PortalSectionCard>

        {/* Two-Factor Authentication */}
        <PortalSectionCard
          title="Xác thực hai lớp (2FA)"
          description="Tăng cường lớp bảo vệ bổ sung khi đăng nhập"
          icon={ShieldCheck}
          iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
        >
          <div className="space-y-3">
            {TWO_FACTOR_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-2xs dark:bg-slate-900 dark:text-slate-400">
                      <Icon size={17} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                          {method.title}
                        </h3>
                        <StatusBadge label="Đang phát triển" tone="warning" />
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {method.description}
                      </p>
                    </div>
                  </div>

                  <Switch checked={false} disabled />
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400">
            <Info size={15} className="mt-0.5 shrink-0 text-slate-400" />
            <span>
              Các phương thức xác thực hai lớp đang được hoàn thiện và sẽ sớm ra
              mắt trong phiên bản tiếp theo.
            </span>
          </div>
        </PortalSectionCard>
      </div>
    </div>
  );
};

const InputPassword = ({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}) => (
  <PasswordInput
    label={label}
    value={value || ""}
    onChange={onChange}
    placeholder={placeholder || label}
    autoComplete={autoComplete}
    containerClassName="mb-4"
    className="border-input! text-text-default! placeholder:text-transparent! focus:border-brand!"
    labelClassName="text-text-muted! peer-focus:text-brand!"
    buttonClassName="text-text-muted!"
  />
);

export default SecurityPage;
