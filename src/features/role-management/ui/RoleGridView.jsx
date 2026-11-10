import { ShieldCheck } from "lucide-react";

import EmptyState from "@/shared/ui/empty-state/EmptyState";

import RoleCardItem from "./RoleCardItem";

const RoleGridView = ({
  roles = [],
  allRoles = roles,
  selectedIds = new Set(),
  isAdmin = false,
  onToggleSelect,
  onOpenView,
  onOpenEdit,
  onDelete,
  onResetFilters,
}) => {
  if (roles.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Không tìm thấy vai trò nào phù hợp"
        description="Thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc."
        actionText="Đặt lại tất cả bộ lọc"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {roles.map((role) => (
        <RoleCardItem
          key={role.idRole}
          role={role}
          allRoles={allRoles}
          isSelected={selectedIds.has(role.idRole)}
          isAdmin={isAdmin}
          onToggleSelect={onToggleSelect}
          onOpenView={onOpenView}
          onOpenEdit={onOpenEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default RoleGridView;
