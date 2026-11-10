import { useState } from "react";
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import { useNotification } from "@/app/providers/NotificationProvider";
import { userApi } from "@/entities/user/api/userApi";
import { useAuth } from "@/features/auth/model/useAuth";
import PageHeader from "@/shared/ui/heading/PageHeader";
import ConfirmModal from "@/shared/ui/modal/ConfirmModal";
import { PortalSectionCard } from "@/shared/ui/section/Section";

const PrivacyPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

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
    return XLSX.utils.json_to_sheet(Array.isArray(rows) ? rows : [], {
      header: headers,
    });
  };

  const handleDownloadData = async () => {
    try {
      setExporting(true);

      const exportData = await userApi.exportData();
      const { user, addresses = [], authProviders = [] } = exportData;

      if (!user) {
        throw new Error("Dữ liệu người dùng không hợp lệ");
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
          "Default Address ID": user.defaultAddressId ?? "",
          Status: user.status ?? "",
          "Last Login": formatDateTime(user.lastLogin),
          "Created At": formatDateTime(user.createdAt),
          "Updated At": formatDateTime(user.updatedAt),
          "Deleted At": formatDateTime(user.deletedAt),
        },
      ];

      const addressRows = addresses.map((address) => ({
        "Address ID": address.addressId ?? "",
        "ID User": address.idUser ?? "",
        "Company Name": address.companyName ?? "",
        Address: address.address ?? "",
        Note: address.note ?? "",
        "Is Default": address.isDefault ? "Yes" : "No",
        "Created At": formatDateTime(address.createdAt),
        "Updated At": formatDateTime(address.updatedAt),
        "Deleted At": formatDateTime(address.deletedAt),
      }));

      const providerRows = authProviders.map((provider) => ({
        "Provider ID": provider.id ?? "",
        "ID User": provider.idUser ?? "",
        Provider: provider.provider ?? "",
        Email: provider.email ?? "",
        Phone: provider.phone ?? "",
        "External Provider ID": provider.providerId ?? "",
        "Email Verified At": formatDateTime(provider.emailVerifiedAt),
        "Phone Verified At": formatDateTime(provider.phoneVerifiedAt),
        "Created At": formatDateTime(provider.createdAt),
        "Updated At": formatDateTime(provider.updatedAt),
        "Deleted At": formatDateTime(provider.deletedAt),
      }));

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
      const userSheet = createSheet(userRows, userHeaders);
      const addressSheet = createSheet(addressRows, addressHeaders);
      const providerSheet = createSheet(providerRows, providerHeaders);

      XLSX.utils.book_append_sheet(workbook, userSheet, "User Information");
      XLSX.utils.book_append_sheet(workbook, addressSheet, "Addresses");
      XLSX.utils.book_append_sheet(workbook, providerSheet, "Auth Providers");

      const exportUserCode = user.userCode || user.idUser || "me";
      XLSX.writeFile(workbook, `user-data-${exportUserCode}.xlsx`);

      showNotification(
        "success",
        "Xuất dữ liệu thành công",
        `Đã tải xuống tệp user-data-${exportUserCode}.xlsx.`,
      );
    } catch (error) {
      console.error("Export user data error:", error);

      showNotification(
        "error",
        "Xuất dữ liệu thất bại",
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Không thể xuất dữ liệu người dùng.",
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

      showNotification(
        "success",
        "Tài khoản đã được đóng",
        "Bạn có thể liên hệ bộ phận hỗ trợ nếu muốn khôi phục tài khoản.",
      );

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Delete account error:", error);

      showNotification(
        "error",
        "Xóa tài khoản thất bại",
        error?.response?.data?.message ||
          error?.response?.data ||
          "Không thể đóng tài khoản.",
      );
    } finally {
      setDeleting(false);
      setOpenDeleteModal(false);
    }
  };

  return (
    <div className="animate-in space-y-6 duration-200 fade-in">
      {/* 1. Page Header */}
      <PageHeader
        title="Quyền riêng tư & Dữ liệu"
        description="Tải xuống bản sao dữ liệu cá nhân hoặc quản lý trạng thái kích hoạt tài khoản."
      />

      {/* 2. 2-Column Privacy Cards */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {/* Export Personal Data */}
        <PortalSectionCard
          title="Xuất dữ liệu cá nhân"
          description="Tải xuống bản sao toàn bộ thông tin tài khoản của bạn"
          icon={FileSpreadsheet}
        >
          <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
            Tệp Excel xuất ra bao gồm đầy đủ thông tin hồ sơ cá nhân, sổ địa chỉ
            giao nhận và các phương thức đăng nhập đã liên kết với tài khoản của
            bạn.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center text-[11px] font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
            <div className="rounded-lg bg-white px-2 py-2 shadow-2xs dark:bg-slate-900">
              Hồ sơ cá nhân
            </div>
            <div className="rounded-lg bg-white px-2 py-2 shadow-2xs dark:bg-slate-900">
              Sổ địa chỉ
            </div>
            <div className="rounded-lg bg-white px-2 py-2 shadow-2xs dark:bg-slate-900">
              Liên kết xác thực
            </div>
          </div>

          <div className="mt-5 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={handleDownloadData}
              disabled={exporting}
              className="inline-flex h-9.5 cursor-pointer items-center gap-2 rounded-xl bg-brand! px-4 text-xs font-semibold text-white! shadow-sm shadow-brand/25 transition hover:bg-brand-hover! disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={15} />
              <span>
                {exporting
                  ? "Đang xuất dữ liệu..."
                  : "Tải xuống dữ liệu (.xlsx)"}
              </span>
            </button>
          </div>
        </PortalSectionCard>

        {/* Delete / Deactivate Account */}
        <PortalSectionCard
          title="Vô hiệu hóa & Xóa tài khoản"
          description="Đóng tài khoản và đăng xuất khỏi tất cả thiết bị"
          icon={ShieldAlert}
          iconClassName="bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
          className="border-rose-200/80 dark:border-rose-900/50"
        >
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200/70 bg-rose-50/70 p-3.5 text-xs leading-5 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>
              Sau khi xác nhận, tài khoản sẽ bị vô hiệu hóa ngay lập tức và đăng
              xuất khỏi mọi phiên làm việc. Vui lòng liên hệ bộ phận hỗ trợ nếu
              bạn muốn khôi phục tài khoản sau này.
            </span>
          </div>

          <div className="mt-5 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="inline-flex h-9.5 cursor-pointer items-center gap-2 rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={15} />
              <span>{deleting ? "Đang xử lý..." : "Xóa tài khoản"}</span>
            </button>
          </div>
        </PortalSectionCard>
      </div>

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
    </div>
  );
};

export default PrivacyPage;
