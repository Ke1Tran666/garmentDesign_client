import { useState } from "react";
import * as XLSX from "xlsx";
import { Divider } from "@/shared/ui/divider/Divider";
import { SectionCard } from "@/shared/ui/section/Section";
import { HandleButtonIcon } from "@/shared/ui/button/Button";
import { Download, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import { userApi } from "@/entities/user/api/userApi";
import { useAuth } from "@/features/auth/model/useAuth";

const PrivacyPage = () => {
  const navigate = useNavigate();

  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const { setUser } = useAuth();

  const formatDateTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("vi-VN");
  };

  const createSheet = (rows, headers) => {
    return XLSX.utils.json_to_sheet(
      Array.isArray(rows) ? rows : [],
      {
        header: headers,
      },
    );
  };

  const handleDownloadData = async () => {
    try {
      setExporting(true);

      const exportData = await userApi.exportData();

      const {
        user,
        addresses = [],
        authProviders = [],
      } = exportData;

      if (!user) {
        throw new Error(
          "Dữ liệu người dùng không hợp lệ",
        );
      }

      const userRows = [
        {
          "ID User": user.idUser ?? "",
          "User Code": user.userCode ?? "",
          "Full Name": user.fullName ?? "",
          Avatar: user.avatar ?? "",
          Gender: user.gender ?? "",
          Birthday: user.birthday ?? "",
          "Role ID": user.roleId ?? "",
          "Role Name": user.roleName ?? "",
          "Default Address ID":
            user.defaultAddressId ?? "",
          Status: user.status ?? "",
          "Last Login": formatDateTime(
            user.lastLogin,
          ),
          "Created At": formatDateTime(
            user.createdAt,
          ),
          "Updated At": formatDateTime(
            user.updatedAt,
          ),
          "Deleted At": formatDateTime(
            user.deletedAt,
          ),
        },
      ];

      const addressRows = addresses.map(
        (address) => ({
          "Address ID": address.addressId ?? "",
          "ID User": address.idUser ?? "",
          "Company Name":
            address.companyName ?? "",
          Address: address.address ?? "",
          Note: address.note ?? "",
          "Is Default": address.isDefault
            ? "Yes"
            : "No",
          "Created At": formatDateTime(
            address.createdAt,
          ),
          "Updated At": formatDateTime(
            address.updatedAt,
          ),
          "Deleted At": formatDateTime(
            address.deletedAt,
          ),
        }),
      );

      const providerRows = authProviders.map(
        (provider) => ({
          "Provider ID": provider.id ?? "",
          "ID User": provider.idUser ?? "",
          Provider: provider.provider ?? "",
          Email: provider.email ?? "",
          Phone: provider.phone ?? "",
          "External Provider ID":
            provider.providerId ?? "",
          "Email Verified At": formatDateTime(
            provider.emailVerifiedAt,
          ),
          "Phone Verified At": formatDateTime(
            provider.phoneVerifiedAt,
          ),
          "Created At": formatDateTime(
            provider.createdAt,
          ),
          "Updated At": formatDateTime(
            provider.updatedAt,
          ),
          "Deleted At": formatDateTime(
            provider.deletedAt,
          ),
        }),
      );

      const userHeaders = [
        "ID User",
        "User Code",
        "Full Name",
        "Avatar",
        "Gender",
        "Birthday",
        "Role ID",
        "Role Name",
        "Default Address ID",
        "Status",
        "Last Login",
        "Created At",
        "Updated At",
        "Deleted At",
      ];

      const addressHeaders = [
        "Address ID",
        "ID User",
        "Company Name",
        "Address",
        "Note",
        "Is Default",
        "Created At",
        "Updated At",
        "Deleted At",
      ];

      const providerHeaders = [
        "Provider ID",
        "ID User",
        "Provider",
        "Email",
        "Phone",
        "External Provider ID",
        "Email Verified At",
        "Phone Verified At",
        "Created At",
        "Updated At",
        "Deleted At",
      ];

      const workbook = XLSX.utils.book_new();

      const userSheet = createSheet(
        userRows,
        userHeaders,
      );

      const addressSheet = createSheet(
        addressRows,
        addressHeaders,
      );

      const providerSheet = createSheet(
        providerRows,
        providerHeaders,
      );

      XLSX.utils.book_append_sheet(
        workbook,
        userSheet,
        "User Information",
      );

      XLSX.utils.book_append_sheet(
        workbook,
        addressSheet,
        "Addresses",
      );

      XLSX.utils.book_append_sheet(
        workbook,
        providerSheet,
        "Auth Providers",
      );

      const exportUserCode =
        user.userCode || user.idUser || "me";

      XLSX.writeFile(
        workbook,
        `user-data-${exportUserCode}.xlsx`,
      );
    } catch (error) {
      console.error(
        "Export user data error:",
        error,
      );

      alert(
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Xuất dữ liệu người dùng thất bại",
      );
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    setOpenDeleteModal(true);
  };

  const handleConfirmDeleteAccount = async () => {
    try {
      setDeleting(true);

      await userApi.deleteAccount();

      setUser(null);

      alert(
        "Tài khoản đã được đóng. Bạn có thể liên hệ hỗ trợ nếu muốn khôi phục.",
      );

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Delete account error:",
        error,
      );

      alert(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Xóa tài khoản thất bại",
      );
    } finally {
      setDeleting(false);
      setOpenDeleteModal(false);
    }
  };

  return (
    <>
      <SectionCard
        title="Personal Data"
        desc="Download a copy of your personal information."
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-text-muted">
              Export your profile, addresses, and other account-related data.
            </p>
          </div>
          <HandleButtonIcon
            variant="outline"
            icon={Download}
            onClick={handleDownloadData}
            disabled={exporting}
            className={`bg-brand! disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {exporting ? "Downloading..." : "Download Data"}
          </HandleButtonIcon>
        </div>
      </SectionCard>

      <Divider />

      <SectionCard
        title="Delete Account"
        desc="Deactivate your account and sign out from all devices."
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-danger">
              Contact support if you want to restore your account.
            </p>
          </div>

          <HandleButtonIcon
            variant="outline"
            icon={Trash2}
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="bg-danger! disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete Account
          </HandleButtonIcon>
        </div>
      </SectionCard>

      <ConfirmModal
        open={openDeleteModal}
        title="Xóa tài khoản"
        confirmText="Xóa tài khoản"
        loadingText="Đang xử lý..."
        confirmVariant="danger"
        submitting={deleting}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleConfirmDeleteAccount}
      >
        Bạn có chắc chắn muốn xóa tài khoản không? Bạn sẽ bị đăng xuất trên tất
        cả thiết bị. Nếu muốn mở lại tài khoản, vui lòng liên hệ bộ phận hỗ trợ.
      </ConfirmModal>
    </>
  );
};

export default PrivacyPage;
