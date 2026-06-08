import { useMemo, useState } from "react";
import { Plus, X, MapPin, Pencil, Trash2 } from "lucide-react";
import FloatingInput from "@/components/ui/Form/FloatingInput";

const ITEMS_PER_PAGE = 10;

const AddressPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    note: "",
    status: "active",
  });

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      status: "active",
      companyName: "HoaTran maymac",
      companyAddress: "123 Nguyễn Văn Cừ, Quận 5, TP.HCM",
    },
    {
      id: 2,
      status: "inactive",
      companyName: "Garment Design Studio",
      companyAddress: "45 Lê Văn Sỹ, Quận 3, TP.HCM",
    },
  ]);

  const resetForm = () => {
    setFormData({
      companyName: "",
      companyAddress: "",
      status: "active",
    });

    setShowForm(false);
  };

  const handleAddAddress = () => {
    if (!formData.companyAddress.trim()) return;

    const newItem = {
      id: Date.now(),
      status: formData.status,
      companyName: formData.companyName,
      companyAddress: formData.companyAddress,
    };

    setAddresses([newItem, ...addresses]);
    setCurrentPage(1);
    resetForm();
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter((item) => item.id !== id));
  };

  const filteredAddresses = useMemo(() => {
    return addresses.filter((item) => {
      const keyword = searchValue.toLowerCase().trim();

      const matchStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchSearch =
        !keyword ||
        item.companyName.toLowerCase().includes(keyword) ||
        item.companyAddress.toLowerCase().includes(keyword);

      return matchStatus && matchSearch;
    });
  }, [addresses, statusFilter, searchValue]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAddresses.length / ITEMS_PER_PAGE)
  );

  const currentAddresses = filteredAddresses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = () => {
    setCurrentPage(1);
  };

  return (
    <>
        <div className="flex flex-col h-full px-6 py-6">
        {/* Top action */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            {!showForm && (
            <button
                type="button"
                onClick={() => setShowForm(true)}
                className="
                inline-flex items-center gap-2
                rounded-lg border! border-gray-300!
                bg-white px-4 py-2
                text-sm font-semibold text-gray-700
                transition-all duration-300
                hover:border-brand! hover:bg-gray-50 hover:text-brand
                "
            >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-brand text-brand">
                <Plus size={13} strokeWidth={3} />
                </span>
                Add Address
            </button>
            )}
        </div>

        {/* Add form */}
        {showForm && (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div className="mb-5 flex items-center justify-between">
                <div>
                <h3 className="text-base font-semibold text-gray-900">
                    Add new address
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    Fill in address information below.
                </p>
                </div>

                <button
                type="button"
                onClick={resetForm}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                >
                <X size={18} />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FloatingInput
                label="Company name"
                value={formData.companyName}
                onChange={(e) =>
                    setFormData({
                    ...formData,
                    companyName: e.target.value,
                    })
                }
                containerClassName="w-full"
                className="
                    border-gray-300!
                    bg-white!
                    text-gray-800!
                    placeholder:text-transparent!
                    focus:border-brand!
                    focus:shadow-[0_0_0_3px_rgba(1,146,245,0.12)]!
                "
                />

                <FloatingInput
                label="Company address"
                value={formData.companyAddress}
                onChange={(e) =>
                    setFormData({
                    ...formData,
                    companyAddress: e.target.value,
                    })
                }
                containerClassName="w-full"
                className="
                    border-gray-300!
                    bg-white!
                    text-gray-800!
                    placeholder:text-transparent!
                    focus:border-brand!
                    focus:shadow-[0_0_0_3px_rgba(1,146,245,0.12)]!
                "
                />

                <div className="md:col-span-2">
                    <FloatingInput
                        label="Note"
                        value={formData.note}
                        onChange={(e) =>
                        setFormData({
                            ...formData,
                            note: e.target.value,
                        })
                        }
                        containerClassName="w-full"
                        className="
                        border-gray-300!
                        bg-white!
                        text-gray-800!
                        placeholder:text-transparent!
                        focus:border-brand!
                        focus:shadow-[0_0_0_3px_rgba(1,146,245,0.12)]!
                        "
                    />
                </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
                <button
                type="button"
                onClick={resetForm}
                className="
                    rounded-xl border border-gray-200
                    px-5 py-2.5
                    text-sm font-semibold text-gray-600
                    transition hover:bg-gray-50
                "
                >
                Cancel
                </button>

                <button
                type="button"
                onClick={handleAddAddress}
                className="
                    rounded-xl bg-brand!
                    px-5 py-2.5
                    text-sm font-semibold text-white
                    shadow-sm transition hover:opacity-90
                "
                >
                Save address
                </button>
            </div>
            </div>
        )}

            <div className="flex justify-center items-center gap-1.5 mb-6">
                {/* Statistics */}
                <div className="max-w-xs">
                    <AddressInfoCard
                        icon={MapPin}
                        label="Addresses"
                        value={addresses.length}
                    />
                </div>

                {/* Filter */}
                <div className="rounded-2xl border border-gray-200 bg-white p-3 flex-1">
                    <div className="flex flex-wrap items-center gap-4">
                    {/* Status Filter */}
                    <div className="flex items-center gap-5 shrink-0">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                            type="radio"
                            name="statusFilter"
                            value="active"
                            checked={statusFilter === "active"}
                            onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                            }}
                        />
                        Active
                        </label>

                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                            type="radio"
                            name="statusFilter"
                            value="inactive"
                            checked={statusFilter === "inactive"}
                            onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                            }}
                        />
                        Inactive
                        </label>

                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                            type="radio"
                            name="statusFilter"
                            value="all"
                            checked={statusFilter === "all"}
                            onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                            }}
                        />
                        All
                        </label>
                    </div>

                    {/* Search */}
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Search address..."
                        className="
                        flex-1 min-w-75
                        rounded-xl border border-gray-300
                        px-4 py-3
                        text-sm text-gray-700
                        outline-none
                        transition
                        focus:border-brand
                        focus:shadow-[0_0_0_3px_rgba(1,146,245,0.12)]
                        "
                    />

                    {/* Button */}
                    <button
                        type="button"
                        onClick={handleSearch}
                        className="
                        rounded-xl bg-brand!
                        px-6 py-3
                        text-sm font-semibold text-white
                        transition hover:opacity-90
                        "
                    >
                        Tìm kiếm
                    </button>
                    </div>
                </div>
            </div>

        {/* Table — flex-1 lets this grow, overflow-auto enables inner scroll */}
        <div className="flex-1 overflow-auto min-h-0">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-5 py-4">
                <h3 className="text-base font-semibold text-gray-900">
                    Address list
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    All addresses related to your account.
                </p>
                </div>

                <div className="overflow-x-auto">
                <table className="w-full min-w-180 text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                    <tr>
                        <th className="px-5 py-3 text-left font-semibold">
                        Status
                        </th>

                        <th className="px-5 py-3 text-left font-semibold">
                        Company Name
                        </th>

                        <th className="px-5 py-3 text-left font-semibold">
                        Address
                        </th>

                        <th className="px-5 py-3 text-left font-semibold">
                        Note
                        </th>

                        <th className="px-5 py-3 text-center font-semibold">
                        Action
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                        {currentAddresses.map((item) => (
                            <tr
                            key={item.id}
                            className="border-t border-gray-200 hover:bg-gray-50"
                            >
                            <td className="px-5 py-4">
                                <span
                                className={`
                                    inline-flex rounded-full px-3 py-1
                                    text-xs font-semibold capitalize
                                    ${
                                    item.status === "active"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                    }
                                `}
                                >
                                {item.status}
                                </span>
                            </td>

                            <td className="px-5 py-4 font-medium text-gray-800">
                                {item.companyName || "-"}
                            </td>

                            <td className="px-5 py-4 text-gray-600">
                                {item.companyAddress || "-"}
                            </td>

                            <td className="px-5 py-4 text-gray-600">
                                {item.note || "-"}
                            </td>

                            <td className="px-5 py-4">
                                <div className="flex justify-center gap-2">
                                    <button
                                    type="button"
                                    className="
                                        flex h-9 w-9 items-center justify-center
                                        rounded-lg border border-gray-200
                                        text-gray-500 transition
                                        hover:bg-gray-50 hover:text-brand
                                    "
                                    >
                                    <Pencil size={15} />
                                    </button>

                                    <button
                                    type="button"
                                    onClick={() => handleDeleteAddress(item.id)}
                                    className="
                                        flex h-9 w-9 items-center justify-center
                                        rounded-lg border border-red-200
                                        text-red-500 transition
                                        hover:bg-red-50
                                    "
                                    >
                                    <Trash2 size={15} />
                                    </button>
                                </div>
                            </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>{/* end flex-1 scroll area */}
        </div>
        {/* Bottom Info — always pinned at bottom */}
        <div className="mt-4 flex items-center justify-between px-2 pt-3 border-t border-gray-100 bg-white shrink-0">
            <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">
                Chú ý:
                </span>{" "}
                Địa chỉ Active sẽ được sử dụng mặc định khi tạo đơn hàng.
            </p>

            <div className="flex items-center gap-4">
                <button
                type="button"
                disabled={currentPage === 1}
                className="
                    text-gray-400
                    transition
                    hover:text-gray-700
                    disabled:opacity-40
                "
                >
                {"<<"}
                </button>

                <span className="text-sm font-semibold text-gray-700">
                {currentPage}/{totalPages}
                </span>

                <button
                type="button"
                disabled={currentPage === totalPages}
                className="
                    text-gray-400
                    transition
                    hover:text-gray-700
                    disabled:opacity-40
                "
                >
                {">>"}
                </button>
            </div>
        </div>
    </>
  );
};

export default AddressPage;

const AddressInfoCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-2">
      <div className="flex items-center gap-3 ">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Icon size={22} />
        </div>

        <div>
          <p className="text-sm text-gray-500">
            {label}
          </p>

          <h4 className="text-2xl font-bold text-gray-900">
            {value}
          </h4>
        </div>
      </div>
    </div>
  );
};