import { ButtonIconText} from "@/components/ui/Button/Button";
import { Settings, Trash2, ShieldCheck, Unlink, Plus } from "lucide-react";
import { useState } from "react";

const ProviderBadge = ({ provider }) => {
  const styles = {
    local: "bg-blue-100 text-blue-700",
    google: "bg-red-100 text-red-700",
    phone: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`
        rounded-full px-4 py-1.5 text-xs font-semibold
        ${styles[provider] || "bg-gray-100 text-gray-600"}
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
            ? "border-red-200 text-red-500 hover:bg-red-50"
            : "border-gray-200 text-gray-500 hover:bg-gray-50"
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
      <p className="mb-3 text-sm text-red-500">{message}</p>

      <div className="overflow-visible">
        {!showForm ? (
          <ButtonIconText text={buttonText} onClick={onAdd} Icon={Plus}/>
        ) : (
          <div className="origin-top space-y-3 animate-slideOutLeft">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

const SettingMenu = ({ badgeStatus, onVerify, onRemove }) => {
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
            w-40 overflow-hidden
            rounded-xl border! border-gray-200!
            bg-white shadow-lg
          "
        >
          {linked ? (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onRemove?.();
              }}
              className="
                flex w-full items-center gap-2
                px-4 py-3 text-left text-sm
                text-red-500
                hover:bg-red-50
              "
            >
              <Unlink size={16} />
              Gỡ bỏ
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
                hover:bg-gray-50
              "
            >
              <ShieldCheck size={16} />
              Xác thực
            </button>
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
  onChange,
  onDelete,
  onVerify,
  onRemove,
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
              ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
              : "border-gray-300 bg-white text-gray-800 focus:border-brand focus:shadow-[0_0_0_3px_rgba(1,146,245,0.12)]"
          }
        `}
      />

      {showSetting && (
        <SettingMenu
          badgeStatus={badgeStatus}
          onVerify={onVerify}
          onRemove={onRemove}
        />
      )}

      {canDelete && (
        <ActionButton icon={Trash2} danger onClick={onDelete} />
      )}
    </div>
  );
};