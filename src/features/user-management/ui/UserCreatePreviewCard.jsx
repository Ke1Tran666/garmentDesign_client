import { ShieldCheck, Sparkles } from "lucide-react";

import UserAvatar from "@/shared/ui/avatar/UserAvatar";

import { formatDate, formatGender } from "../lib/userUtils";

const UserCreatePreviewCard = ({
  avatar = "",
  fullName = "",
  email = "",
  phone = "",
  birthday = "",
  gender = "Unknown",
  selectedRole,
}) => {
  return (
    <div className="space-y-6">
      <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Xem trước hồ sơ
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand">
            <Sparkles size={13} />
            Thời gian thực
          </span>
        </div>

        <div className="flex flex-col items-center pt-6 text-center">
          <UserAvatar
            src={avatar}
            name={fullName || "User"}
            size="xl"
            ring={false}
            className="shadow-lg shadow-brand/20"
          />

          <h3 className="mt-4 font-heading text-base font-extrabold text-slate-900 dark:text-white">
            {fullName || "Tên người dùng mới"}
          </h3>
          <p className="mt-0.5 max-w-full truncate text-xs text-slate-400">
            {email || "user@garment.vn"}
          </p>

          <div className="mt-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand dark:bg-brand/20">
              <ShieldCheck size={14} />
              {selectedRole?.nameRole || "Chưa chọn vai trò"}
            </span>
          </div>

          <div className="mt-6 w-full space-y-2.5 border-t border-slate-100 pt-4 text-left text-xs dark:border-slate-800">
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Số điện thoại:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {phone || "Chưa nhập"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Ngày sinh:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {birthday
                  ? formatDate(`${birthday}T00:00:00`, false, "Chưa nhập")
                  : "Chưa nhập"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Giới tính:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {formatGender(gender)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Trạng thái khởi tạo:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Chờ hoàn thiện
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCreatePreviewCard;
