import { describe, expect, test } from "vitest";

import {
  formatGender,
  getInitials,
  getPasswordStrength,
  getRoleBadge,
  getStatusInfo,
  getUserContact,
  getUserStatusValue,
} from "./userUtils";

describe("userUtils", () => {
  test("trích xuất initials đúng từ họ tên", () => {
    expect(getInitials("Staff System")).toBe("SS");
    expect(getInitials("Admin")).toBe("AD");
    expect(getInitials("Nguyễn Văn An")).toBe("NA");
    expect(getInitials("", "AD")).toBe("AD");
  });

  test("chuẩn hóa trạng thái và metadata badge người dùng", () => {
    expect(getUserStatusValue({ status: "active" })).toBe("active");
    expect(getUserStatusValue({ status: "pending" })).toBe("pending");
    expect(getUserStatusValue({ status: "banned" })).toBe("inactive");
    expect(getUserStatusValue({ status: "delete" })).toBe("deleted");
    expect(
      getUserStatusValue({
        status: "active",
        deletedAt: "2026-01-01T00:00:00",
      }),
    ).toBe("deleted");

    expect(getStatusInfo({ status: "active" }).label).toBe("Hoạt động");
    expect(getStatusInfo({ status: "pending" }).label).toBe("Chờ hoàn thiện");
    expect(getStatusInfo({ status: "inactive" }).label).toBe("Đã khóa");
    expect(getStatusInfo({ status: "delete" }).label).toBe("Đã xóa");
  });

  test("lấy thông tin liên hệ ưu tiên transient field rồi tới authProviders đang hoạt động", () => {
    expect(
      getUserContact({
        email: "user@garment.vn",
        phone: "0901234567",
      }),
    ).toEqual({
      email: "user@garment.vn",
      phone: "0901234567",
    });

    expect(
      getUserContact({
        authProviders: [
          {
            provider: "google",
            email: "google@garment.vn",
            deletedAt: null,
          },
          {
            provider: "local",
            email: "local@garment.vn",
            deletedAt: null,
          },
          {
            provider: "phone",
            phone: "0911111111",
            deletedAt: "2026-01-01",
          },
          {
            provider: "phone",
            phone: "0988888888",
            deletedAt: null,
          },
        ],
      }),
    ).toEqual({
      email: "local@garment.vn",
      phone: "0988888888",
    });
  });

  test("phân loại vai trò, giới tính và độ mạnh mật khẩu", () => {
    expect(getRoleBadge({ role: { nameRole: "ADMIN" } }).label).toBe(
      "Quản trị viên",
    );
    expect(getRoleBadge({ role: { nameRole: "STAFF" } }).label).toBe(
      "Nhân viên",
    );
    expect(getRoleBadge({ role: { nameRole: "USER" } }).label).toBe(
      "Khách hàng",
    );

    expect(formatGender("Male")).toBe("Nam");
    expect(formatGender("Female")).toBe("Nữ");
    expect(formatGender("Unknown")).toBe("Không xác định");

    expect(getPasswordStrength("abc").label).toBe("Yếu");
    expect(getPasswordStrength("Abcd1234").label).toBe("Trung bình");
    expect(getPasswordStrength("Abcd1234!").label).toBe("Mạnh");
  });
});
