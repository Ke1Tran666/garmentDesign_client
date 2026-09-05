import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Pencil,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";

import { serviceApi } from "@/entities/service/api/serviceApi";
import { useNotification } from "@/app/providers/NotificationProvider";
import DataTable from "@/shared/ui/table/DataTable";
import Pagination from "@/shared/ui/table/Pagination";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import FormModal from "@/shared/ui/modal/FormModal";
import FilterSelect from "@/shared/ui/select/FilterSelect";
import { SearchInput } from "@/shared/ui/search/search-input";
import CountBadge from "@/shared/ui/badge/CountBadge";
import PageHeading from "@/shared/ui/heading/PageHeading";

const PAGE_SIZE = 10;

const COLUMNS = [
  {
    key: "service",
    title: "Dịch vụ",
  },
  {
    key: "unitType",
    title: "Đơn vị tính",
  },
  {
    key: "basePrice",
    title: "Giá cơ bản",
  },
  {
    key: "status",
    title: "Trạng thái",
  },
  {
    key: "updatedAt",
    title: "Cập nhật",
  },
  {
    key: "action",
    title: "Thao tác",
    className: "text-center",
  },
];

const SERVICE_STATUS_OPTIONS = [
  {
    value: "all",
    label: "Tất cả trạng thái",
  },
  {
    value: "active",
    label: "Đang hoạt động",
  },
  {
    value: "inactive",
    label: "Tạm ngừng",
  },
];

const EMPTY_FORM = {
  serviceCode: "",
  serviceName: "",
  unitType: "",
  basePrice: "",
  description: "",
  tags: "",
  status: "active",
};

const createInitialForm = (service) => {
  if (!service) {
    return { ...EMPTY_FORM };
  }

  return {
    serviceCode: service.serviceCode || "",
    serviceName: service.serviceName || "",
    unitType: service.unitType || "",
    basePrice: service.basePrice ?? "",
    description: service.description || "",
    tags: service.tags || "",
    status: service.status || "active",
  };
};

const getErrorMessage = (error, fallback) => {
  const responseData = error.response?.data;

  if (typeof responseData === "string") {
    return responseData;
  }

  return responseData?.message || fallback;
};

