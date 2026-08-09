import { useState } from "react";
import { Info } from "lucide-react";
import { HandleButton } from "@/components/ui/Button/Button";
import { Divider } from "@/components/ui/Divider/Divider";
import PasswordInput from "@/components/ui/Input/PasswordInput";
import { SectionCard } from "@/components/ui/Section/Section";
import Switch from "@/components/ui/Switch/Switch";
import { useNotification } from "@/components/ui/Notification/NotificationContext";
import { userApi } from "@/api/userApi";
const SecurityPage = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { showNotification } = useNotification();

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

  const canSubmit = oldPassword && newPassword && confirmPassword;

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
        >
          <div className="grid grid-cols-2 gap-x-3">
            {/* INPUT */}
            <InputPassword
              label="Mật Khẩu hiện tại"
              value={oldPassword || ""}
              onChange={(e)=> setOldPassword(e.target.value)}
            />
            <InputPassword
              label="Mật Khẩu mới"
              value={newPassword || ""}
              onChange={(e)=> setNewPassword(e.target.value)}
            />
          </div>
            <InputPassword
              label="Xác nhận mật khẩu"
              value={confirmPassword || ""}
              onChange={(e)=> setConfirmPassword(e.target.value)}
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
                <ul className="mt-1 list-disc pl-4 space-y-1">
                  <li>Mật khẩu phải có tối thiểu 8 ký tự.</li>
                  <li>Nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</li>
                  <li>Không sử dụng mật khẩu đã dùng trước đó.</li>
                </ul>
              </div>
            </div>
          </div>
        </SectionCard>

        <Divider/>

        <SectionCard
          title="Two-Factor Authentication"
          desc="Add an extra layer of security to your account."
        >
          <div className="space-y-5">

            {/* Email Authentication */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-text-default">
                  Email Authentication
                </h4>
                <p className="text-sm text-text-muted">
                  Receive verification codes via your registered email address.
                </p>
              </div>

              <Switch
                checked={false}
                disabled
              />
            </div>

            {/* SMS Authentication */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-text-default">
                  SMS Authentication
                </h4>
                <p className="text-sm text-text-muted">
                  Receive verification codes via your phone number.
                </p>
              </div>

              <Switch
                checked={false}
                disabled
              />
            </div>

            {/* Authenticator App */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-text-default">
                  Authenticator App
                </h4>
                <p className="text-sm text-text-muted">
                  Use Google Authenticator or Microsoft Authenticator to generate verification codes.
                </p>
              </div>

              <Switch
                checked={false}
                disabled
              />
            </div>

          </div>

          <div className="my-5">
            <div className="text-sm text-text-muted flex items-center gap-2">
              <div className="flex gap-1 items-center">
                  <Info size={18}/>
                  <span className="font-semibold">Lưu ý:</span>{" "}
              </div>
              <p>
                Sau khi thay đổi mật khẩu, bạn có thể bật xác thực hai lớp để tăng cường bảo mật cho tài khoản.
              </p>
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
})=>{
  return(
    <PasswordInput 
      label={label}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder || label}
      containerClassName="mb-5"
      className="
        border-input! text-text-muted! focus:border-brand!  placeholder:text-transparent!
        "
      labelClassName="text-text-muted! peer-focus:text-brand!"
      buttonClassName="text-text-muted!"
    />
  )
}