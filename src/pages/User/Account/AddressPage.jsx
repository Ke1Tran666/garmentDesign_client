import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownAZ,
  Check,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { ButtonIconText } from "@/shared/ui/button/Button";
import { SectionCard } from "@/shared/ui/section/Section";
import { useNotification } from "@/app/providers/NotificationProvider";
import FormModal from "@/shared/ui/modal/FormModal";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import DataTable from "@/shared/ui/table/DataTable";
import Pagination from "@/shared/ui/table/Pagination";
import MenuTable from "@/shared/ui/menu/MenuTable";
import { addressApi } from "@/entities/address/api/addressApi";
import { userApi } from "@/entities/user/api/userApi";
import { useAuth } from "@/features/auth/model/useAuth";

const statusClassName = {
  Active: "bg-success-soft text-success ring-1 ring-success-border",
  Inactive: "bg-surface-muted text-text-muted ring-1 ring-border",
};

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
  {
    key: "status",
    title: "Trạng thái",
  },
  {
    key: "companyName",
    title: "Tên công ty",
  },
  {
    key: "address",
    title: "Địa chỉ công ty",
  },
  {
    key: "note",
    title: "Ghi chú",
  },
  {
    key: "action",
    title: "Action",
    className: "text-center",
  },
];

const initialActionMenuState = {
  open: false,
  x: 0,
  y: 0,
  address: null,
};

