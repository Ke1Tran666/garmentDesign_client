import { Users } from "lucide-react";

import EmptyState from "@/shared/ui/empty-state/EmptyState";

import UserCardItem from "./UserCardItem";

const UserGridView = ({
  users = [],
  selectedIds = new Set(),
  isAdmin = false,
  currentUserId = null,
  onToggleSelect,
  onDelete,
  onResetFilters,
}) => {
  if (users.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Không tìm thấy người dùng nào phù hợp"
        description="Thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc."
        actionText="Đặt lại tất cả bộ lọc"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <UserCardItem
          key={user.idUser}
          user={user}
          isSelected={selectedIds.has(user.idUser)}
          isAdmin={isAdmin}
          isCurrentUser={Boolean(
            currentUserId && user.idUser === currentUserId,
          )}
          onToggleSelect={onToggleSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default UserGridView;
