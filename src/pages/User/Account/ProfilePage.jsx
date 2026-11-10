import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import { Link, useBeforeUnload, useOutletContext } from "react-router-dom";

import { useNotification } from "@/app/providers/NotificationProvider";
import { userApi } from "@/entities/user/api/userApi";
import { ContactRow, EmptyContact } from "@/entities/user/ui/ContactRow";
import { useAuth } from "@/features/auth/model/useAuth";
import OTPModal from "@/features/auth/ui/OTPModal";
import { getInitials } from "@/shared/lib/avatarUtils";
import { StatusBadge } from "@/shared/ui/badge/StatusBadge";
import PageHeader from "@/shared/ui/heading/PageHeader";
import BirthdayInput from "@/shared/ui/input/BirthdayInput";
import FloatingInput from "@/shared/ui/input/FloatingInput";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import RadioGroup from "@/shared/ui/radio-group/RadioGroup";
import { PortalSectionCard } from "@/shared/ui/section/Section";
import { DetailPageSkeleton } from "@/shared/ui/skeleton";
import AvatarPicker from "@/shared/ui/upload/AvatarPicker";

const getProfilePhone = (data) => {
  const provider = (data?.authProviders || []).find(
    (item) => item.provider?.toLowerCase() === "phone",
  );

  return provider?.phone || "";
};

