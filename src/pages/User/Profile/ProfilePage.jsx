import { useEffect, useState } from "react";
import axios from "axios";
import BirthdayInput from "@/components/ui/Form/BirthdayInput";
import FloatingInput from "@/components/ui/Form/FloatingInput";
import { useOutletContext } from "react-router-dom";
import { ContactRow, EmptyContact } from "@/components/common/Contact/ContactRow";
import { useNotification } from "@/components/ui/Notification/NotificationContext";
import OTPModal from "@/components/ui/OTP/OTPModal";

const BRAND = "var(--color-brand)";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const { showNotification } = useNotification();

  const { searchKeyword = "" } = useOutletContext() || {};

  const [otpModal, setOtpModal] = useState({
  open: false,
  type: "",
  target: "",
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
          `http://localhost:8080/api/users/me/${idUser}`
        );

        setProfile(response.data);
        setBirthday(response.data?.user?.birthday || "");
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
  const handleRemoveProvider = (item) => {
    if (authProviders.length <= 1) {
      showNotification(
        "error",
        "Không thể gỡ bỏ",
        "Tài khoản phải có ít nhất 1 phương thức đăng nhập để duy trì quyền truy cập."
      );
      return;
    }

    console.log("Cho phép gỡ bỏ:", item);

    // Sau này gọi API ở đây
    // await axios.delete(`http://localhost:8080/api/auth-providers/${item.id}`);
  };

  // Mở OTP Modal
  const openPhoneVerify = (phone) => {
    setOtpModal({
      open: true,
      type: "phone",
      target: phone,
    });
  };

  const openEmailVerify = (email) => {
    setOtpModal({
      open: true,
      type: "email",
      target: email,
    });
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
          <Input 
            label="Full name" 
            defaultValue={user?.fullName} 
            type="text" />
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
            <Gender value={user?.gender} />
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px]">
            <div className="flex min-h-32 items-center justify-center bg-[radial-gradient(circle,#e5e7eb_1px,transparent_1px)] bg-size-[18px_18px]">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-gray-200 bg-white">
                <img
                  src={user?.avatar || "https://i.pravatar.cc/120?img=12"}
                  alt="avatar"
                  className="h-14 w-14 rounded-full object-cover"
                />
              </div>
            </div>

            <div className="grid border-t border-gray-200 md:border-l md:border-t-0">
              <button
                type="button"
                className="border-b! border-gray-200! text-sm font-semibold transition hover:bg-gray-50 "
                style={{ color: BRAND }}
              >
                Upload picture
              </button>
              <button
                type="button"
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
                value={item.phone}
                provider={item.provider}
                isLocked={item.provider === "phone"}
                badgeText="active"
                badgeStatus="active"
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
                value=""
                badgeText="inactive"
                badgeStatus="inactive"
                showSetting
                canDelete
                onVerify={() => openPhoneVerify("")}
                onDelete={() => setShowPhoneInput(false)}
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
                value={item.email}
                provider={item.provider}
                showProvider
                isLocked={item.provider === "local" || item.provider === "google"}
                badgeText="active"
                badgeStatus="active"
                showSetting
                canDelete={item.provider !== "local" && item.provider !== "google"}
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
                value=""
                badgeText="inactive"
                badgeStatus="inactive"
                showSetting
                canDelete
                onVerify={() => openEmailVerify("")}
                onDelete={() => setShowEmailInput(false)}
              />
            </EmptyContact>
          )}
        </div>
      </Section>

      <Divider />

      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          Default
        </button>

        <button
          type="button"
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          style={{ backgroundColor: BRAND }}
        >
          Save changes
        </button>
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
          })
        }
        onVerify={(otpCode) => {
          console.log("OTP:", otpCode);
        }}
        onResend={() => {
          console.log("Gửi lại OTP");
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

const Gender = ({ value }) => {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-gray-700">Gender</p>

      <div className="flex flex-wrap gap-3">
        <GenderOption 
          label="Male" 
          name="gender" 
          defaultChecked={value === "Male"} 
        />
        <GenderOption 
          label="Female" 
          name="gender"
          defaultChecked={value === "Female"}
        />
        <GenderOption 
          label="Unknown" 
          name="gender" 
          defaultChecked={value === "Unknown"}
        />
      </div>
    </div>
  );
};

const GenderOption = ({ label, name, defaultChecked = false }) => {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-brand hover:bg-gray-50">
      <input
        type="radio"
        name={name}
        defaultChecked={defaultChecked}
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