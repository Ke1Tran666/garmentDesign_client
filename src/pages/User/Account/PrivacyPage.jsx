import { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { Divider } from "@/components/ui/Divider/Divider";
import { SectionCard } from "@/components/ui/Section/Section";
import { HandleButtonIcon } from "@/components/ui/Button/Button";
import { Download, Trash2 } from "lucide-react";
import { USER_API } from "@/api/config";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "@/components/ui/Modal/ConfirmModal";

const PrivacyPage = () => {
  const navigate = useNavigate();

  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const formatDateTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("vi-VN");
  };

  const safeSheetData = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      return [{}];
    }

    return rows;
  };

  const handleDownloadData = async () => {
    const idUser = localStorage.getItem("idUser");

    if (!idUser) {
      alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      setExporting(true);

      const response = await axios.get(`${USER_API}/me/${idUser}/export-data`);
      const { user, addresses = [], authProviders = [], defaultAddress } = response.data;

      const workbook = XLSX.utils.book_new();

      const userSheet = XLSX.utils.json_to_sheet([
        {
          "ID User": user?.idUser || "",
          "User Code": user?.userCode || "",
          "Full Name": user?.fullName || "",
          Gender: user?.gender || "",
          Birthday: user?.birthday || "",
          Status: user?.status || "",
          Avatar: user?.avatar || "",
          "Default Address ID": defaultAddress?.addressId || user?.defaultAddress?.addressId || "",
          "Created At": formatDateTime(user?.createdAt),
          "Updated At": formatDateTime(user?.updatedAt),
        },
      ]);

      const addressSheet = XLSX.utils.json_to_sheet(
        safeSheetData(
          addresses.map((address) => ({
            "Address ID": address?.addressId || "",
            "Company Name": address?.companyName || "",
            Address: address?.address || "",
            Ward: address?.ward || "",
            District: address?.district || "",
            Province: address?.province || "",
            Phone: address?.phone || "",
            "Is Default":
              defaultAddress?.addressId === address?.addressId ||
              user?.defaultAddress?.addressId === address?.addressId
                ? "Yes"
                : "No",
            "Created At": formatDateTime(address?.createdAt),
            "Updated At": formatDateTime(address?.updatedAt),
          }))
        )
      );

      const providerSheet = XLSX.utils.json_to_sheet(
        safeSheetData(
          authProviders.map((provider) => ({
            "Provider ID": provider?.idAuthProvider || provider?.authProviderId || "",
            Provider: provider?.provider || "",
            Email: provider?.email || "",
            Phone: provider?.phone || "",
            "Email Verified At": formatDateTime(provider?.emailVerifiedAt),
            "Phone Verified At": formatDateTime(provider?.phoneVerifiedAt),
            "Created At": formatDateTime(provider?.createdAt),
            "Updated At": formatDateTime(provider?.updatedAt),
          }))
        )
      );

      XLSX.utils.book_append_sheet(workbook, userSheet, "Profile");
      XLSX.utils.book_append_sheet(workbook, addressSheet, "Addresses");
      XLSX.utils.book_append_sheet(workbook, providerSheet, "Auth Providers");

      XLSX.writeFile(workbook, `user-data-${idUser}.xlsx`);
    } catch (error) {
      console.error("Export user data error:", error);
      alert(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Xuất dữ liệu người dùng thất bại"
      );
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    setOpenDeleteModal(true);
  };

  const handleConfirmDeleteAccount = async () => {
    const idUser = localStorage.getItem("idUser");

    if (!idUser) {
      alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      setDeleting(true);

      await axios.delete(`${USER_API}/me/${idUser}/delete-account`);

      localStorage.removeItem("token");
      localStorage.removeItem("idUser");
      localStorage.removeItem("user");
      localStorage.removeItem("authProviders");

      alert("Tài khoản đã được xóa.");
      navigate("/login");
    } catch (error) {
      console.error("Delete account error:", error);
      alert(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Xóa tài khoản thất bại"
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
            <p className="text-sm text-gray-500">
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
        desc="Permanently remove your account and all associated data."
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-red-600">
              This action cannot be undone.
            </p>
          </div>

          <HandleButtonIcon
            variant="outline"
            icon={Trash2}
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="bg-red-600! disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete Account
          </HandleButtonIcon>
        </div>
      </SectionCard>

      <ConfirmModal
        open={openDeleteModal}
        title="Xóa tài khoản vĩnh viễn"
        confirmText="Xóa tài khoản"
        loadingText="Đang xóa..."
        confirmVariant="danger"
        submitting={deleting}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleConfirmDeleteAccount}
      >
        Bạn có chắc chắn muốn xóa tài khoản này không? Hành động này sẽ xóa
        vĩnh viễn tài khoản và không thể hoàn tác.
      </ConfirmModal>
    </>
  );
};

export default PrivacyPage;