const getAccountStatusMeta = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "active") {
    return { label: "Hoạt động", tone: "success" };
  }
  if (normalized === "pending") {
    return { label: "Chờ kích hoạt", tone: "warning" };
  }
  if (normalized === "banned") {
    return { label: "Bị khóa", tone: "danger" };
  }
  return { label: status || "Không xác định", tone: "neutral" };
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [birthday, setBirthday] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("Unknown");
  const [phone, setPhone] = useState("");
  const [phoneEditing, setPhoneEditing] = useState(false);
  const [phoneToDelete, setPhoneToDelete] = useState(null);
  const [deletingPhone, setDeletingPhone] = useState(false);
  const [birthdayResetKey, setBirthdayResetKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const [emailVerificationToRemove, setEmailVerificationToRemove] =
    useState(null);

  const [removingEmailVerification, setRemovingEmailVerification] =
    useState(false);

  const createProfileSnapshot = (data) => ({
    fullName: data?.user?.fullName || "",
    gender: data?.user?.gender || "Unknown",
    birthday: data?.user?.birthday || "",
    avatar: data?.user?.avatar || "",
    phone: getProfilePhone(data),
  });

  const isDirty = Boolean(
    originalProfile &&
    (fullName !== originalProfile.fullName ||
      gender !== originalProfile.gender ||
      birthday !== originalProfile.birthday ||
      phone !== originalProfile.phone ||
      avatarFile !== null ||
      avatarDeleted ||
      avatarPreview !== (originalProfile.avatar || "")),
  );

  useBeforeUnload(
    (event) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    },
    { capture: true },
  );

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleResetProfile = () => {
    if (!originalProfile) return;

    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setFullName(originalProfile.fullName);
    setGender(originalProfile.gender);
    setBirthday(originalProfile.birthday);
    setBirthdayResetKey((prev) => prev + 1);
    setPhone(originalProfile.phone || "");
    setPhoneEditing(false);

    setAvatarFile(null);
    setAvatarDeleted(false);
    setAvatarPreview(originalProfile.avatar || "");

    showNotification(
      "success",
      "Đã đặt lại",
      "Thông tin cá nhân đã về trạng thái đã lưu gần nhất.",
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
        setPhone(getProfilePhone(data));
        setAvatarPreview(userData?.avatar || "");
      } catch (err) {
        setError(
          err.response?.data?.message || "Không thể tải thông tin người dùng",
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
  const phoneProvider = phones.length > 0 ? phones[0] : null;

  const phoneSectionVerified = phones.some((item) => item.phoneVerifiedAt);
  const emailSectionVerified = emails.some((item) => item.emailVerifiedAt);

  const isSearching = (keywords) => {
    const value = searchKeyword.trim().toLowerCase();
    if (!value) return false;

    return keywords.some(
      (keyword) =>
        keyword.toLowerCase().includes(value) ||
        value.includes(keyword.toLowerCase()),
    );
  };

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-8 text-center dark:border-rose-900/60 dark:bg-rose-950/30">
        <AlertCircle size={32} className="mx-auto text-rose-500" />
        <h2 className="font-heading text-base font-bold text-rose-800 dark:text-rose-300">
          {error}
        </h2>
      </div>
    );
  }

  const handleSelectAvatar = (file) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      showNotification(
        "error",
        "Ảnh không hợp lệ",
        "Chỉ chấp nhận ảnh JPEG hoặc PNG.",
      );
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showNotification(
        "error",
        "Ảnh quá lớn",
        "Ảnh đại diện không được vượt quá 5 MB.",
      );
      return;
    }

    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarDeleted(false);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleDeleteAvatar = () => {
    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(null);
    setAvatarPreview("");
    setAvatarDeleted(Boolean(user?.avatar));
  };

  const validateProfile = () => {
    if (!fullName.trim()) {
      showNotification("error", "Thiếu thông tin", "Vui lòng nhập họ và tên.");
      return false;
    }

    if (!birthday) {
      showNotification("error", "Thiếu thông tin", "Vui lòng nhập ngày sinh.");
      return false;
    }

    const selectedBirthday = new Date(`${birthday}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(selectedBirthday.getTime()) || selectedBirthday >= today) {
      showNotification(
        "error",
        "Ngày sinh không hợp lệ",
        "Ngày sinh phải nhỏ hơn ngày hiện tại.",
      );
      return false;
    }

    if (!["Male", "Female", "Unknown"].includes(gender)) {
      showNotification(
        "error",
        "Giới tính không hợp lệ",
        "Vui lòng chọn giới tính hợp lệ.",
      );
      return false;
    }

    const normalizedPhone = phone.trim().replace(/[\s.-]/g, "");
    if (
      normalizedPhone &&
      !/^(0\d{9}|\+84\d{9}|84\d{9})$/.test(normalizedPhone)
    ) {
      showNotification(
        "error",
        "Số điện thoại không hợp lệ",
        "Vui lòng nhập số điện thoại Việt Nam hợp lệ.",
      );
      return false;
    }

    return true;
  };

  const reloadProfile = async () => {
    const data = await userApi.getMe();
    const userData = data?.user;

    setProfile(data);
    setOriginalProfile(createProfileSnapshot(data));

    setFullName(userData?.fullName || "");
    setGender(userData?.gender || "Unknown");
    setBirthday(userData?.birthday || "");
    setPhone(getProfilePhone(data));
    setAvatarPreview(userData?.avatar || "");
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    try {
      setSaving(true);

      const payload = {
        fullName: fullName.trim(),
        gender,
        birthday,
        phone: phone.trim(),
      };

      await userApi.update(payload);

      if (avatarDeleted) {
        await userApi.removeAvatar();
      } else if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        await userApi.uploadAvatar(formData);
      }

      await reloadProfile();
      await refreshSession();

      setAvatarFile(null);
      setAvatarDeleted(false);
      setPhoneEditing(false);

      showNotification(
        "success",
        "Thành công",
        "Thông tin cá nhân đã được cập nhật.",
      );
    } catch (err) {
      showNotification(
        "error",
        "Thất bại",
        err.response?.data?.message || "Không thể cập nhật thông tin.",
      );
    } finally {
      setSaving(false);
    }
  };

  const getEmailStatus = (provider) =>
    provider?.emailVerifiedAt ? "active" : "inactive";

  const getPhoneStatus = (provider) =>
    provider?.phoneVerifiedAt ? "active" : "inactive";

  const handleSendEmailOtp = async (email) => {
    try {
      setEmailOtpLoading(true);
      const result = await userApi.sendEmailVerificationOtp();

      setEmailOtpTarget(email);
      setEmailOtpOpen(true);

      showNotification(
        "success",
        "Đã gửi OTP",
        result?.message || "Mã OTP đã được gửi đến email của bạn.",
      );
    } catch (err) {
      showNotification(
        "error",
        "Không thể gửi OTP",
        err.response?.data?.message || "Không thể gửi mã xác thực.",
      );
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async (otp) => {
    if (!otp) {
      showNotification("error", "Thiếu mã OTP", "Vui lòng nhập đầy đủ mã OTP.");
      return;
    }

    try {
      setEmailOtpLoading(true);
      const result = await userApi.verifyEmailVerificationOtp(otp);

      setEmailOtpOpen(false);
      setEmailOtpModalKey((value) => value + 1);

      await reloadProfile();
      await refreshSession();

      showNotification(
        "success",
        "Xác thực thành công",
        result?.message || "Email đã được xác thực.",
      );
    } catch (err) {
      showNotification(
        "error",
        "Xác thực thất bại",
        err.response?.data?.message || "Mã OTP không hợp lệ.",
      );
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleRemoveEmailVerification = async () => {
    try {
      setRemovingEmailVerification(true);
      const result = await userApi.removeEmailVerification();

      setEmailVerificationToRemove(null);

      await reloadProfile();
      await refreshSession();

      showNotification(
        "success",
        "Đã bỏ xác thực",
        result?.message || "Email đã được chuyển về trạng thái chưa xác thực.",
      );
    } catch (err) {
      showNotification(
        "error",
        "Không thể bỏ xác thực",
        err.response?.data?.message || "Không thể bỏ xác thực email.",
      );
    } finally {
      setRemovingEmailVerification(false);
    }
  };

  const handleDeletePhone = async () => {
    if (!phoneToDelete?.id) return;

    try {
      setDeletingPhone(true);
      const result = await userApi.deletePhone(phoneToDelete.id);

      setPhoneToDelete(null);
      setPhone("");
      setPhoneEditing(false);

      await reloadProfile();
      await refreshSession();

      showNotification(
        "success",
        "Xóa số điện thoại thành công",
        result?.message || "Số điện thoại đã được xóa.",
      );
    } catch (err) {
      showNotification(
        "error",
        "Không thể xóa số điện thoại",
        err.response?.data?.message || "Vui lòng thử lại.",
      );
    } finally {
      setDeletingPhone(false);
    }
  };

  const statusMeta = getAccountStatusMeta(user?.status);

  return (
    <div className="animate-in space-y-6 duration-200 fade-in">
      {/* 1. Page Header */}
      <PageHeader
        title="Hồ sơ cá nhân"
        badge={
          <>
            <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
            {user?.userCode && (
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {user.userCode}
              </span>
            )}
          </>
        }
        description="Quản lý thông tin định danh, ảnh đại diện, số điện thoại và email liên kết với tài khoản."
        actions={
          <>
            <button
              type="button"
              onClick={handleResetProfile}
              disabled={!isDirty || saving}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RotateCcw size={14} />
              <span>Đặt lại</span>
            </button>

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-brand! px-4 text-xs font-semibold text-white! shadow-sm shadow-brand/25 transition hover:bg-brand-hover! disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={14} />
              <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
            </button>
          </>
        }
      />

      {/* 2. Main 2-Column Content */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        {/* Left Column: Avatar & Quick Account Overview */}
        <div className="space-y-6">
          <PortalSectionCard
            title="Ảnh đại diện & Định danh"
            description="Tải lên ảnh chân dung JPEG hoặc PNG (tối đa 5 MB)"
          >
            <AvatarPicker
              variant="card"
              preview={avatarDeleted ? "" : avatarPreview}
              alt={fullName.trim() || user?.fullName || "Ảnh đại diện"}
              title={fullName.trim() || user?.fullName || "Chưa cập nhật tên"}
              code={user?.userCode || ""}
              hint="JPEG hoặc PNG, tối đa 5 MB."
              accept="image/jpeg,image/png"
              disabled={saving}
              removable={Boolean(
                avatarFile || (avatarPreview && !avatarDeleted),
              )}
              initials={getInitials(fullName || user?.fullName, "U")}
              onSelect={handleSelectAvatar}
              onRemove={handleDeleteAvatar}
            />

            <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Mã tài khoản
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {user?.userCode || "---"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Trạng thái
                </span>
                <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Phương thức đăng nhập
                </span>
                <span className="font-semibold text-slate-800 capitalize dark:text-slate-200">
                  {authProviders
                    .map((item) => item.provider)
                    .filter(Boolean)
                    .join(", ") || "Local"}
                </span>
              </div>
            </div>
          </PortalSectionCard>

          <PortalSectionCard
            title="Điều hướng nhanh"
            description="Thiết lập mở rộng cho tài khoản của bạn"
          >
            <div className="space-y-2">
              <Link
                to="/user/address"
                className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-brand/30 hover:bg-white hover:text-brand dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200"
              >
                <span className="flex items-center gap-2.5">
                  <MapPin size={15} className="text-brand" />
                  <span>Quản lý sổ địa chỉ</span>
                </span>
                <ArrowRight
                  size={14}
                  className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                />
              </Link>

              <Link
                to="/user/security"
                className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-brand/30 hover:bg-white hover:text-brand dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200"
              >
                <span className="flex items-center gap-2.5">
                  <ShieldCheck size={15} className="text-emerald-600" />
                  <span>Đổi mật khẩu & Bảo mật</span>
                </span>
                <ArrowRight
                  size={14}
                  className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                />
              </Link>

              <Link
                to="/user/privacy"
                className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-brand/30 hover:bg-white hover:text-brand dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200"
              >
                <span className="flex items-center gap-2.5">
                  <Lock size={15} className="text-indigo-600" />
                  <span>Quyền riêng tư & Dữ liệu</span>
                </span>
                <ArrowRight
                  size={14}
                  className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                />
              </Link>
            </div>
          </PortalSectionCard>
        </div>

        {/* Right Column: Personal Info, Phone, Email */}
        <div className="space-y-6">
          {/* Personal Details */}
          <PortalSectionCard
            title="Thông tin cá nhân"
            description="Cập nhật họ tên, ngày sinh và giới tính hiển thị trên đơn hàng"
            icon={User}
            highlight={isSearching([
              "personal",
              "profile",
              "birthday",
              "gender",
              "họ tên",
              "ngày sinh",
              "giới tính",
            ])}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ProfileInput
                label="Họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <ProfileInput
                label="Mã người dùng"
                value={user?.userCode}
                type="text"
                readOnly
              />

              <div className="md:col-span-2">
                <BirthdayField
                  birthday={birthday}
                  setBirthday={setBirthday}
                  birthdayResetKey={birthdayResetKey}
                />
              </div>

              <div className="md:col-span-2">
                <RadioGroup
                  label="Giới tính"
                  name="gender"
                  value={gender}
                  onChange={setGender}
                  options={[
                    { label: "Nam", value: "Male" },
                    { label: "Nữ", value: "Female" },
                    { label: "Chưa xác định", value: "Unknown" },
                  ]}
                />
              </div>
            </div>
          </PortalSectionCard>

          {/* Phone Section */}
          <PortalSectionCard
            title="Số điện thoại liên kết"
            description="Quản lý số điện thoại nhận thông báo đơn hàng"
            icon={Phone}
            iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
            badge={
              <StatusBadge
                label={phoneSectionVerified ? "Đã xác thực" : "Chưa xác thực"}
                tone={phoneSectionVerified ? "success" : "neutral"}
              />
            }
            highlight={isSearching(["phone", "number", "sdt", "số điện thoại"])}
          >
            {phoneProvider ? (
              <div className="space-y-3">
                <ContactRow
                  value={phone}
                  provider={phoneProvider.provider}
                  showProvider
                  editable={phoneEditing}
                  isLocked={!phoneEditing}
                  inputType="tel"
                  placeholder="Nhập số điện thoại"
                  badgeStatus={getPhoneStatus(phoneProvider)}
                  onChange={(event) => setPhone(event.target.value)}
                  onEdit={() => {
                    setPhone(phoneProvider.phone || "");
                    setPhoneEditing(true);
                  }}
                  canDelete={false}
                  showDeleteInSetting
                  onDelete={() => setPhoneToDelete(phoneProvider)}
                  verificationDisabled
                  verificationDisabledText="Xác thực sắp ra mắt"
                />

                {phoneEditing && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Số điện thoại mới sẽ được lưu ở trạng thái chưa xác thực.
                    Nhấn <strong>Lưu thay đổi</strong> để hoàn tất.
                  </p>
                )}
              </div>
            ) : (
              <EmptyContact
                message="Chưa liên kết số điện thoại."
                buttonText="Thêm số điện thoại"
                showForm={phoneEditing}
                onAdd={() => {
                  setPhone("");
                  setPhoneEditing(true);
                }}
              >
                <ContactRow
                  value={phone}
                  provider="phone"
                  showProvider
                  editable
                  inputType="tel"
                  placeholder="Nhập số điện thoại"
                  badgeStatus="inactive"
                  showSetting
                  canDelete={false}
                  onChange={(event) => setPhone(event.target.value)}
                  verificationDisabled
                  verificationDisabledText="Xác thực sắp ra mắt"
                />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPhone("");
                      setPhoneEditing(false);
                    }}
                    className="cursor-pointer rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                  >
                    Hủy
                  </button>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Nhấn <strong>Lưu thay đổi</strong> để lưu số điện thoại.
                  </p>
                </div>
              </EmptyContact>
            )}
          </PortalSectionCard>

          {/* Email Section */}
          <PortalSectionCard
            title="Email liên kết & Xác thực"
            description="Quản lý địa chỉ email đăng nhập và xác thực OTP"
            icon={Mail}
            iconClassName="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
            badge={
              <StatusBadge
                label={emailSectionVerified ? "Đã xác thực" : "Chưa xác thực"}
                tone={emailSectionVerified ? "success" : "warning"}
              />
            }
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
                emails.map((item, idx) => (
                  <ContactRow
                    key={item.id ?? `${item.provider}-${item.email}-${idx}`}
                    value={item.email}
                    provider={item.provider}
                    showProvider
                    isLocked
                    badgeText={getEmailStatus(item)}
                    badgeStatus={getEmailStatus(item)}
                    showSetting={item.provider?.toLowerCase() === "local"}
                    canDelete={false}
                    onVerify={() => handleSendEmailOtp(item.email)}
                    onRemove={() => setEmailVerificationToRemove(item)}
                  />
                ))
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chưa liên kết email. Chức năng liên kết đang được hoàn thiện.
                </p>
              )}
            </div>
          </PortalSectionCard>

          {/* Bottom Save Bar */}
          <div className="flex items-center justify-end gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={handleResetProfile}
              disabled={!isDirty || saving}
              className="inline-flex h-9.5 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <RotateCcw size={14} />
              <span>Đặt lại</span>
            </button>

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="inline-flex h-9.5 cursor-pointer items-center gap-1.5 rounded-xl bg-brand! px-5 text-xs font-semibold text-white! shadow-sm shadow-brand/25 transition hover:bg-brand-hover! disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={14} />
              <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
            </button>
          </div>
        </div>
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
        onResend={() => handleSendEmailOtp(emailOtpTarget)}
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
          Nếu tài khoản không còn email hoặc số điện thoại nào được xác thực,
          tài khoản sẽ chuyển về trạng thái pending.
        </p>
      </ConfirmModal>

      <ConfirmModal
        open={Boolean(phoneToDelete)}
        title="Xóa số điện thoại"
        confirmText="Xóa số điện thoại"
        loadingText="Đang xóa..."
        confirmVariant="danger"
        submitting={deletingPhone}
        onClose={() => {
          if (!deletingPhone) {
            setPhoneToDelete(null);
          }
        }}
        onConfirm={handleDeletePhone}
      >
        Bạn có chắc chắn muốn xóa số điện thoại{" "}
        <span className="font-semibold text-text-strong">
          {phoneToDelete?.phone}
        </span>
        ?
        <p className="mt-2 text-danger">
          {phoneToDelete?.phoneVerifiedAt
            ? "Số đã xác thực sẽ được gỡ khỏi tài khoản và lưu lại trong lịch sử."
            : "Số chưa xác thực sẽ bị xóa hoàn toàn khỏi hệ thống."}
        </p>
      </ConfirmModal>
    </div>
  );
};

const ProfileInput = ({
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
      className={`border-input! ${
        readOnly
          ? "cursor-not-allowed! bg-surface-muted! text-text-muted!"
          : "bg-surface! text-text-default!"
      } placeholder:text-transparent! focus:border-brand! focus:shadow-[0_0_0_3px_rgba(1,146,245,0.12)]!`}
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
      <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-200">
        Ngày sinh
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
