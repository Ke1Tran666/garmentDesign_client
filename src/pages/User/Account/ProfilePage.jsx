import { useEffect, useState } from "react";
import BirthdayInput from "@/components/ui/Input/BirthdayInput";
import FloatingInput from "@/components/ui/Input/FloatingInput";
import { useBeforeUnload, useOutletContext } from "react-router-dom";
import { ContactRow, EmptyContact } from "@/components/common/Contact/ContactRow";
import { useNotification } from "@/components/ui/Notification/NotificationContext";
import OTPModal from "@/components/ui/OTP/OTPModal";
import defaultAvatar from "@/assets/images/avatar-default.jpg";
import { HandleButton } from "@/components/ui/Button/Button";
import { SectionCard } from "@/components/ui/Section/Section";
import { Divider } from "@/components/ui/Divider/Divider";
import RadioGroup from "@/components/ui/RadioGroup/RadioGroup";
import UploadBox from "@/components/ui/Upload/UploadBox";
import { userApi } from "@/api/userApi";
import { authProviderApi } from "@/api/authProviderApi";
import { authStorage } from "@/lib/authStorage";
import { authApi } from "@/api/authApi";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [birthday, setBirthday] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("Unknown");
  const [birthdayResetKey, setBirthdayResetKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarDeleted, setAvatarDeleted] = useState(false);

  const [originalProfile, setOriginalProfile] = useState(null);
  const { showNotification } = useNotification();

  const { searchKeyword = "" } = useOutletContext() || {};

  // snapshot
  const createProfileSnapshot = (data) => ({
    fullName: data?.user?.fullName || "",
    gender: data?.user?.gender || "Unknown",
    birthday: data?.user?.birthday || "",
    avatar: data?.user?.avatar || "",
  });

  const isDirty =
  originalProfile &&
  (
    fullName !== originalProfile.fullName ||
    gender !== originalProfile.gender ||
    birthday !== originalProfile.birthday ||
    avatarFile !== null ||
    avatarPreview !== (originalProfile.avatar || "")
  );

  useBeforeUnload(
    (event) => {
      if (isDirty) {
        event.preventDefault();

        // eslint disable next line no param reassign
        event.returnValue = "";
      }
    },
    { capture: true }
  );

  // Default
  const handleResetProfile = () => {
    if (!originalProfile) return;

    setFullName(originalProfile.fullName);
    setGender(originalProfile.gender);
    setBirthday(originalProfile.birthday);
    setBirthdayResetKey((prev) => prev + 1);  
    setAvatarFile(null);
    setAvatarPreview(originalProfile.avatar || "");

    showNotification(
      "success",
      "Thành công",
      "Thông tin cá nhân đã về trạng thái mặc định."
    );
  };

  // OTP
  const [otpModal, setOtpModal] = useState({
    open: false,
    type: "",
    target: "",
    mode: "",
  });

  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await userApi.getMe();
        const userData = data?.user;

        setProfile(data);
        setOriginalProfile(createProfileSnapshot(data));

        setFullName(userData?.fullName || "");
        setGender(userData?.gender || "Unknown");
        setBirthday(userData?.birthday || "");
        setAvatarPreview(userData?.avatar || "");
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Không thể tải thông tin người dùng"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const user = profile?.user;
  const authProviders = profile?.authProviders || [];
  const emails = authProviders.filter((item) => item.email);
  const phones = authProviders.filter((item) => item.phone);

  const phoneSectionStatus = phones.some((item) => item.phoneVerifiedAt)
  ? "active"
  : "inactive";

  const emailSectionStatus = emails.some((item) => item.emailVerifiedAt)
    ? "active"
    : "inactive";

  // Tìm kiếm
  const isSearching = (keywords) => {
    const value = searchKeyword.trim().toLowerCase();
    if (!value) return false;

    return keywords.some((keyword) =>
      keyword.toLowerCase().includes(value) ||
      value.includes(keyword.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="px-6 py-6 text-sm font-medium text-text-muted">
        Đang tải thông tin người dùng...
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-6 text-sm font-medium text-danger">
        {error}
      </div>
    );
  }

  // Gỡ liên kết
  const handleRemoveProvider = async (item) => {
    try {
      if (authProviders.length <= 1) {
        showNotification(
          "error",
          "Không thể gỡ bỏ",
          "Tài khoản phải có ít nhất 1 phương thức đăng nhập để duy trì quyền truy cập."
        );
        return;
      }

      const confirmRemove = window.confirm(
        `Bạn có chắc muốn hủy liên kết ${
          item.email || item.phone
        } không?`
      );

      if (!confirmRemove) return;

      await authProviderApi.remove(item.id)

      showNotification(
        "success",
        "Thành công",
        "Đã hủy liên kết tài khoản."
      );

      await reloadProfile();
    } catch (error) {
      showNotification(
        "error",
        "Thất bại",
        error.response?.data?.message ||
          "Không thể hủy liên kết tài khoản."
      );
    }
  };

  // Mở OTP Modal
  const openPhoneVerify = async (phone, mode = "existing") => {
    try {
      const targetPhone = phone.trim();

      if (!targetPhone) {
        showNotification("warning", "Thiếu số điện thoại", "Vui lòng nhập số điện thoại trước.");
        return;
      }

      await authApi.sendPhoneOtp(targetPhone);

      setOtpModal({
        open: true,
        type: "phone",
        target: targetPhone,
        mode,
      });

      showNotification("success", "Đã gửi OTP", "Mã OTP đã được gửi đến số điện thoại.");
    } catch (error) {
      showNotification("error", "Gửi OTP thất bại", error.response?.data?.message || "Không thể gửi OTP.");
    }
  };

  const openEmailVerify = async (email, mode = "existing") => {
    try {
      const targetEmail = email.trim();

      if (!targetEmail) {
        showNotification("warning", "Thiếu email", "Vui lòng nhập email trước.");
        return;
      }

      await authApi.sendEmailOtp(targetEmail);

      setOtpModal({
        open: true,
        type: "email",
        target: targetEmail,
        mode,
      });

      showNotification("success", "Đã gửi OTP", "Mã OTP đã được gửi đến email.");
    } catch (error) {
      showNotification("error", "Gửi OTP thất bại", error.response?.data?.message || "Không thể gửi OTP.");
    }
  };

  // AVATAR
  const handleUploadAvatar = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setAvatarDeleted(false);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleDeleteAvatar = () => {
    setAvatarFile(null);
    setAvatarDeleted(true);
    setAvatarPreview(defaultAvatar);
  };

  // HANDLE SAVE PROFILE
  const handleSaveProfile = async () => {
    try {

      const payload = {
        fullName,
        gender,
        birthday,
      };

      await userApi.update(payload);

      if (avatarDeleted) {
        await userApi.removeAvatar();
      }
      else if (avatarFile) {
        const formData = new FormData();

        formData.append("file", avatarFile);

        await userApi.uploadAvatar(formData);
      }

      await reloadProfile();

      setAvatarFile(null);

      showNotification(
        "success",
        "Thành công",
        "Thông tin cá nhân đã được cập nhật."
      );

    } catch (error) {

      showNotification(
        "error",
        "Thất bại",
        error.response?.data?.message ||
        "Không thể cập nhật thông tin."
      );
    }
  };

  // Status email
  const getEmailStatus = (provider) =>
    provider?.emailVerifiedAt ? "active" : "inactive";

  // Status phone
  const getPhoneStatus = (provider) =>
    provider?.phoneVerifiedAt ? "active" : "inactive";

  // OTP
  const reloadProfile = async () => {
    const idUser = authStorage.getUserId();

    const data = await userApi.getMe(idUser);
    const userData = data?.user;

    setProfile(data);
    setOriginalProfile(createProfileSnapshot(data));

    setFullName(userData?.fullName || "");
    setGender(userData?.gender || "Unknown");
    setBirthday(userData?.birthday || "");
    setAvatarPreview(userData?.avatar || "");
  };

  return (
    <>
      <SectionCard
        title="Personal"
        desc="Edit your name and profile picture"
        active={user?.status || "active"}
        highlight={isSearching(["personal", "profile", "birthday", "gender"])}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Input fullname */}
          <Input
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          {/* Input user code */}
          <Input
            label="User code"
            value={user?.userCode}
            type="text"
            readOnly
          />

          <div className="md:col-span-2">
            <BirthdayField 
              birthday={birthday} 
              setBirthday={setBirthday}
              birthdayResetKey={birthdayResetKey} />
          </div>

          <div className="md:col-span-2">
            <RadioGroup
              label="Gender"
              name="gender"
              value={gender}
              onChange={setGender}
              options={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
                { label: "Unknown", value: "Unknown" },
              ]}
            />
          </div>
        </div>

        {/* AVATAR */}
        <UploadBox
          variant="avatar"
          preview={avatarPreview || user?.avatar}
          fallback={defaultAvatar}
          uploadText="Upload picture"
          deleteText="Delete picture"
          onUpload={handleUploadAvatar}
          onDelete={handleDeleteAvatar}
          className={`mt-4`}
        />
      </SectionCard>

      <Divider />

      {/* PHONE */}
      <SectionCard
        title="Link phone number"
        desc="Link your phone number to verify your account for the best support."
        active={phoneSectionStatus}
        highlight={isSearching(["phone", "number", "sdt", "số điện thoại"])}
      >
        <div className="space-y-3">
          {phones.length > 0 ? (
            phones.map((item) => (
              <ContactRow
                key={item.id}
                value={item.phone}
                provider={item.provider}
                showProvider
                isLocked={item.provider === "phone"}
                badgeText={getPhoneStatus(item)}
                badgeStatus={getPhoneStatus(item)}
                showSetting
                canDelete={item.provider !== "phone"}
                onRemove={() => handleRemoveProvider(item)}
                onVerify={() => openPhoneVerify(item.phone)}
              />
            ))
          ) : (
            <EmptyContact
              message="Chưa liên kết số điện thoại."
              buttonText="Add phone number"
              showForm={showPhoneInput}
              onAdd={() => setShowPhoneInput(true)}
            >
            <ContactRow
              value={newPhone}
              editable
              inputType="tel"
              placeholder="Nhập số điện thoại"
              badgeText="inactive"
              badgeStatus="inactive"
              showSetting
              canDelete
              onChange={(e) => setNewPhone(e.target.value)}
              onVerify={() => openPhoneVerify(newPhone, "new")}
              onDelete={() => {
                setNewPhone("");
                setShowPhoneInput(false);
              }}
            />
            </EmptyContact>
          )}
        </div>
      </SectionCard>

      <Divider />

      {/* EMAIL */}
      <SectionCard
        title="Associated email"
        desc="Manage email accounts linked to your profile."
        active={emailSectionStatus}
        highlight={isSearching(["email", "mail", "gmail", "google", "local"])}
      >
        <div className="space-y-3">
          {emails.length > 0 ? (
            emails.map((item) => (
              <ContactRow
                key={item.id}
                value={item.email}
                provider={item.provider}
                showProvider
                isLocked={item.provider === "local" || item.provider === "google"}
                badgeText={getEmailStatus(item)}
                badgeStatus={getEmailStatus(item)}
                showSetting
                canDelete={item.provider === "local" && !item.emailVerifiedAt}
                onRemove={() => handleRemoveProvider(item)}
                onVerify={() => openEmailVerify(item.email)}
              />
            ))
          ) : (
            <EmptyContact
              message="Chưa liên kết email."
              buttonText="Add Email"
              showForm={showEmailInput}
              onAdd={() => setShowEmailInput(true)}
            >
              <ContactRow
                value={newEmail}
                editable
                inputType="email"
                placeholder="Nhập email"
                badgeText="inactive"
                badgeStatus="inactive"
                showSetting
                canDelete
                onChange={(e) => setNewEmail(e.target.value)}
                onVerify={() => openEmailVerify(newEmail, "new")}
                onDelete={() => {
                  setNewEmail("");
                  setShowEmailInput(false);
                }}
              />
            </EmptyContact>
          )}
        </div>
      </SectionCard>

      <Divider />

      <div className="flex justify-end gap-3">
        <HandleButton
          onClick={handleResetProfile}
          className={`bg-surface-muted! text-text-muted!`}
        >
          Default
        </HandleButton>

        <HandleButton
          onClick={handleSaveProfile}
          className={`bg-brand!`}
        >
          Save changes
        </HandleButton>
      </div>
      
      <OTPModal
        open={otpModal.open}
        target={otpModal.target}
        loading={otpLoading}
        title={
          otpModal.type === "phone"
            ? "Xác thực số điện thoại"
            : "Xác thực email"
        }
        desc={
          otpModal.type === "phone"
            ? "Nhập mã OTP 6 số đã gửi đến số điện thoại của bạn."
            : "Nhập mã OTP 6 số đã gửi đến email của bạn."
        }
        onClose={() =>
          setOtpModal({
            open: false,
            type: "",
            target: "",
            mode: "",
          })
        }
        onVerify={async (otpCode) => {
          try {
            if (!otpCode) {
              showNotification("warning", "OTP chưa hợp lệ", "Vui lòng nhập đủ 6 số OTP.");
              return;
            }

            setOtpLoading(true);

            const idUser = authStorage.getUserId();

            if (otpModal.type === "phone") {
              await authApi.verifyPhoneOtp({
                idUser,
                phone: otpModal.target,
                otp: otpCode,
                mode: otpModal.mode,
              });
            }

            if (otpModal.type === "email") {
              await authApi.verifyEmailOtp({
                idUser,
                email: otpModal.target,
                otp: otpCode,
                mode: otpModal.mode,
              });
            }

            showNotification(
              "success",
              "Xác thực thành công",
              otpModal.type === "phone"
                ? "Số điện thoại đã được xác thực."
                : "Email đã được xác thực."
            );

            setOtpModal({
              open: false,
              type: "",
              target: "",
              mode: "",
            });

            await reloadProfile();
          } catch (error) {
            showNotification(
              "error",
              "OTP không đúng",
              error.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn."
            );
          } finally {
            setOtpLoading(false);
          }
        }}
        onResend={async () => {
          try {
            if (otpModal.type === "phone") {
              await authApi.sendPhoneOtp(
                otpModal.target,
              );
            }

            if (otpModal.type === "email") {
              await authApi.sendEmailOtp(
                otpModal.target,
              );
            }

            showNotification("success", "Đã gửi lại OTP", "Vui lòng kiểm tra mã mới.");
          } catch (error) {
            showNotification(
              "error",
              "Gửi lại OTP thất bại",
              error.response?.data?.message || "Vui lòng thử lại."
            );
          }
        }}
      />
    </>
  );
};

