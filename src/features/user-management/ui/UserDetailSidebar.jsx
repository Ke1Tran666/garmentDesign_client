import { BadgeCheck, CalendarDays, Hash, Mail, UserRound } from "lucide-react";

import {
  AdminDetailInfoRow,
  AdminDetailSection,
} from "@/shared/ui/admin-detail/AdminDetailLayout";

import { EMPTY_VALUE, formatDate } from "../lib/userDetail";
import UserIdentitySection from "./UserIdentitySection";

const UserDetailSidebar = ({
  user,
  status,
  loginEmailProvider,
  loginProviderInfo,
  phoneProvider,
  isAdmin,
  isCurrentUser,
  canEditUser,
  onUserChange,
}) => (
  <>
    <AdminDetailSection title="Thông tin cơ bản">
      <AdminDetailInfoRow icon={Hash} label="ID">
        {user.idUser}
      </AdminDetailInfoRow>

      <AdminDetailInfoRow icon={Mail} label="Email">
        <div className="flex w-full min-w-0 items-center gap-3">
          <span
            title={loginEmailProvider?.email || ""}
            className="block max-w-40 min-w-0 flex-1 truncate sm:max-w-48"
          >
            {loginEmailProvider?.email || EMPTY_VALUE}
          </span>

          {loginProviderInfo && (
            <span
              className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${loginProviderInfo.className}`}
            >
              {loginProviderInfo.label}
            </span>
          )}
        </div>
      </AdminDetailInfoRow>

      <AdminDetailInfoRow icon={UserRound} label="Mã">
        {user.userCode || EMPTY_VALUE}
      </AdminDetailInfoRow>

      <AdminDetailInfoRow icon={CalendarDays} label="Ngày tạo">
        {formatDate(user.createdAt)}
      </AdminDetailInfoRow>

      <AdminDetailInfoRow icon={CalendarDays} label="Cập nhật">
        {formatDate(user.updatedAt)}
      </AdminDetailInfoRow>

      <AdminDetailInfoRow icon={BadgeCheck} label="Trạng thái">
        <span
          className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${status.badgeClassName}`}
        >
          {status.label}
        </span>
      </AdminDetailInfoRow>
    </AdminDetailSection>

    <UserIdentitySection
      user={user}
      email={loginEmailProvider?.email}
      phoneProvider={phoneProvider}
      isAdmin={isAdmin}
      isCurrentUser={isCurrentUser}
      canEditUser={canEditUser}
      onUserChange={onUserChange}
    />
  </>
);

export default UserDetailSidebar;
