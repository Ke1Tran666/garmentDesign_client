import { useEffect, useState } from "react";
import axios from "axios";
import BirthdayInput from "@/components/ui/Form/BirthdayInput";
import FloatingInput from "@/components/ui/Form/FloatingInput";
import { Settings, Trash2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";

const BRAND = "var(--color-brand)";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { searchKeyword = "" } = useOutletContext() || {};

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
            defaultValue={user?.fullName || "Kei Tran"} 
            type="fullname" />
          <Input 
            label="User code" 
            defaultValue={user?.userCode || "TRAU0112345"}
            type="user_code" 
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

      <Section
        title="Link phone number"
        desc="Link your phone number to verify your account for the best support."
        highlight={isSearching(["phone", "number", "sdt", "số điện thoại"])}
      >
        <div className="space-y-3">
          {phones.length > 0 ? (
            phones.map((item, index) => (
              <PhoneRow
                key={`${item.provider}-${item.phone}`}
                phone={item.phone}
                isDefault={index === 0}
              />
            ))
          ) : (
            <div>
              <PhoneRow phone="" />

              <p className="mt-2 text-sm text-red-500">
                Chưa liên kết số điện thoại.
              </p>
            </div>
          )}
        </div>
      </Section>

      <Divider />

      <Section
        title="Associated email"
        desc="Manage email accounts linked to your profile."
        highlight={isSearching(["email", "mail", "gmail", "google", "local"])}
      >
        <div className="space-y-3">
          {emails.length > 0 ? (
            emails.map((item, index) => (
              <EmailRow
                key={`${item.provider}-${item.email}`}
                email={item.email}
                provider={item.provider}
                isDefault={index === 0}
              />
            ))
          ) : (
            <div>
              <EmailRow email="" provider={null} />

              <p className="mt-2 text-sm text-red-500">
                Chưa liên kết email.
              </p>
            </div>
          )}
        </div>
      </Section>

      <Divider />

      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="button"
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          style={{ backgroundColor: BRAND }}
        >
          Save changes
        </button>
      </div>
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
  defaultValue,
  placeholder,
  type = "text",
  readOnly = false,
}) => {
  return (
    <FloatingInput
      type={type}
      label={label}
      value={defaultValue}
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
      labelClassName="
        text-gray-500!
        peer-valid:text-brand!
        peer-focus:text-brand!
      "
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

const PhoneRow = ({ phone, isDefault = false }) => {
  return (
    <div className="flex flex-wrap items-center gap-3">

      <input
        type="text"
        defaultValue={phone || ""}
        className="h-11 min-w-55 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-brand focus:shadow-[0_0_0_3px_rgba(1,146,245,0.12)]"
      />

      {isDefault && (
        <span className="rounded-full bg-green-100 px-4 py-1.5 text-xs font-semibold text-green-700">
          active
        </span>
      )}

      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50"
      >
        <Settings size={16} />
      </button>

      {!isDefault && (
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

const EmailRow = ({
  email,
  provider,
  isDefault = false,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">

      {provider && (
        <ProviderBadge provider={provider} />
      )}

      <input
        type="text"
        value={email}
        readOnly
        className="
          h-11 min-w-55 flex-1
          rounded-lg border border-gray-300
          bg-gray-100 px-3 text-sm
          text-gray-500 outline-none
        "
      />

      {isDefault && (
        <span className="rounded-full bg-green-100 px-4 py-1.5 text-xs font-semibold text-green-700">
          Default
        </span>
      )}

      <button
        type="button"
        className="
          flex h-10 w-10 items-center justify-center
          rounded-lg border border-gray-200
          text-gray-500 transition hover:bg-gray-50
        "
      >
        <Settings size={16} />
      </button>
    </div>
  );
};

const ProviderBadge = ({ provider }) => {
  const styles = {
    local: "bg-blue-100 text-blue-700",
    google: "bg-red-100 text-red-700",
    phone: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`
        rounded-full px-4 py-1.5
        text-xs font-semibold
        ${styles[provider] || "bg-gray-100 text-gray-600"}
      `}
    >
      {provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "Unknown"}
    </span>
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