const formatPrice = (value) => {
  const price = Number(value);

  if (!Number.isFinite(price)) {
    return "Chưa thiết lập";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (value) => {
  if (!value) return "Chưa có";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getStatusInfo = (service) => {
  if (service?.deletedAt) {
    return {
      label: "Đã xóa",
      className: "bg-danger-soft text-danger",
    };
  }

  const status = String(service?.status || "")
    .trim()
    .toLowerCase();

  if (status === "active") {
    return {
      label: "Đang hoạt động",
      className: "bg-success-soft text-success",
    };
  }

  if (status === "inactive") {
    return {
      label: "Tạm ngừng",
      className: "bg-warning-soft text-warning",
    };
  }

  return {
    label: status || "Chưa xác định",
    className: "bg-surface-muted text-text-muted",
  };
};

const ServiceManagementPage = () => {
  const { searchKeyword = "" } = useOutletContext();
  const { showNotification } = useNotification();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [localSearch, setLocalSearch] = useState("");
  const deferredSearch = useDeferredValue(
    localSearch || searchKeyword,
  );

  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
  }));
  const [editingService, setEditingService] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [removingService, setRemovingService] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");

  useEffect(() => {
    let active = true;

    serviceApi
      .getAll()
      .then((data) => {
        if (!active) return;

        setServices(Array.isArray(data) ? data : []);
        setLoadError("");
      })
      .catch((error) => {
        console.error(
          "Không thể tải danh sách dịch vụ:",
          error,
        );

        if (!active) return;

        setServices([]);
        setLoadError(
          getErrorMessage(
            error,
            "Không thể tải danh sách dịch vụ.",
          ),
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredServices = useMemo(() => {
    const keyword = deferredSearch
      .trim()
      .toLowerCase();

    return services.filter((service) => {
      const status = String(
        service.status || "",
      ).toLowerCase();

      const matchesKeyword =
        !keyword ||
        [
          service.serviceCode,
          service.serviceName,
          service.unitType,
          service.description,
          service.tags,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [
    services,
    deferredSearch,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredServices.length / PAGE_SIZE),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const visibleServices = useMemo(() => {
    const start =
      (safeCurrentPage - 1) * PAGE_SIZE;

    return filteredServices.slice(
      start,
      start + PAGE_SIZE,
    );
  }, [filteredServices, safeCurrentPage]);

  const showingStart =
    filteredServices.length === 0
      ? 0
      : (safeCurrentPage - 1) * PAGE_SIZE + 1;

  const showingEnd = Math.min(
    safeCurrentPage * PAGE_SIZE,
    filteredServices.length,
  );

  const openCreateForm = () => {
    setEditingService(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setFormOpen(true);
  };

  const openEditForm = (service) => {
    setEditingService(service);
    setForm(createInitialForm(service));
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;

    setFormOpen(false);
    setEditingService(null);
    setFormError("");
  };

  const saveService = async (payload) => {
    if (
      !payload.serviceCode ||
      !payload.serviceName ||
      !payload.unitType
    ) {
      setFormError(
        "Vui lòng nhập đầy đủ mã, tên và đơn vị dịch vụ.",
      );
      return;
    }

    if (
      !Number.isFinite(payload.basePrice) ||
      payload.basePrice < 0
    ) {
      setFormError(
        "Giá cơ bản phải là một số lớn hơn hoặc bằng 0.",
      );
      return;
    }

    const duplicatedCode = services.some(
      (service) =>
        service.serviceCode?.trim().toLowerCase() ===
          payload.serviceCode.toLowerCase() &&
        service.serviceId !==
          editingService?.serviceId,
    );

    if (duplicatedCode) {
      setFormError(
        "Mã dịch vụ đã tồn tại trong danh sách.",
      );
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      if (editingService) {
        /*
         * Giữ lại serviceId và createdAt vì backend hiện
         * dùng BeanUtils.copyProperties khi cập nhật.
         */
        const updated = await serviceApi.update(
          editingService.serviceId,
          {
            ...editingService,
            ...payload,
            serviceId: editingService.serviceId,
            createdAt: editingService.createdAt,
          },
        );

        setServices((current) =>
          current.map((service) =>
            service.serviceId ===
            editingService.serviceId
              ? updated
              : service,
          ),
        );

        showNotification(
          "success",
          "Đã cập nhật dịch vụ",
          `${updated.serviceName} đã được cập nhật.`,
        );
      } else {
        const created =
          await serviceApi.create(payload);

        setServices((current) => [
          created,
          ...current,
        ]);

        setCurrentPage(1);

        showNotification(
          "success",
          "Đã thêm dịch vụ",
          `${created.serviceName} đã được thêm vào hệ thống.`,
        );
      }

      closeForm();
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          editingService
            ? "Không thể cập nhật dịch vụ."
            : "Không thể thêm dịch vụ.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const confirmRemove = async () => {
    if (!removingService) return;

    try {
      setRemoving(true);
      setRemoveError("");

      await serviceApi.remove(
        removingService.serviceId,
      );

      setServices((current) =>
        current.filter(
          (service) =>
            service.serviceId !==
            removingService.serviceId,
        ),
      );

      showNotification(
        "success",
        "Đã xóa dịch vụ",
        `${removingService.serviceName} đã được xóa khỏi hệ thống.`,
      );

      setRemovingService(null);
    } catch (error) {
      setRemoveError(
        getErrorMessage(
          error,
          "Không thể xóa dịch vụ. Dịch vụ có thể đang được sử dụng trong đơn hàng.",
        ),
      );
    } finally {
      setRemoving(false);
    }
  };

  const handleChangeForm = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmitForm = (event) => {
    event.preventDefault();

    if (submitting) return;

    saveService({
      serviceCode: form.serviceCode.trim(),
      serviceName: form.serviceName.trim(),
      unitType: form.unitType.trim(),
      basePrice: Number(form.basePrice),
      description: form.description.trim(),
      tags: form.tags.trim(),
      status: form.status,
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <PageHeading
            title="Quản lý dịch vụ"
            description="Thiết lập danh mục, giá và trạng thái các dịch vụ của phần mềm."
          />

          <div className="flex flex-wrap items-center gap-3">
            <CountBadge
              count={filteredServices.length}
              label="dịch vụ"
              icon={Wrench}
            />

            <button
              type="button"
              onClick={openCreateForm}
              className="
                inline-flex items-center gap-2
                rounded-xl bg-brand!
                px-4 py-2.5 text-sm font-semibold
                text-white shadow-sm
                transition hover:opacity-90
              "
            >
              <Plus size={18} />
              Thêm dịch vụ
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <SearchInput
              value={localSearch}
              onChange={(value) => {
                setLocalSearch(value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tên, mã dịch vụ, mô tả..."
              className="w-full"
            />

            <FilterSelect
              value={statusFilter}
              options={SERVICE_STATUS_OPTIONS}
              ariaLabel="Lọc dịch vụ theo trạng thái"
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="mt-5">
            <DataTable
              columns={COLUMNS}
              data={visibleServices}
              loading={loading}
              error={loadError}
              emptyText="Không tìm thấy dịch vụ"
              minWidth="min-w-240"
              renderRow={(service) => {
                const status =
                  getStatusInfo(service);

                return (
                  <tr
                    key={service.serviceId}
                    className="
                      transition hover:bg-surface-subtle
                    "
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <span
                          className="
                            flex h-10 w-10 shrink-0
                            items-center justify-center
                            rounded-xl bg-brand-soft text-brand
                          "
                        >
                          <Wrench size={18} />
                        </span>

                        <div className="min-w-0">
                          <p className="max-w-70 truncate text-sm font-semibold text-text-default">
                            {service.serviceName ||
                              "Chưa đặt tên"}
                          </p>

                          <p className="mt-1 text-xs text-text-muted">
                            {service.serviceCode ||
                              `#${service.serviceId}`}
                          </p>

                          {service.tags && (
                            <p className="mt-1 max-w-70 truncate text-xs text-text-subtle">
                              {service.tags}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-text-muted">
                      {service.unitType || "Chưa có"}
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold text-text-default">
                      {formatPrice(
                        service.basePrice,
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`
                          rounded-full px-3 py-1
                          text-xs font-semibold
                          ${status.className}
                        `}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm text-text-muted">
                      {formatDate(
                        service.updatedAt ||
                          service.createdAt,
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          aria-label={`Sửa ${service.serviceName}`}
                          onClick={() =>
                            openEditForm(service)
                          }
                          className="
                            flex h-9 w-9 items-center
                            justify-center rounded-lg
                            text-text-muted transition
                            hover:bg-info-soft hover:text-info
                          "
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          aria-label={`Xóa ${service.serviceName}`}
                          onClick={() => {
                            setRemoveError("");
                            setRemovingService(service);
                          }}
                          className="
                            flex h-9 w-9 items-center
                            justify-center rounded-lg
                            text-text-muted transition
                            hover:bg-danger-soft
                            hover:text-danger
                          "
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }}
            />
          </div>

          <div className="mt-5">
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              showingStart={showingStart}
              showingEnd={showingEnd}
              totalItems={filteredServices.length}
              showOnSinglePage
            />
          </div>
        </div>
      </div>

      <FormModal
        open={formOpen}
        title={
          editingService
            ? "Chỉnh sửa dịch vụ"
            : "Thêm dịch vụ mới"
        }
        description="Cập nhật thông tin hiển thị, giá và trạng thái dịch vụ."
        form={form}
        onChange={handleChangeForm}
        onClose={closeForm}
        onSubmit={handleSubmitForm}
        submitText={
          editingService
            ? "Lưu thay đổi"
            : "Thêm dịch vụ"
        }
        loadingText="Đang lưu..."
        submitting={submitting}
        errorMessage={formError}
        maxWidthClassName="max-w-2xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-text-default">
              Mã dịch vụ
            </span>

            <input
              name="serviceCode"
              value={form.serviceCode}
              onChange={handleChangeForm}
              disabled={submitting}
              required
              maxLength={50}
              placeholder="Ví dụ: DES001"
              className="
                h-11 w-full rounded-xl
                border border-input bg-surface
                px-4 text-sm text-text-default
                outline-none transition
                focus:border-brand
                focus:ring-4 focus:ring-brand/10
                disabled:cursor-not-allowed
                disabled:bg-surface-muted
              "
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-text-default">
              Tên dịch vụ
            </span>

            <input
              name="serviceName"
              value={form.serviceName}
              onChange={handleChangeForm}
              disabled={submitting}
              required
              maxLength={255}
              placeholder="Nhập tên dịch vụ"
              className="
                h-11 w-full rounded-xl
                border border-input bg-surface
                px-4 text-sm text-text-default
                outline-none transition
                focus:border-brand
                focus:ring-4 focus:ring-brand/10
                disabled:cursor-not-allowed
                disabled:bg-surface-muted
              "
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-text-default">
              Đơn vị tính
            </span>

            <input
              name="unitType"
              value={form.unitType}
              onChange={handleChangeForm}
              disabled={submitting}
              required
              maxLength={100}
              placeholder="Ví dụ: Sản phẩm"
              className="
                h-11 w-full rounded-xl
                border border-input bg-surface
                px-4 text-sm text-text-default
                outline-none transition
                focus:border-brand
                focus:ring-4 focus:ring-brand/10
                disabled:cursor-not-allowed
                disabled:bg-surface-muted
              "
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-text-default">
              Giá cơ bản
            </span>

            <input
              type="number"
              name="basePrice"
              value={form.basePrice}
              onChange={handleChangeForm}
              disabled={submitting}
              required
              min="0"
              step="1000"
              placeholder="0"
              className="
                h-11 w-full rounded-xl
                border border-input bg-surface
                px-4 text-sm text-text-default
                outline-none transition
                focus:border-brand
                focus:ring-4 focus:ring-brand/10
                disabled:cursor-not-allowed
                disabled:bg-surface-muted
              "
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-text-default">
            Thẻ dịch vụ
          </span>

          <input
            name="tags"
            value={form.tags}
            onChange={handleChangeForm}
            disabled={submitting}
            placeholder="Thiết kế, Rập, May mặc"
            className="
              h-11 w-full rounded-xl
              border border-input bg-surface
              px-4 text-sm text-text-default
              outline-none transition
              focus:border-brand
              focus:ring-4 focus:ring-brand/10
              disabled:cursor-not-allowed
              disabled:bg-surface-muted
            "
          />

          <span className="block text-xs text-text-muted">
            Phân cách các thẻ bằng dấu phẩy.
          </span>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-text-default">
            Mô tả
          </span>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChangeForm}
            disabled={submitting}
            rows={4}
            maxLength={1000}
            placeholder="Mô tả ngắn về dịch vụ..."
            className="
              w-full resize-y rounded-xl
              border border-input bg-surface
              px-4 py-3 text-sm text-text-default
              outline-none transition
              focus:border-brand
              focus:ring-4 focus:ring-brand/10
              disabled:cursor-not-allowed
              disabled:bg-surface-muted
            "
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-text-default">
            Trạng thái
          </span>

          <select
            name="status"
            value={form.status}
            onChange={handleChangeForm}
            disabled={submitting}
            className="
              h-11 w-full rounded-xl
              border border-input bg-surface
              px-4 text-sm text-text-default
              outline-none transition
              focus:border-brand
              focus:ring-4 focus:ring-brand/10
              disabled:cursor-not-allowed
              disabled:bg-surface-muted
            "
          >
            <option value="active">
              Đang hoạt động
            </option>

            <option value="inactive">
              Tạm ngừng
            </option>
          </select>
        </label>
      </FormModal>

      <ConfirmModal
        open={Boolean(removingService)}
        title="Xóa dịch vụ?"
        confirmText="Xóa dịch vụ"
        loadingText="Đang xóa..."
        confirmVariant="danger"
        submitting={removing}
        onClose={() => {
          if (removing) return;

          setRemovingService(null);
          setRemoveError("");
        }}
        onConfirm={confirmRemove}
      >
        <p>
          Bạn có chắc muốn xóa dịch vụ{" "}
          <strong className="text-text-default">
            {removingService?.serviceName}
          </strong>
          ?
        </p>

        <p className="mt-2">
          Dịch vụ đang được sử dụng trong đơn hàng có thể
          không xóa được.
        </p>

        {removeError && (
          <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-danger">
            {removeError}
          </p>
        )}
      </ConfirmModal>
    </>
  );
};

export default ServiceManagementPage;