const AddressPage = () => {
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

        const [userData, addressData] =
          await Promise.all([
            userApi.getMe(),
            addressApi.getMine(),
          ]);

        setDefaultAddressId(
          userData?.user?.defaultAddress?.addressId ?? null,
        );

        setAddresses(addressData || []);

      } catch (error) {
        console.error("Lỗi tải địa chỉ:", error);

        setAddresses([]);
        setErrorMessage(
          error.response?.data?.message ||
            "Không thể tải danh sách địa chỉ.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAddresses = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    let result = [...addresses];

    // Search
    if (keyword) {
      result = result.filter((item) =>
        [
          item.companyName,
          item.address,
          item.note,
        ]
          .filter(Boolean)
          .some((value) =>
            value.toLowerCase().includes(keyword)
          )
      );
    }

    // Active luôn lên đầu
    result.sort((a, b) => {
      const aActive = a.addressId === defaultAddressId ? 1 : 0;
      const bActive = b.addressId === defaultAddressId ? 1 : 0;

      return bActive - aActive;
    });

    // Sort theo tên
    if (sortType === "name-asc") {
      result.sort((a, b) => {
        const aActive = a.addressId === defaultAddressId ? 1 : 0;
        const bActive = b.addressId === defaultAddressId ? 1 : 0;

        // Active luôn đứng đầu
        if (aActive !== bActive) {
          return bActive - aActive;
        }

        return (a.companyName || "").localeCompare(
          b.companyName || "",
          "vi"
        );
      });
    }

    return result;
  }, [addresses, searchKeyword, sortType, defaultAddressId]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAddresses.length / ITEMS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const paginatedAddresses = useMemo(() => {
    const start =
      (safeCurrentPage - 1) * ITEMS_PER_PAGE;

    return filteredAddresses.slice(
      start,
      start + ITEMS_PER_PAGE,
    );
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

  // Trạng thái hoạt động của địa chỉ
  const getAddressStatus = (item) => {
    return item.addressId === defaultAddressId ? "Active" : "Inactive";
  };

  // Handle

  const handleOpenActionMenu = (event, item) => {
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();

    const menuWidth = 208;
    const menuHeight = 156;
    const screenPadding = 12;

    let x = rect.right - menuWidth;
    let y = rect.bottom + 8;

    if (x < screenPadding) {
      x = screenPadding;
    }

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
        error.response?.data?.message ||
          "Lỗi cập nhật địa chỉ mặc định.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle sort
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
      alert("Tên công ty không được để trống");
      return;
    }

    if (!form.address.trim()) {
      alert("Địa chỉ không được để trống");
      return;
    }

    try {
      setSubmitting(true);

      const updatedAddress =
        await addressApi.update(
          editingAddress.addressId,
          form,
        );

      setAddresses((current) =>
        current.map((item) =>
          item.addressId
            === editingAddress.addressId
            ? updatedAddress
            : item
        )
      );

      setEditingAddress(null);

      showNotification(
        "success",
        "Thành công",
        "Đã cập nhật địa chỉ."
      );
    } catch (error) {
      showNotification(
        "error",
        "Thất bại",
        error.response?.data?.message ||
          "Không thể cập nhật địa chỉ."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteAddress = async () => {
    if (!deleteAddress) return;

    const deletedAddressId = deleteAddress.addressId;
    const deletedWasDefault =
      deletedAddressId === defaultAddressId;

    try {
      setSubmitting(true);

      await addressApi.remove(deletedAddressId);

      setAddresses((current) =>
        current.filter(
          (item) => item.addressId !== deletedAddressId,
        ),
      );

      if (deletedWasDefault) setDefaultAddressId(null);

      setDeleteAddress(null);

      await refreshSession();

      showNotification(
        "success",
        "Thành công",
        deletedWasDefault
          ? "Đã xóa địa chỉ mặc định."
          : "Đã xóa địa chỉ.",
      );
    } catch (error) {
      showNotification(
        "error",
        "Thất bại",
        error.response?.data?.message ||
          "Không thể xóa địa chỉ.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAddress = async () => {
    if (!form.companyName.trim()) {
      showNotification(
        "error",
        "Thất bại",
        "Tên công ty không được để trống."
      );
      return;
    }

    if (!form.address.trim()) {
      showNotification(
        "error",
        "Thất bại",
        "Địa chỉ không được để trống."
      );
      return;
    }

    try {
      setSubmitting(true);

      const createdAddress = await addressApi.create(form);

      await refreshSession();

      setAddresses((prev) => [
        ...prev,
        createdAddress,
      ]);

      setAddingAddress(false);

      showNotification(
        "success",
        "Thành công",
        "Đã thêm địa chỉ."
      );
    } catch (error) {
      console.error("Lỗi thêm địa chỉ:", error);

      showNotification(
        "error",
        "Thất bại",
        "Không thể thêm địa chỉ."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // confirm và variant
  const activeConfirm = confirmDefaultAddress || deleteAddress;

  const isDeleteConfirm = !!deleteAddress;

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
      disabled:
        selectedAddress?.addressId === defaultAddressId,
      onClick: () => {
        if (selectedAddress) {
          setConfirmDefaultAddress(selectedAddress);
        }
      },
    },
  ];

  return (
    <>
      <SectionCard
        title="Address"
        desc="Edit the user's address."
      > 
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-text-default">
              Tổng số địa chỉ: {addresses.length}
            </p>

            <p className="mt-1 text-sm text-text-muted">
              Hiển thị {filteredAddresses.length} kết quả
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border px-3 py-2 sm:w-80">
              <Search
                size={18}
                className="shrink-0 text-text-subtle"
              />

              <input
                type="text"
                value={searchKeyword}
                placeholder="Tìm tên công ty, địa chỉ, ghi chú..."
                onChange={(event) => {
                  setSearchKeyword(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleAddMail}
              className="
                inline-flex h-11 shrink-0 items-center justify-center
                gap-2 rounded-xl bg-brand! px-5
                text-sm font-semibold text-white shadow-sm
                transition hover:opacity-90
              "
            >
              <Plus size={18} />
              Thêm địa chỉ
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <ButtonIconText
            text="Tất cả địa chỉ"
            icon={MapPin}
            onClick={handleShowAllAddress}
            className={`
              rounded-full!
              ${sortType === "all" ? "bg-brand! text-white!" : ""}
            `}
            classNameIcon={
              sortType === "all"
                ? "border-white! bg-brand! text-white!"
                : ""
            }
          />

          <ButtonIconText
            text="Tên A-Z"
            icon={ArrowDownAZ}
            onClick={handleSortNameAZ}
            className={`
              rounded-full!
              ${sortType === "name-asc" ? "bg-brand! text-white!" : ""}
            `}
            classNameIcon={
              sortType === "name-asc"
                ? "border-white! bg-brand! text-white!"
                : ""
            }
          />
        </div>

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
          renderRow={(item) => (
            <tr
              key={item.addressId}
              className="text-sm transition hover:bg-surface-subtle"
            >
              <td className="px-4 py-4">
                <span
                  className={`
                    inline-flex rounded-full px-3 py-1
                    text-xs font-semibold
                    ${statusClassName[getAddressStatus(item)]}
                  `}
                >
                  {getAddressStatus(item)}
                </span>
              </td>

              <td className="px-4 py-4 font-semibold text-text-strong">
                {item.companyName || "Chưa có"}
              </td>

              <td className="px-4 py-4 leading-6 text-text-default">
                {item.address || "Chưa có"}
              </td>

              <td className="px-4 py-4 leading-6 text-text-default">
                {item.note || "Không có ghi chú"}
              </td>

              <td className="px-4 py-4 text-center">
                <button
                  type="button"
                  onClick={(event) =>
                    handleOpenActionMenu(event, item)
                  }
                  aria-label={`Mở thao tác cho ${item.companyName}`}
                  aria-haspopup="menu"
                  aria-expanded={
                    actionMenu.open &&
                    actionMenu.address?.addressId === item.addressId
                  }
                  className={`
                    rounded-lg border p-2 transition
                    ${
                      actionMenu.open &&
                      actionMenu.address?.addressId === item.addressId
                        ? "border-brand bg-brand-light text-brand"
                        : "border-border text-text-muted hover:bg-surface-subtle"
                    }
                  `}
                >
                  <MoreVertical size={18} />
                </button>
              </td>
            </tr>
          )}
        />

        <div className="mt-4">
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
              Bạn có chắc muốn xóa {" "}
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

        {/* ADD & EDIT*/}
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
          onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress}
          submitText={editingAddress ? "Lưu thay đổi" : "Thêm địa chỉ"}
          loadingText={editingAddress ? "Đang lưu..." : "Đang thêm..."}
          submitting={submitting}
        />
      </SectionCard>
    </>
  );
};

export default AddressPage;