const Input = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly = false,
}) => {
  const hasValue = String(value || "").trim() !== "";

  return (
    <FloatingInput
      type={type}
      label={label}
      value={value || ""}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder || label}
      containerClassName="w-full"
      className={`
        border-input!
        ${
          readOnly
            ? "bg-surface-muted! text-text-muted! cursor-not-allowed!"
            : "bg-surface! text-text-default!"
        }
        placeholder:text-transparent!
        focus:border-brand!
        focus:shadow-[0_0_0_3px_rgba(1,146,245,0.12)]!
      `}
      labelClassName={`
        text-text-muted!
        peer-focus:text-brand!
        ${hasValue ? "top-2! translate-y-0! text-xs! text-brand!" : ""}
      `}
    />
  );
};

const BirthdayField = ({ birthday, setBirthday, birthdayResetKey }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-text-default">
        Birthday
      </label>

      <BirthdayInput
        key={birthdayResetKey}
        value={birthday}
        onChange={setBirthday}
        inputClassName="
          border-input!
          bg-surface!
          text-text-default!
          placeholder:text-text-subtle!
          focus:border-brand!
          focus:shadow-[0_0_0_3px_rgba(1,146,245,0.12)]!
        "
        calendarButtonClassName="
          border-input!
          bg-surface!
          text-text-muted!
          hover:border-brand!
          hover:bg-surface-subtle!
        "
        popupClassName="border-border! translate-y-24!"
      />
    </div>
  );
};

export default ProfilePage;