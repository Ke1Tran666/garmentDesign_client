import { Wrench } from "lucide-react";
import EmptyState from "@/shared/ui/empty-state/EmptyState";

const ServiceEmptyState = ({ onResetFilters }) => {
  return (
    <EmptyState
      icon={Wrench}
      title="Không tìm thấy dịch vụ nào phù hợp với bộ lọc"
      description="Thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc."
      actionText="Đặt lại tất cả bộ lọc"
      onAction={onResetFilters}
    />
  );
};

export default ServiceEmptyState;
