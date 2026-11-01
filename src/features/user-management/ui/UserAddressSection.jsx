import { useState } from "react";
import { MapPin, Plus } from "lucide-react";

import { useNotification } from "@/app/providers/NotificationProvider";

import { EMPTY_VALUE } from "../lib/userDetail";
import UserAddressCreateModal from "./UserAddressCreateModal";

const UserAddressSection = ({ user, canEditUser, onUserChange }) => {
  const { showNotification } = useNotification();
  const [createOpen, setCreateOpen] = useState(false);

  const addresses = Array.isArray(user.addresses) ? user.addresses : [];

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

            {canEditUser && !user.deletedAt && (
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

        {addresses.length > 0 ? (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.addressId}
                className="flex items-start gap-4 rounded-xl border border-border bg-surface-subtle p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-text-muted">
                  <MapPin size={17} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text-default">
                    {address.companyName || "Địa chỉ người dùng"}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-text-muted">
                    {address.address || EMPTY_VALUE}
                  </p>

                  {address.note && (
                    <p className="mt-1 text-xs text-text-subtle">
                      {address.note}
                    </p>
                  )}
                </div>

                {user.defaultAddress?.addressId === address.addressId && (
                  <span className="shrink-0 rounded-md bg-success-soft px-2 py-1 text-xs font-semibold text-success">
                    Mặc định
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-muted">
            Người dùng chưa có địa chỉ.
          </div>
        )}
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
