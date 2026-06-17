import { ButtonIconText } from "@/components/ui/Button/Button";
import { SectionCard } from "@/components/ui/Section/Section";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
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

const ADDRESS_TOTAL = 25;

const statusClassName = {
  Active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Inactive: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
};

const AddressPage = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaultAddressId, setDefaultAddressId] = useState(null);

  const [actionMenu, setActionMenu] = useState({
    open: false,
    x: 0,
    y: 0,
    address: null,
  });

  const [confirmDefaultAddress, setConfirmDefaultAddress] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
        console.log(userResponse.data.user);

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

    if (!keyword) return addresses;

    return addresses.filter((item) =>
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
  }, [searchKeyword, addresses]);

  const showingEnd = filteredAddresses.length;

  const handleAddMail = ()=>{
    console.log(`Thêm địa chỉ`);
  }

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
  const handleOpenActionMenu = (event, item) => {
    event.preventDefault();

    setActionMenu({
      open: true,
      x: event.clientX,
      y: event.clientY,
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
    } catch (error) {
      console.error("Lỗi cập nhật địa chỉ mặc định:", error);
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
            text="Add Email"
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
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder="Tìm kiếm địa chỉ..."
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonIconText
                text="Show All Address"
                icon={MapPin}
                className="rounded-full!"
              />

              <ButtonIconText
                text="Show by name A-Z"
                icon={ArrowDownAZ}
                className="rounded-full!"
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
                        <input
                          type="checkbox"
                          aria-label="Select all addresses"
                          className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                        />
                        Status
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                      Company Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                      Company Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                      Notes
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredAddresses.length > 0 ? (
                    filteredAddresses.map((item) => (
                      <tr
                        key={item.addressId}
                        onContextMenu={
                          (event) => handleOpenActionMenu(event, item)
                        }
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              aria-label={`Select ${item.companyName}`}
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                            />
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
            <p className="text-sm text-gray-500">
              Showing {showingEnd > 0 ? 1 : 0}-{showingEnd} of{" "}
              {ADDRESS_TOTAL} addresses
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-600 transition hover:border-brand hover:text-brand"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-semibold transition ${
                    page === 1
                      ? "border-brand bg-brand text-subtle"
                      : "border-gray-300 bg-white text-gray-600 hover:border-brand hover:text-brand"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
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
              className="fixed z-50 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
              style={{
                top: actionMenu.y,
                left: actionMenu.x,
              }}
            >
              <button
                type="button"
                onClick={handleOpenConfirmDefault}
                disabled={actionMenu.address?.addressId === defaultAddressId}
                className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-brand/5 hover:text-brand disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white"
              >
                Đặt làm mặc định
              </button>
            </div>
          </>
        )}

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
      </SectionCard>
  );
};

export default AddressPage;
