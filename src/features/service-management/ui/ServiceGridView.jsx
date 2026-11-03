import ServiceCardItem from "./ServiceCardItem";

const ServiceGridView = ({
  services = [],
  selectedIds = [],
  isAdmin = false,
  onToggleSelect,
  onToggleStatus,
  onOpenView,
  onOpenEdit,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCardItem
          key={service.serviceId}
          service={service}
          isSelected={selectedIds.includes(service.serviceId)}
          isAdmin={isAdmin}
          onToggleSelect={onToggleSelect}
          onToggleStatus={onToggleStatus}
          onOpenView={onOpenView}
          onOpenEdit={onOpenEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ServiceGridView;
