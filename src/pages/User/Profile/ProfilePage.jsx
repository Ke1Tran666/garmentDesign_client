import { useEffect, useState } from "react";
import axios from "axios";
import BirthdayInput from "@/components/ui/Form/BirthdayInput";
import FloatingInput from "@/components/ui/Form/FloatingInput";
import { useBeforeUnload, useOutletContext } from "react-router-dom";
import { ContactRow, EmptyContact } from "@/components/common/Contact/ContactRow";
import { useNotification } from "@/components/ui/Notification/NotificationContext";
import OTPModal from "@/components/ui/OTP/OTPModal";
import defaultAvatar from "@/assets/images/image-default.jpg";
import { AUTH_API, BASE_URL_API, USER_API } from "@/api/config";
import { HandleButton } from "@/components/ui/Button/Button";

const BRAND = "var(--color-brand)";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [birthday, setBirthday] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("Unknown");

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

        const idUser = localStorage.getItem("idUser");

        if (!idUser) {
          setError("Không tìm thấy idUser. Vui lòng đăng nhập lại.");
          return;
        }

        const response = await axios.get(
          `${USER_API}/me/${idUser}`
        );

        const userData = response.data?.user;

        setProfile(response.data);
        setOriginalProfile(createProfileSnapshot(response.data));

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
      <div className="px-6 py-6 text-sm font-medium text-gray-500">
        Đang tải thông tin người dùng...
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-6 text-sm font-medium text-red-500">
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

      await axios.delete(
        `${BASE_URL_API}/user-auth-providers/${item.id}`
      );

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

      await axios.post(`${AUTH_API}/send-otp`, {
        phone: targetPhone,
      });

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

      await axios.post(`${AUTH_API}/send-email-otp`, {
        email: targetEmail,
      });

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

      const idUser = localStorage.getItem("idUser");

      const payload = {
        fullName,
        gender,
        birthday,
      };

      await axios.put(
        `${USER_API}/${idUser}`,
        payload
      );

      if (avatarDeleted) {
        await axios.delete(
          `${USER_API}/me/${idUser}/avatar`
        );
      }
      else if (avatarFile) {
        const formData = new FormData();

        formData.append("file", avatarFile);

        await axios.put(
          `${USER_API}/me/${idUser}/avatar`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
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
    const idUser = localStorage.getItem("idUser");

    const response = await axios.get(
      `${USER_API}/me/${idUser}`
    );

    const userData = response.data?.user;

    setProfile(response.data);
    setOriginalProfile(createProfileSnapshot(response.data));
    setFullName(userData?.fullName || "");
    setGender(userData?.gender || "Unknown");
    setBirthday(userData?.birthday || "");
    setAvatarPreview(userData?.avatar || "");
  };

  return (
    <div className="px-6 py-6">
      <Section
        title="Personal"
        desc="Edit your name and profile picture"
        active={user?.status || "active"}
        highlight={isSearching(["personal", "profile", "birthday", "gender"])}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FloatingInput
            type="text"
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            containerClassName="w-full"
            className="
              border-gray-300!
              bg-white!
              text-gray-800!
              placeholder:text-transparent!
              focus:border-brand!
            "
          />
          <Input 
            label="User code" 
            defaultValue={user?.userCode}
            type="text"
            readOnly 
            />

          <div className="md:col-span-2">
            <BirthdayField 
              birthday={birthday} 
              setBirthday={setBirthday} />
          </div>

          <div className="md:col-span-2">
            <Gender
              value={gender}
              onChange={setGender}
            />
          </div>
        </div>

        {/* AVATAR */}
        <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px]">
            <div className="flex min-h-32 items-center justify-center bg-[radial-gradient(circle,#e5e7eb_1px,transparent_1px)] bg-size-[18px_18px]">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-gray-200 bg-white">
                <img
                  src={avatarPreview || user?.avatar || defaultAvatar}
                  alt="avatar"
                  className="h-20 w-20 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = defaultAvatar;
                  }}
                />
              </div>
            </div>

            <div className="grid border-t border-gray-200 md:border-l md:border-t-0">
              <label
                htmlFor="avatar-upload"
                className="flex cursor-pointer items-center justify-center border-b! border-gray-200! text-sm font-semibold transition hover:bg-gray-50"
                style={{ color: BRAND }}
              >
                Upload picture
              </label>

              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadAvatar}
              />

              <button
                type="button"
                onClick={handleDeleteAvatar}
                className="text-sm font-semibold text-red-500 transition hover:bg-red-50"
              >
                Delete picture
              </button>
            </div>
          </div>
        </div>
      </Section>

      <Divider />

      {/* PHONE */}
      <Section
        title="Link phone number"
        desc="Link your phone number to verify your account for the best support."
        highlight={isSearching(["phone", "number", "sdt", "số điện thoại"])}
      >
        <div className="space-y-3">
          {phones.length > 0 ? (
            phones.map((item) => (
              <ContactRow
                key={item.id}
                value={item.phone}
                provider={item.provider}
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
      </Section>

      <Divider />

      {/* EMAIL */}
      <Section
        title="Associated email"
        desc="Manage email accounts linked to your profile."
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
      </Section>

      <Divider />

      <div className="flex justify-end gap-3">
        <HandleButton
          onClick={handleResetProfile}
          className={`bg-[#F5F5F5]! text-gray-600!`}
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

            const idUser = localStorage.getItem("idUser");

            if (otpModal.type === "phone") {
              await axios.post(`${AUTH_API}/verify-otp`, {
                idUser,
                phone: otpModal.target,
                otp: otpCode,
                mode: otpModal.mode,
              });
            }

            if (otpModal.type === "email") {
              await axios.post(`${AUTH_API}/verify-email-otp`, {
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
              await axios.post(`${AUTH_API}/send-otp`, {
                phone: otpModal.target,
              });
            }

            if (otpModal.type === "email") {
              await axios.post(`${AUTH_API}/send-email-otp`, {
                email: otpModal.target,
              });
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
    </div>
  );
};

const Section = ({ title, desc, active, highlight, children }) => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
      <div>
        <div className="flex w-fit flex-col">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-semibold text-gray-900">
              {title}
            </h4>

            {active && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  active === "active"
                    ? "bg-green-100 text-green-700"
                    : active === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : active === "banned"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {active}
              </span>
            )}
          </div>

          <span
            className={`mt-1 h-0.5 rounded-full bg-brand transition-all duration-300 ${
              highlight ? "w-full opacity-100" : "w-0 opacity-0"
            }`}
          />
        </div>

        <p className="mt-2 max-w-52 text-sm leading-5 text-gray-500">
          {desc}
        </p>
      </div>

      <div>{children}</div>
    </div>
  );
};

const Divider = () => {
  return <div className="my-7 h-px w-full bg-gray-200" />;
};

const Input = ({
  label,
  defaultValue = "",
  placeholder,
  type = "text",
  readOnly = false,
}) => {
  const hasValue = String(defaultValue || "").trim() !== "";

  return (
    <FloatingInput
      type={type}
      label={label}
      defaultValue={defaultValue}
      readOnly={readOnly}
      placeholder={placeholder || label}
      containerClassName="w-full"
      className={`
        border-gray-300!
        ${readOnly ? "bg-gray-100! text-gray-500! cursor-not-allowed!" : "bg-white! text-gray-800!"}
        placeholder:text-transparent!
        focus:border-brand!
        focus:shadow-[0_0_0_3px_rgba(1,146,245,0.12)]!
      `}
      labelClassName={`
        text-gray-500!
        peer-focus:text-brand!
        ${hasValue ? "top-2! translate-y-0! text-xs! text-brand!" : ""}
      `}
    />
  );
};

const Gender = ({ value, onChange }) => {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-gray-700">Gender</p>

      <div className="flex flex-wrap gap-3">
        <GenderOption
          label="Male"
          name="gender"
          checked={value === "Male"}
          onChange={() => onChange("Male")}
        />
        <GenderOption
          label="Female"
          name="gender"
          checked={value === "Female"}
          onChange={() => onChange("Female")}
        />
        <GenderOption
          label="Unknown"
          name="gender"
          checked={value === "Unknown"}
          onChange={() => onChange("Unknown")}
        />
      </div>
    </div>
  );
};

const GenderOption = ({
  label,
  name,
  checked,
  onChange,
}) => {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-brand hover:bg-gray-50">
    <input
      type="radio"
      name={name}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4"
      style={{ accentColor: BRAND }}
    />
      {label}
    </label>
  );
};

const BirthdayField = ({ birthday, setBirthday }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        Birthday
      </label>

      <BirthdayInput
        value={birthday}
        onChange={setBirthday}
        inputClassName="
          border-gray-300!
          bg-white!
          text-gray-700!
          placeholder:text-gray-400!
          focus:border-brand!
          focus:shadow-[0_0_0_3px_rgba(1,146,245,0.12)]!
        "
        calendarButtonClassName="
          border-gray-300!
          bg-white!
          text-gray-600!
          hover:border-brand!
          hover:bg-gray-50!
        "
        popupClassName="border-gray-200! translate-y-24!"
      />
    </div>
  );
};

export default ProfilePage;