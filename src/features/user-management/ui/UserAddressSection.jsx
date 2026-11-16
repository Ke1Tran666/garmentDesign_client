import { useState } from "react";
import { MapPin, Plus } from "lucide-react";

import { useNotification } from "@/app/providers/NotificationProvider";
import { StatusBadge } from "@/shared/ui/badge/StatusBadge";
import DataTable from "@/shared/ui/table/DataTable";

import { EMPTY_VALUE } from "../lib/userDetail";
import UserAddressCreateModal from "./UserAddressCreateModal";

const ADDRESS_COLUMNS = [
  { key: "status", title: "Trạng thái", className: "w-32 whitespace-nowrap" },
  { key: "companyName", title: "Tên công ty / Người nhận", className: "w-1/4" },
  { key: "address", title: "Địa chỉ chi tiết" },
  { key: "note", title: "Ghi chú", className: "w-1/4" },
];

const UserAddressSection = ({ user, canEditUser, onUserChange }) => {
  const { showNotification } = useNotification();
  const [createOpen, setCreateOpen] = useState(false);

  const addresses = Array.isArray(user?.addresses) ? user.addresses : [];

  const handleCreated = (createdAddress) => {
    const nextAddresses = [
      ...addresses.filter(
        (address) => address.addressId !== createdAddress.addressId,
      ),
      createdAddress,
    ];

    onUserChange?.({
      ...user,
      addresses: nextAddresses,
    });

    setCreateOpen(false);

    showNotification(
      "success",
      "Thêm địa chỉ thành công",
      "Địa chỉ đã được thêm cho người dùng.",
    );
  };

  return (
    <>
      <section>
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-text-strong">Địa chỉ</h2>

            {canEditUser && !user?.deletedAt && (
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                aria-label="Thêm địa chỉ"
                title="Thêm địa chỉ"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:border-brand hover:bg-brand-soft hover:text-brand"
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          <span className="text-xs text-text-muted">
            {addresses.length} địa chỉ
          </span>
        </div>

        <DataTable
          columns={ADDRESS_COLUMNS}
          data={addresses}
          minWidth="min-w-160"
          emptyText="Người dùng chưa có địa chỉ."
          renderRow={(address) => {
            const isDefault =
              user?.defaultAddress?.addressId === address.addressId;

            return (
              <tr
                key={address.addressId}
                className="text-xs transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
              >
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <StatusBadge
                    label={isDefault ? "Mặc định" : "Địa chỉ phụ"}
                    tone={isDefault ? "success" : "neutral"}
                  />
                </td>

                <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-text-muted">
                      <MapPin size={14} />
                    </span>
                    <span className="truncate">
                      {address.companyName || "Địa chỉ người dùng"}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3.5 leading-5 text-slate-700 dark:text-slate-300">
                  {address.address || EMPTY_VALUE}
                </td>

                <td className="px-4 py-3.5 leading-5 text-slate-500 dark:text-slate-400">
                  {address.note || EMPTY_VALUE}
                </td>
              </tr>
            );
          }}
        />
      </section>

      {createOpen && (
        <UserAddressCreateModal
          user={user}
          onClose={() => setCreateOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
};

export default UserAddressSection;
