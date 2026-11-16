import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownAZ,
  Building2,
  Check,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";

import { useNotification } from "@/app/providers/NotificationProvider";
import { addressApi } from "@/entities/address/api/addressApi";
import { userApi } from "@/entities/user/api/userApi";
import { useAuth } from "@/features/auth/model/useAuth";
import { StatusBadge } from "@/shared/ui/badge/StatusBadge";
import PageHeader from "@/shared/ui/heading/PageHeader";
import MenuTable from "@/shared/ui/menu/MenuTable";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import FormModal from "@/shared/ui/modal/FormModal";
import StatCard from "@/shared/ui/stats/StatCard";
import DataTable from "@/shared/ui/table/DataTable";
import Pagination from "@/shared/ui/table/Pagination";

const addressFields = [
  {
    name: "companyName",
    placeholder: "Tên công ty",
  },
  {
    name: "address",
    placeholder: "Địa chỉ công ty",
  },
  {
    name: "note",
    placeholder: "Ghi chú",
    type: "textarea",
    rows: 4,
  },
];

const ITEMS_PER_PAGE = 10;

const ADDRESS_COLUMNS = [
  { key: "status", title: "Trạng thái" },
  { key: "companyName", title: "Tên công ty" },
  { key: "address", title: "Địa chỉ công ty" },
  { key: "note", title: "Ghi chú" },
  { key: "action", title: "Thao tác", className: "text-center" },
];

const initialActionMenuState = {
  open: false,
  x: 0,
  y: 0,
  address: null,
};

