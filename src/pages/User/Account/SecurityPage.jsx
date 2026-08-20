import { useState } from "react";
import { Info } from "lucide-react";
import { HandleButton } from "@/components/ui/Button/Button";
import { Divider } from "@/components/ui/Divider/Divider";
import PasswordInput from "@/components/ui/Input/PasswordInput";
import { SectionCard } from "@/components/ui/Section/Section";
import Switch from "@/components/ui/Switch/Switch";
import { useNotification } from "@/components/ui/Notification/NotificationContext";
import { userApi } from "@/api/userApi";
import { useAuth } from "@/components/auth/useAuth";
const SecurityPage = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { showNotification } = useNotification();
  const { user } = useAuth();

  const isActive =
    String(user?.status || "")
      .trim()
      .toLowerCase() === "active";

  // Xác thực mật khẩu
  const validatePassword = () => {
    if (!oldPassword.trim()) {
      showNotification(
        "error",
        "Lỗi",
        "Vui lòng nhập mật khẩu hiện tại."
      );
      return false;
    }

    if (newPassword.length < 8) {
      showNotification(
        "error",
        "Lỗi",
        "Mật khẩu mới phải có ít nhất 8 ký tự."
      );
      return false;
    }

    if (newPassword !== confirmPassword) {
      showNotification(
        "error",
        "Lỗi",
        "Xác nhận mật khẩu không khớp."
      );
      return false;
    }

    if (oldPassword === newPassword) {
      showNotification(
        "error",
        "Lỗi",
        "Mật khẩu mới phải khác mật khẩu hiện tại."
      );
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!isActive) {
      showNotification(
        "error",
        "Tài khoản chưa kích hoạt",
        "Bạn cần xác thực email hoặc số điện thoại " +
        "và thêm ít nhất một địa chỉ.",
      );

      return;
    }
    if (!validatePassword()) return;

    try {
      await userApi.changePassword({
        oldPassword,
        newPassword,
      });

      showNotification(
        "success",
        "Thành công",
        "Đổi mật khẩu thành công.",
      );

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      showNotification(
        "error",
        "Thất bại",
        error?.response?.data?.message ||
          "Không thể đổi mật khẩu.",
      );
    }
  };

  const canSubmit = isActive && oldPassword && newPassword && confirmPassword;

  const handleResetPasswordForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <>
        <SectionCard
            title="Change password"
            desc="Change user password."
            active={user?.status}
        >
          <div className="grid grid-cols-2 gap-x-3">
            {/* INPUT */}
            <InputPassword
              label="Mật Khẩu hiện tại"
              value={oldPassword || ""}
              onChange={(e)=> setOldPassword(e.target.value)}
              autoComplete="current-password"
            />
            <InputPassword
              label="Mật Khẩu mới"
              value={newPassword || ""}
              onChange={(e)=> setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
            <InputPassword
              label="Xác nhận mật khẩu"
              value={confirmPassword || ""}
              onChange={(e)=> setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          
          <div className="flex justify-between items-center">
            {/* HANDLE BUTTON */}
            <div className="flex items-center gap-3 mb-5">
              <HandleButton 
                disabled={!canSubmit}
                onClick={handleChangePassword}
                className={`bg-brand!`}
              >
                Save change
              </HandleButton>
              <HandleButton 
                onClick={handleResetPasswordForm}
                className={`border! border-danger! text-danger!`}
              >
                Default
              </HandleButton>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
               <div className="text-sm">
                <div className="flex gap-1 items-center">
                  <Info size={18}/>
                  <p className="font-semibold">Lưu ý</p>
                </div>
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    <li>Mật khẩu phải có tối thiểu 8 ký tự.</li>
                    <li>
                      Nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                    </li>
                    <li>Mật khẩu mới phải khác mật khẩu hiện tại.</li>
                  </ul>
              </div>
            </div>
          </div>
          {!isActive && (
            <div className="mb-5 rounded-xl border border-warning-border bg-warning-soft px-4 py-3 text-sm text-warning">
              Bạn cần xác thực email hoặc số điện thoại và thêm ít nhất
              một địa chỉ trước khi sử dụng tính năng đổi mật khẩu.
            </div>
          )}
        </SectionCard>

        <Divider/>

        <SectionCard
          title="Two-Factor Authentication"
          desc="Add an extra layer of security to your account."
        >
          <div className="space-y-5">
            {/* Email Authentication */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-text-default">
                    Email Authentication
                  </h4>

                  <span className="
                    inline-flex rounded-full border border-warning-border
                    bg-warning-soft px-2.5 py-1
                    text-xs font-semibold text-warning
                  ">
                    Sắp ra mắt
                  </span>
                </div>

                <p className="mt-1 text-sm text-text-muted">
                  Nhận mã xác thực qua địa chỉ email đã đăng ký.
                </p>
              </div>

              <Switch
                checked={false}
                disabled
              />
            </div>

            {/* SMS Authentication */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-text-default">
                    SMS Authentication
                  </h4>

                  <span className="
                    inline-flex rounded-full border border-warning-border
                    bg-warning-soft px-2.5 py-1
                    text-xs font-semibold text-warning
                  ">
                    Sắp ra mắt
                  </span>
                </div>

                <p className="mt-1 text-sm text-text-muted">
                  Nhận mã xác thực qua số điện thoại đã đăng ký.
                </p>
              </div>

              <Switch
                checked={false}
                disabled
              />
            </div>

            {/* Authenticator App */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-text-default">
                    Authenticator App
                  </h4>

                  <span className="
                    inline-flex rounded-full border border-warning-border
                    bg-warning-soft px-2.5 py-1
                    text-xs font-semibold text-warning
                  ">
                    Sắp ra mắt
                  </span>
                </div>

                <p className="mt-1 text-sm text-text-muted">
                  Sử dụng Google Authenticator hoặc Microsoft Authenticator
                  để tạo mã xác thực.
                </p>
              </div>

              <Switch
                checked={false}
                disabled
              />
            </div>
          </div>

          <div className="my-5">
            <div className="
              flex items-start gap-2 text-sm text-text-muted
            ">
              <Info
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <span className="font-semibold">
                  Lưu ý:
                </span>{" "}

                Các phương thức xác thực hai lớp đang được phát triển
                và hiện chưa thể kích hoạt.
              </div>
            </div>
          </div>
        </SectionCard>
    </>
  )
}

export default SecurityPage

const InputPassword = ({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
})=>{
  return(
    <PasswordInput 
      label={label}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder || label}
      autoComplete={autoComplete}
      containerClassName="mb-5"
      className="
        border-input! text-text-muted! focus:border-brand!  placeholder:text-transparent!
        "
      labelClassName="text-text-muted! peer-focus:text-brand!"
      buttonClassName="text-text-muted!"
    />
  )
}