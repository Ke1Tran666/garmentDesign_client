import { useEffect, useState } from "react";
import BirthdayInput from "@/components/ui/Input/BirthdayInput";
import FloatingInput from "@/components/ui/Input/FloatingInput";
import { useBeforeUnload, useOutletContext } from "react-router-dom";
import { ContactRow } from "@/components/common/Contact/ContactRow";
import { useNotification } from "@/components/ui/Notification/NotificationContext";
import defaultAvatar from "@/assets/images/avatar-default.jpg";
import { HandleButton } from "@/components/ui/Button/Button";
import { SectionCard } from "@/components/ui/Section/Section";
import { Divider } from "@/components/ui/Divider/Divider";
import RadioGroup from "@/components/ui/RadioGroup/RadioGroup";
import UploadBox from "@/components/ui/Upload/UploadBox";
import { userApi } from "@/api/userApi";
import { useAuth } from "@/components/auth/useAuth";
import OTPModal from "@/components/ui/OTP/OTPModal";
import ConfirmModal from "@/components/ui/Modal/ConfirmModal";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [birthday, setBirthday] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("Unknown");
  const [birthdayResetKey, setBirthdayResetKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarDeleted, setAvatarDeleted] = useState(false);
  const { refreshSession } = useAuth();

  const [originalProfile, setOriginalProfile] = useState(null);
  const { showNotification } = useNotification();

  const { searchKeyword = "" } = useOutletContext() || {};

  const [emailOtpOpen, setEmailOtpOpen] = useState(false);
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [emailOtpTarget, setEmailOtpTarget] = useState("");
  const [emailOtpModalKey, setEmailOtpModalKey] = useState(0);

  const [
    emailVerificationToRemove, setEmailVerificationToRemove
  ] = useState(null);

  const [
    removingEmailVerification, setRemovingEmailVerification
  ] = useState(false);

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
      await refreshSession();

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
    const data = await userApi.getMe();
    const userData = data?.user;

    setProfile(data);
    setOriginalProfile(createProfileSnapshot(data));

    setFullName(userData?.fullName || "");
    setGender(userData?.gender || "Unknown");
    setBirthday(userData?.birthday || "");
    setAvatarPreview(userData?.avatar || "");
  };

  const handleSendEmailOtp = async (email) => {
    try {
      setEmailOtpLoading(true);

      const result =
        await userApi.sendEmailVerificationOtp();

      setEmailOtpTarget(email);
      setEmailOtpOpen(true);

      showNotification(
        "success",
        "Đã gửi OTP",
        result?.message ||
          "Mã OTP đã được gửi đến email của bạn.",
      );
    } catch (error) {
      showNotification(
        "error",
        "Không thể gửi OTP",
        error.response?.data?.message ||
          "Không thể gửi mã xác thực.",
      );
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async (otp) => {
    if (!otp) {
      showNotification(
        "error",
        "Thiếu mã OTP",
        "Vui lòng nhập đầy đủ mã OTP.",
      );

      return;
    }

    try {
      setEmailOtpLoading(true);

      const result =
        await userApi.verifyEmailVerificationOtp(otp);

      setEmailOtpOpen(false);
      setEmailOtpModalKey((value) => value + 1);

      await reloadProfile();
      await refreshSession();

      showNotification(
        "success",
        "Xác thực thành công",
        result?.message ||
          "Email đã được xác thực.",
      );
    } catch (error) {
      showNotification(
        "error",
        "Xác thực thất bại",
        error.response?.data?.message ||
          "Mã OTP không hợp lệ.",
      );
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleRemoveEmailVerification = async () => {
    try {
      setRemovingEmailVerification(true);

      const result =
        await userApi.removeEmailVerification();

      setEmailVerificationToRemove(null);

      await reloadProfile();
      await refreshSession();

      showNotification(
        "success",
        "Đã bỏ xác thực",
        result?.message ||
          "Email đã được chuyển về trạng thái chưa xác thực.",
      );
    } catch (error) {
      showNotification(
        "error",
        "Không thể bỏ xác thực",
        error.response?.data?.message ||
          "Không thể bỏ xác thực email.",
      );
    } finally {
      setRemovingEmailVerification(false);
    }
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
        desc="Manage phone numbers linked to your account."
        active={phoneSectionStatus}
        highlight={isSearching([
          "phone",
          "number",
          "sdt",
          "số điện thoại",
        ])}
      >
        <div className="space-y-3">
          {phones.length > 0 ? (
            phones.map((item) => (
              <ContactRow
                key={item.id}
                value={item.phone}
                provider={item.provider}
                showProvider
                isLocked
                badgeText={getPhoneStatus(item)}
                badgeStatus={getPhoneStatus(item)}
                showSetting={false}
                canDelete={false}
              />
            ))
          ) : (
            <p className="text-sm text-text-muted">
              Chưa liên kết số điện thoại.
              Chức năng liên kết đang được hoàn thiện.
            </p>
          )}
        </div>
      </SectionCard>

      <Divider />

      {/* EMAIL */}
      <SectionCard
        title="Associated email"
        desc="Manage email accounts linked to your profile."
        active={emailSectionStatus}
        highlight={isSearching([
          "email",
          "mail",
          "gmail",
          "google",
          "local",
        ])}
      >
        <div className="space-y-3">
          {emails.length > 0 ? (
            emails.map((item) => (
              <ContactRow
                key={item.id}
                value={item.email}
                provider={item.provider}
                showProvider
                isLocked
                badgeText={getEmailStatus(item)}
                badgeStatus={getEmailStatus(item)}
                showSetting={
                  item.provider?.toLowerCase() === "local"
                }
                canDelete={false}
                onVerify={() =>
                  handleSendEmailOtp(item.email)
                }
                onRemove={() =>
                  setEmailVerificationToRemove(item)
                }
              />
            ))
          ) : (
            <p className="text-sm text-text-muted">
              Chưa liên kết email.
              Chức năng liên kết đang được hoàn thiện.
            </p>
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
        key={emailOtpModalKey}
        open={emailOtpOpen}
        title="Xác thực email"
        desc="Nhập mã OTP 6 số đã được gửi đến email của bạn. Mã có hiệu lực trong 3 phút."
        target={emailOtpTarget}
        loading={emailOtpLoading}
        onClose={() => setEmailOtpOpen(false)}
        onVerify={handleVerifyEmailOtp}
        onResend={() =>
          handleSendEmailOtp(emailOtpTarget)
        }
      />

      <ConfirmModal
        open={Boolean(emailVerificationToRemove)}
        title="Bỏ xác thực email"
        confirmText="Bỏ xác thực"
        loadingText="Đang xử lý..."
        confirmVariant="danger"
        submitting={removingEmailVerification}
        onClose={() => {
          if (!removingEmailVerification) {
            setEmailVerificationToRemove(null);
          }
        }}
        onConfirm={handleRemoveEmailVerification}
      >
        Bạn có chắc chắn muốn bỏ xác thực email{" "}
        <span className="font-semibold text-text-strong">
          {emailVerificationToRemove?.email}
        </span>
        ?

        <p className="mt-2 text-danger">
          Một số tính năng có thể bị khóa và tài khoản có thể
          chuyển về trạng thái pending.
        </p>
      </ConfirmModal>
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