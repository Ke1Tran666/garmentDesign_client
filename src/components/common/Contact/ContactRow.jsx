import { ButtonIconText} from "@/components/ui/Button/Button";
import { Settings, Trash2, ShieldCheck, Unlink, Plus, Pencil, LockKeyhole } from "lucide-react";
import { useState } from "react";

const ProviderBadge = ({ provider }) => {
  const styles = {
    local: "bg-info-soft text-info",
    google: "bg-danger-soft text-danger",
    phone: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`
        rounded-full px-4 py-1.5 text-xs font-semibold
        ${styles[provider] || "bg-surface-muted text-text-muted"}
      `}
    >
      {provider
        ? provider.charAt(0).toUpperCase() + provider.slice(1)
        : "Unknown"}
    </span>
  );
};

const ActionButton = ({ icon: Icon, danger = false, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex h-10 w-10 items-center justify-center rounded-lg border transition
        ${
          danger
            ? "border-danger-border text-danger hover:bg-danger-soft"
            : "border-border text-text-muted hover:bg-surface-subtle"
        }
      `}
    >
      <Icon size={16} />
    </button>
  );
};

export const EmptyContact = ({
  message,
  buttonText,
  showForm,
  onAdd,
  children,
}) => {
  return (
    <div>
      <p className="mb-3 text-sm text-danger">{message}</p>

      <div className="overflow-visible">
        {!showForm ? (
          <ButtonIconText text={buttonText} onClick={onAdd} icon={Plus}/>
        ) : (
          <div className="origin-top space-y-3 animate-slideOutLeft">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

const SettingMenu = ({
  badgeStatus,
  onVerify,
  onRemove,
  onEdit,
  onDelete,
  showDelete = false,
  verificationDisabled = false,
  verificationDisabledText = "Sắp ra mắt",
}) => {
  const [open, setOpen] = useState(false);

  const linked = badgeStatus === "active";

  return (
    <div className="relative overflow-visible">
      <ActionButton
        icon={Settings}
        onClick={() => setOpen(!open)}
      />

      {open && (
        <div
          className="
            absolute right-0 top-12 z-50
            w-44 overflow-hidden
            rounded-xl border! border-border!
            bg-surface shadow-lg
          "
        >
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="
                flex w-full items-center gap-2
                px-4 py-3 text-left text-sm
                text-brand
                hover:bg-surface-subtle
              "
            >
              <Pencil size={16} />
              Cập nhật
            </button>
          )}

          {verificationDisabled ? (
            <button
              type="button"
              disabled
              className="
                flex w-full cursor-not-allowed
                items-center gap-2 px-4 py-3
                text-left text-sm text-text-muted
                opacity-60
              "
            >
              <LockKeyhole size={16} />
              {verificationDisabledText}
            </button>
          ) : linked ? (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onRemove?.();
              }}
              className="
                flex w-full items-center gap-2
                px-4 py-3 text-left text-sm
                text-danger
                hover:bg-danger-soft
              "
            >
              <Unlink size={16} />
              Bỏ xác thực
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onVerify?.();
              }}
              className="
                flex w-full items-center gap-2
                px-4 py-3 text-left text-sm
                text-brand
                hover:bg-surface-subtle
              "
            >
              <ShieldCheck size={16} />
              Xác thực
            </button>
          )}
          {showDelete && onDelete && (
            <>
              <div className="border-t border-border" />

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
                className="
                  flex w-full items-center gap-2
                  px-4 py-3 text-left text-sm
                  text-danger transition
                  hover:bg-danger-soft
                "
              >
                <Trash2 size={16} />
                Xóa số điện thoại
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export const ContactRow = ({
  value,
  provider,
  showProvider = false,
  isLocked = false,
  editable = false,
  inputType = "text",
  placeholder = "Enter value",
  badgeStatus = "inactive",
  showSetting = true,
  canDelete = true,
  showDeleteInSetting = false,
  onChange,
  onDelete,
  onVerify,
  onRemove,
  onEdit,
  verificationDisabled = false,
  verificationDisabledText = "Sắp ra mắt",
}) => {

  return (
    <div className="relative flex flex-wrap items-center gap-3 overflow-visible">
      {showProvider && provider && (<ProviderBadge provider={provider} />)}

      <input
        type={inputType}
        value={value || ""}
        onChange={editable ? onChange : undefined}
        readOnly={!editable || isLocked}
        placeholder={placeholder}
        className={`
          h-11 min-w-55 flex-1 rounded-lg border px-3 text-sm outline-none transition
          ${
            !editable || isLocked
              ? "border-input bg-surface-muted text-text-muted cursor-text select-text"
              : "border-input bg-surface text-text-default focus:border-brand focus:shadow-[0_0_0_3px_rgba(1,146,245,0.12)]"
          }
        `}
      />

      {showSetting && (
        <SettingMenu
          badgeStatus={badgeStatus}
          onVerify={onVerify}
          onRemove={onRemove}
          onEdit={onEdit}
          onDelete={onDelete}
          showDelete={showDeleteInSetting}
          verificationDisabled={verificationDisabled}
          verificationDisabledText={verificationDisabledText}
        />
      )}

      {canDelete && !showDeleteInSetting && (
        <ActionButton
          icon={Trash2}
          danger
          onClick={onDelete}
        />
      )}
    </div>
  );
};