import { ButtonIconText } from "@/components/ui/Button/Button";
import { SectionCard } from "@/components/ui/Section/Section";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNotification } from "@/components/ui/Notification/NotificationContext";
import FormModal from "@/components/ui/Form/FormModal";
import { USER_ADDRESS_API, USER_API } from "@/api/config";
import {
  ArrowDownAZ,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  MapPin,
  Plus,
  Search,
} from "lucide-react";

const statusClassName = {
  Active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Inactive: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
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

  const [actionMenu, setActionMenu] = useState({
    open: false,
    x: 0,
    y: 0,
    address: null,
  });

  const [confirmDefaultAddress, setConfirmDefaultAddress] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sortType, setSortType] = useState("all");
  const { showNotification } = useNotification();

  const [addingAddress, setAddingAddress] = useState(false);

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idUser = localStorage.getItem("idUser");

        const userResponse = await axios.get(
          `${USER_API}/me/${idUser}`
        );

        const addressResponse = await axios.get(
          `${USER_ADDRESS_API}/user/${idUser}`
        );

        setDefaultAddressId(userResponse.data?.user?.defaultAddress?.addressId ?? null);
        setAddresses(addressResponse.data);
      } catch (error) {
        console.error("Lỗi tải địa chỉ:", error);
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

  const totalPages = Math.ceil(
    filteredAddresses.length / ITEMS_PER_PAGE
  );

  const paginatedAddresses = filteredAddresses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const showingStart =
    filteredAddresses.length === 0
      ? 0
      : (currentPage - 1) * ITEMS_PER_PAGE + 1;

  const showingEnd = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredAddresses.length
  );

  const handleAddMail = () => {
    setEditingAddress(null);

    setForm({
      companyName: "",
      address: "",
      note: "",
    });

    setAddingAddress(true);
  };

  if (loading) {
    return (
      <SectionCard
        title="Address"
        desc="Edit the user's address."
      >
        <p>Loading...</p>
      </SectionCard>
    );
  }

  // Trạng thái hoạt động của địa chỉ
  const getAddressStatus = (item) => {
    return item.addressId === defaultAddressId ? "Active" : "Inactive";
  };

  // Handle
  const ACTION_MENU_WIDTH = 208;
  const ACTION_MENU_HEIGHT = 156;
  const GAP = 8;

  const handleOpenActionMenu = (event, item) => {
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();

    let x = rect.right - ACTION_MENU_WIDTH;
    let y = rect.bottom + GAP;

    if (x < GAP) x = GAP;

    if (y + ACTION_MENU_HEIGHT > window.innerHeight - GAP) {
      y = rect.top - ACTION_MENU_HEIGHT - GAP;
    }

    setActionMenu({
      open: true,
      x,
      y,
      address: item,
    });
  };

  const handleOpenConfirmDefault = () => {
    setConfirmDefaultAddress(actionMenu.address);
    setActionMenu({
      open: false,
      x: 0,
      y: 0,
      address: null,
    });
  };

  const handleConfirmSetDefault = async () => {
    if (!confirmDefaultAddress) return;

    try {
      setSubmitting(true);

      const idUser = localStorage.getItem("idUser");

      await axios.put(
        `${USER_ADDRESS_API}/user/${idUser}/default/${confirmDefaultAddress.addressId}`
      );

      setDefaultAddressId(confirmDefaultAddress.addressId);
      setConfirmDefaultAddress(null);
      showNotification(
        "success",
        "Thành công",
        "Đã cập nhật địa chỉ mặc định."
      );
    } catch (error) {
      showNotification(
        "error",
        "Thất bại",
        error.response?.data?.message ||
          "Lỗi cập nhật địa chỉ mặc định."
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

    setActionMenu({
      open: false,
      x: 0,
      y: 0,
      address: null,
    });
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

      await axios.put(
        `${USER_ADDRESS_API}/${editingAddress.addressId}`,
        form
      );

      setAddresses((prev) =>
        prev.map((item) =>
          item.addressId === editingAddress.addressId
            ? {
                ...item,
                companyName: form.companyName,
                address: form.address,
                note: form.note,
              }
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
    if (deleteAddress.addressId === defaultAddressId) {
      alert("Không thể xóa địa chỉ mặc định");
      return;
    }

    try {
      setSubmitting(true);

      await axios.delete(`${USER_ADDRESS_API}/${deleteAddress.addressId}`);

      setAddresses((prev) =>
        prev.filter((item) => item.addressId !== deleteAddress.addressId)
      );

      if (deleteAddress.addressId === defaultAddressId) {
        setDefaultAddressId(null);
      }

      setDeleteAddress(null);

      showNotification(
        "success",
        "Thành công",
        "Đã xóa địa chỉ."
      );
    } catch (error) {
      showNotification(
        "error",
        "Thất bại",
        error.response?.data?.message ||
          "Không thể xóa địa chỉ."
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

      const idUser = localStorage.getItem("idUser");

      const response = await axios.post(
        `${USER_ADDRESS_API}/user/${idUser}`,
        form
      );

      setAddresses((prev) => [...prev, response.data]);

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

  return (
      <SectionCard
        title="Address"
        desc="Edit the user's address."
      > 
        <div className="flex justify-end items-center">
          <ButtonIconText
            text="Add Address"
            icon={Plus}
            onClick={handleAddMail}
            className="bg-brand! text-brand-light! hover:text-brand-light/85! hover:shadow-2xl transition"
            classNameIcon="text-brand-light! border-brand-light!"
          />
        </div>
        {/* Table */}
        <div className="space-y-5 pt-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <label className="relative block w-full xl:max-w-sm">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchKeyword}
                onChange={(event) => {
                  setSearchKeyword(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm kiếm địa chỉ..."
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonIconText
                text="Show All Address"
                icon={MapPin}
                onClick={handleShowAllAddress}
                className={`
                  rounded-full!
                  ${sortType === "all" ? "bg-brand! text-white!" : ""}
                `}
                classNameIcon={`${sortType === "all" ? "bg-brand! text-white! border-white!" : ""}`}
              />

              <ButtonIconText
                text="Show by name A-Z"
                icon={ArrowDownAZ}
                onClick={handleSortNameAZ}
                className={`
                  rounded-full!
                  ${sortType === "name-asc" ? "bg-brand! text-white!" : ""}
                `}
                classNameIcon={`${sortType === "name-asc" ? "bg-brand! text-white! border-white!" : ""}`}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-205 table-fixed">
                <colgroup>
                  <col className="w-[16%]" />
                  <col className="w-[25%]" />
                  <col className="w-[34%]" />
                  <col className="w-[18%]" />
                  <col className="w-[7%]" />
                </colgroup>

                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                      <div className="flex items-center gap-3">
                        Trạng thái
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                      Tên công ty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                      Địa chỉ công ty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                      Ghi chú
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {paginatedAddresses.length > 0 ? (
                    paginatedAddresses.map((item) => (
                      <tr
                        key={item.addressId}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-start gap-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                statusClassName[getAddressStatus(item)]
                              }`}
                            >
                              {getAddressStatus(item)}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top text-sm font-medium text-gray-800">
                          {item.companyName}
                        </td>

                        <td className="px-4 py-4 align-top text-sm leading-6 text-gray-600">
                            {item.address}
                        </td>

                        <td className="px-4 py-4 align-top text-sm leading-6 text-gray-600">
                          {item.note}
                        </td>

                        <td className="px-4 py-4 align-top">
                          <button
                            type="button"
                            aria-label={`Open actions for ${item.companyName}`}
                            onClick={
                              (event) => handleOpenActionMenu(event, item)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition hover:border-brand hover:bg-brand/5 hover:text-brand"
                          >
                            <Ellipsis size={19} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-sm text-gray-500"
                      >
                        Không tìm thấy địa chỉ phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500!">
              Hiển thị {showingStart}-{showingEnd} trong số {filteredAddresses.length} địa chỉ
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-600 transition hover:border-brand hover:text-brand"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-semibold transition ${
                    page === currentPage
                      ? "border-brand bg-brand text-subtle"
                      : "border-gray-300 bg-white text-gray-600 hover:border-brand hover:text-brand"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-600 transition hover:border-brand hover:text-brand"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
        {actionMenu.open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() =>
                setActionMenu({
                  open: false,
                  x: 0,
                  y: 0,
                  address: null,
                })
              }
            />

            <div
              className="fixed z-50 w-52 max-w-[calc(100vw-16px)] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
              style={{
                top: actionMenu.y,
                left: actionMenu.x,
              }}
            >
              <button
                type="button"
                onClick={() => handleOpenEdit(actionMenu.address)}
                className="
                  w-full px-4 py-3 text-left text-sm font-medium
                  text-gray-700 transition
                  hover:bg-brand/5 hover:text-brand
                "
              >
                Edit
              </button>

              <button
                type="button"
                disabled={
                  actionMenu.address?.addressId === defaultAddressId
                }
                onClick={() => {
                  setDeleteAddress(actionMenu.address);
                  setActionMenu({
                    open: false,
                    x: 0,
                    y: 0,
                    address: null,
                  });
                }}
                className="
                  w-full px-4 py-3 text-left text-sm font-medium
                  text-red-600 transition
                  hover:bg-red-50

                  disabled:cursor-not-allowed disabled:opacity-50
                  disabled:hover:bg-white
                "
              >
                Delete
              </button>

              <div className="h-px bg-gray-200" />

              <button
                type="button"
                onClick={handleOpenConfirmDefault}
                disabled={
                  actionMenu.address?.addressId === defaultAddressId
                }
                className="
                  w-full px-4 py-3 text-left text-sm font-medium
                  text-gray-700 transition
                  hover:bg-brand/5 hover:text-brand
                  disabled:cursor-not-allowed
                  disabled:text-gray-400
                  disabled:hover:bg-white
                "
              >
                Đặt làm mặc định
              </button>
            </div>
          </>
        )}

        {/* CONFIRM */}
        {confirmDefaultAddress && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900">
                Xác nhận địa chỉ mặc định
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Bạn có chắc muốn chọn{" "}
                <span className="font-semibold text-gray-900">
                  {confirmDefaultAddress.companyName}
                </span>{" "}
                làm địa chỉ mặc định không?
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDefaultAddress(null)}
                  disabled={submitting}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={handleConfirmSetDefault}
                  disabled={submitting}
                  className="rounded-lg bg-brand! px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {submitting ? "Đang lưu..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE */}
        {deleteAddress && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900">
                Xóa địa chỉ
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Bạn có chắc muốn xóa địa chỉ của{" "}
                <span className="font-semibold text-gray-900">
                  {deleteAddress.companyName}
                </span>{" "}
                không?
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteAddress(null)}
                  disabled={submitting}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDeleteAddress}
                  disabled={submitting}
                  className="rounded-lg bg-red-600! px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {submitting ? "Đang xóa..." : "Xóa"}
                </button>
              </div>
            </div>
          </div>
        )}

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
  );
};

export default AddressPage;