const AddressPage = () => {
  const { searchKeyword: topbarSearch = "" } = useOutletContext() || {};
  const [searchKeyword, setSearchKeyword] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteAddress, setDeleteAddress] = useState(null);
  const [form, setForm] = useState({
    companyName: "",
    address: "",
    note: "",
  });

  const [actionMenu, setActionMenu] = useState(initialActionMenuState);
  const [confirmDefaultAddress, setConfirmDefaultAddress] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sortType, setSortType] = useState("all");
  const { showNotification } = useNotification();

  const [addingAddress, setAddingAddress] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const { refreshSession } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const [userData, addressData] = await Promise.all([
          userApi.getMe(),
          addressApi.getMine(),
        ]);

        setDefaultAddressId(userData?.user?.defaultAddress?.addressId ?? null);
        setAddresses(addressData || []);
      } catch (error) {
        console.error("Lỗi tải địa chỉ:", error);
        setAddresses([]);
        setErrorMessage(
          error.response?.data?.message || "Không thể tải danh sách địa chỉ.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const defaultAddressItem = useMemo(
    () => addresses.find((item) => item.addressId === defaultAddressId) || null,
    [addresses, defaultAddressId],
  );

  const filteredAddresses = useMemo(() => {
    const keyword = (searchKeyword || topbarSearch).trim().toLowerCase();
    let result = [...addresses];

    if (keyword) {
      result = result.filter((item) =>
        [item.companyName, item.address, item.note]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(keyword)),
      );
    }

    result.sort((a, b) => {
      const aActive = a.addressId === defaultAddressId ? 1 : 0;
      const bActive = b.addressId === defaultAddressId ? 1 : 0;
      return bActive - aActive;
    });

    if (sortType === "name-asc") {
      result.sort((a, b) => {
        const aActive = a.addressId === defaultAddressId ? 1 : 0;
        const bActive = b.addressId === defaultAddressId ? 1 : 0;
        if (aActive !== bActive) {
          return bActive - aActive;
        }
        return (a.companyName || "").localeCompare(b.companyName || "", "vi");
      });
    }

    return result;
  }, [addresses, searchKeyword, topbarSearch, sortType, defaultAddressId]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAddresses.length / ITEMS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedAddresses = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredAddresses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAddresses, safeCurrentPage]);

  const handleAddMail = () => {
    setEditingAddress(null);
    setForm({
      companyName: "",
      address: "",
      note: "",
    });
    setAddingAddress(true);
  };

  const getAddressStatus = (item) => {
    return item.addressId === defaultAddressId ? "Active" : "Inactive";
  };

  const handleOpenActionMenu = (event, item) => {
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 208;
    const menuHeight = 156;
    const screenPadding = 12;

    let x = rect.right - menuWidth;
    let y = rect.bottom + 8;

    if (x < screenPadding) x = screenPadding;
    if (x + menuWidth > window.innerWidth - screenPadding) {
      x = window.innerWidth - menuWidth - screenPadding;
    }
    if (y + menuHeight > window.innerHeight - screenPadding) {
      y = rect.top - menuHeight - 8;
    }

    setActionMenu({
      open: true,
      x,
      y,
      address: item,
    });
  };

  const handleCloseActionMenu = () => {
    setActionMenu(initialActionMenuState);
  };

  const handleConfirmSetDefault = async () => {
    if (!confirmDefaultAddress) return;

    const selectedAddressId = confirmDefaultAddress.addressId;

    try {
      setSubmitting(true);

      await addressApi.setDefault(selectedAddressId);

      setDefaultAddressId(selectedAddressId);
      setConfirmDefaultAddress(null);

      await refreshSession();

      showNotification(
        "success",
        "Thành công",
        "Đã cập nhật địa chỉ mặc định.",
      );
    } catch (error) {
      showNotification(
        "error",
        "Thất bại",
        error.response?.data?.message || "Lỗi cập nhật địa chỉ mặc định.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowAllAddress = () => {
    setSortType("all");
    setCurrentPage(1);
  };

  const handleSortNameAZ = () => {
    setSortType("name-asc");
    setCurrentPage(1);
  };

  const handleChangeForm = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenEdit = (address) => {
    setAddingAddress(false);
    setEditingAddress(address);

    setForm({
      companyName: address.companyName || "",
      address: address.address || "",
      note: address.note || "",
    });

    handleCloseActionMenu();
  };

  const handleUpdateAddress = async () => {
    if (!editingAddress) return;
    if (!form.companyName.trim()) {
      showNotification("error", "Thất bại", "Tên công ty không được để trống.");
      return;
    }

    if (!form.address.trim()) {
      showNotification("error", "Thất bại", "Địa chỉ không được để trống.");
      return;
    }

    try {
      setSubmitting(true);

      const updatedAddress = await addressApi.update(
        editingAddress.addressId,
        form,
      );

      setAddresses((current) =>
        current.map((item) =>
          item.addressId === editingAddress.addressId ? updatedAddress : item,
        ),
      );

      setEditingAddress(null);

      showNotification("success", "Thành công", "Đã cập nhật địa chỉ.");
    } catch (error) {
      showNotification(
        "error",
        "Thất bại",
        error.response?.data?.message || "Không thể cập nhật địa chỉ.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteAddress = async () => {
    if (!deleteAddress) return;

    const deletedAddressId = deleteAddress.addressId;
    const deletedWasDefault = deletedAddressId === defaultAddressId;

    try {
      setSubmitting(true);

      await addressApi.remove(deletedAddressId);

      setAddresses((current) =>
        current.filter((item) => item.addressId !== deletedAddressId),
      );

      if (deletedWasDefault) setDefaultAddressId(null);

      setDeleteAddress(null);

      await refreshSession();

      showNotification(
        "success",
        "Thành công",
        deletedWasDefault ? "Đã xóa địa chỉ mặc định." : "Đã xóa địa chỉ.",
      );
    } catch (error) {
      showNotification(
        "error",
        "Thất bại",
        error.response?.data?.message || "Không thể xóa địa chỉ.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAddress = async () => {
    if (!form.companyName.trim()) {
      showNotification("error", "Thất bại", "Tên công ty không được để trống.");
      return;
    }

    if (!form.address.trim()) {
      showNotification("error", "Thất bại", "Địa chỉ không được để trống.");
      return;
    }

    try {
      setSubmitting(true);

      const createdAddress = await addressApi.create(form);

      await refreshSession();

      setAddresses((prev) => [...prev, createdAddress]);
      setAddingAddress(false);

      showNotification("success", "Thành công", "Đã thêm địa chỉ.");
    } catch (error) {
      console.error("Lỗi thêm địa chỉ:", error);
      showNotification("error", "Thất bại", "Không thể thêm địa chỉ.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeConfirm = confirmDefaultAddress || deleteAddress;
  const isDeleteConfirm = Boolean(deleteAddress);

  const closeConfirmModal = () => {
    setConfirmDefaultAddress(null);
    setDeleteAddress(null);
  };

  const handleConfirmAction = () => {
    if (isDeleteConfirm) {
      handleConfirmDeleteAddress();
      return;
    }
    handleConfirmSetDefault();
  };

  const selectedAddress = actionMenu.address;

  const actionMenuItems = [
    {
      id: "edit",
      label: "Chỉnh sửa",
      icon: Pencil,
      onClick: () => {
        if (selectedAddress) {
          handleOpenEdit(selectedAddress);
        }
      },
    },
    {
      id: "delete",
      label: "Xóa địa chỉ",
      icon: Trash2,
      danger: true,
      disabled: selectedAddress?.addressId === defaultAddressId,
      onClick: () => {
        if (selectedAddress) {
          setDeleteAddress(selectedAddress);
        }
      },
    },
    {
      id: "divider",
      type: "divider",
    },
    {
      id: "default",
      label: "Đặt làm mặc định",
      icon: Check,
      disabled: selectedAddress?.addressId === defaultAddressId,
      onClick: () => {
        if (selectedAddress) {
          setConfirmDefaultAddress(selectedAddress);
        }
      },
    },
  ];

  return (
    <div className="animate-in space-y-6 duration-200 fade-in">
      {/* 1. Page Header */}
      <PageHeader
        title="Sổ địa chỉ"
        badge={
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {addresses.length} địa chỉ
          </span>
        }
        description="Quản lý danh sách địa chỉ công ty và địa điểm giao nhận đơn hàng dịch vụ."
        actions={
          <button
            type="button"
            onClick={handleAddMail}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-brand! px-3.5 text-xs font-semibold text-white! shadow-sm shadow-brand/25 transition-all hover:bg-brand-hover! active:scale-95"
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span>Thêm địa chỉ</span>
          </button>
        }
      />

      {/* 2. Metric Stats Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Tổng số địa chỉ"
          value={addresses.length}
          subtitle="địa điểm đã lưu"
          icon={MapPin}
          iconColorClass="bg-blue-50 text-brand dark:bg-blue-950/50 dark:text-blue-400"
        />

        <StatCard
          title="Địa chỉ mặc định"
          value={defaultAddressItem ? 1 : 0}
          subtitle={defaultAddressItem?.companyName || "Chưa thiết lập"}
          icon={Star}
          iconColorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
        />

        <StatCard
          title="Địa chỉ phụ"
          value={Math.max(0, addresses.length - (defaultAddressItem ? 1 : 0))}
          subtitle="chi nhánh & kho nhận hàng"
          icon={Building2}
          iconColorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
        />
      </section>

      {/* 3. Toolbar & Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShowAllAddress}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                sortType === "all"
                  ? "bg-brand! text-white! shadow-xs"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <MapPin size={14} />
              <span>Tất cả địa chỉ</span>
            </button>

            <button
              type="button"
              onClick={handleSortNameAZ}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                sortType === "name-asc"
                  ? "bg-brand! text-white! shadow-xs"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <ArrowDownAZ size={14} />
              <span>Tên A-Z</span>
            </button>
          </div>

          <div className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-700" />

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Tổng số địa chỉ: {addresses.length}</span>
            <span>•</span>
            <span>Hiển thị {filteredAddresses.length} kết quả</span>
          </div>
        </div>

        <div className="relative w-full sm:w-76">
          <Search
            size={15}
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchKeyword}
            placeholder="Tìm tên công ty, địa chỉ, ghi chú..."
            onChange={(event) => {
              setSearchKeyword(event.target.value);
              setCurrentPage(1);
            }}
            className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 pr-3 pl-9.5 text-xs text-slate-800 transition-all placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
          />
        </div>
      </div>

      {/* 4. Data Table */}
      <div className="space-y-4">
        <DataTable
          columns={ADDRESS_COLUMNS}
          data={paginatedAddresses}
          loading={loading}
          loadingText="Đang tải danh sách địa chỉ..."
          error={errorMessage}
          minWidth="min-w-200"
          emptyText={
            searchKeyword.trim()
              ? "Không tìm thấy địa chỉ phù hợp."
              : "Chưa có địa chỉ."
          }
          renderRow={(item) => {
            const status = getAddressStatus(item);
            const isDefault = status === "Active";

            return (
              <tr
                key={item.addressId}
                className="text-xs transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
              >
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <StatusBadge
                    label={status}
                    tone={isDefault ? "success" : "neutral"}
                  />
                </td>

                <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                  {item.companyName || "Chưa có"}
                </td>

                <td className="px-4 py-3.5 leading-5 text-slate-700 dark:text-slate-300">
                  {item.address || "Chưa có"}
                </td>

                <td className="px-4 py-3.5 leading-5 text-slate-500 dark:text-slate-400">
                  {item.note || "Không có ghi chú"}
                </td>

                <td className="px-4 py-3.5 text-center whitespace-nowrap">
                  <button
                    type="button"
                    onClick={(event) => handleOpenActionMenu(event, item)}
                    aria-label={`Mở thao tác cho ${item.companyName}`}
                    aria-haspopup="menu"
                    aria-expanded={
                      actionMenu.open &&
                      actionMenu.address?.addressId === item.addressId
                    }
                    className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition ${
                      actionMenu.open &&
                      actionMenu.address?.addressId === item.addressId
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                  >
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            );
          }}
        />

        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showOnSinglePage
        />
      </div>

      <MenuTable
        open={actionMenu.open}
        position={{
          x: actionMenu.x,
          y: actionMenu.y,
        }}
        width={208}
        items={actionMenuItems}
        onClose={handleCloseActionMenu}
      />

      {/* DELETE & CONFIRM */}
      <ConfirmModal
        open={!!activeConfirm}
        title={isDeleteConfirm ? "Xóa địa chỉ" : "Xác nhận địa chỉ mặc định"}
        confirmText={isDeleteConfirm ? "Xóa" : "Xác nhận"}
        loadingText={isDeleteConfirm ? "Đang xóa..." : "Đang lưu..."}
        confirmVariant={isDeleteConfirm ? "danger" : "primary"}
        submitting={submitting}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
      >
        {isDeleteConfirm ? (
          <>
            Bạn có chắc muốn xóa{" "}
            <span className="font-semibold text-text-strong">
              {activeConfirm?.companyName} - {activeConfirm?.address}
            </span>{" "}
            không?
          </>
        ) : (
          <>
            Bạn có chắc muốn chọn{" "}
            <span className="font-semibold text-text-strong">
              {activeConfirm?.companyName} - {activeConfirm?.address}
            </span>{" "}
            làm địa chỉ mặc định không?
          </>
        )}
      </ConfirmModal>

      {/* ADD & EDIT */}
      <FormModal
        open={addingAddress || !!editingAddress}
        title={editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"}
        fields={addressFields}
        form={form}
        onChange={handleChangeForm}
        onClose={() => {
          setAddingAddress(false);
          setEditingAddress(null);
        }}
        onSubmit={(event) => {
          event.preventDefault();

          if (editingAddress) {
            handleUpdateAddress();
          } else {
            handleCreateAddress();
          }
        }}
        submitText={editingAddress ? "Lưu thay đổi" : "Thêm địa chỉ"}
        loadingText={editingAddress ? "Đang lưu..." : "Đang thêm..."}
        submitting={submitting}
      />
    </div>
  );
};

export default AddressPage;
