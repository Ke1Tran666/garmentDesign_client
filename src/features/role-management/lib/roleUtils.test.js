import { describe, expect, test } from "vitest";

import {
  canDeleteRole,
  canEditRole,
  getRoleActiveUserCount,
  getRoleProfile,
  getRoleScopes,
  getRoleUserCount,
  isSystemRole,
  normalizeRoleCode,
  normalizeRoleCompareKey,
  normalizeRoleNameInput,
  validateRoleName,
} from "./roleUtils";

describe("roleUtils", () => {
  test("normalizeRoleNameInput, normalizeRoleCompareKey và normalizeRoleCode chuẩn hóa đúng", () => {
    expect(normalizeRoleNameInput("  Thiết   kế rập  ")).toBe("Thiết kế rập");
    expect(normalizeRoleCompareKey("  qa  manager  ")).toBe("QA MANAGER");
    expect(normalizeRoleCode("  qa  manager  ")).toBe("QA_MANAGER");
    expect(normalizeRoleCode("designer")).toBe("DESIGNER");
    expect(normalizeRoleNameInput(null)).toBe("");
  });

  test("validateRoleName cho phép tên tiếng Việt tự nhiên và kiểm tra rỗng, độ dài, slot hệ thống", () => {
    expect(validateRoleName("")).toBe("Vui lòng nhập tên vai trò.");
    expect(validateRoleName("   ")).toBe("Vui lòng nhập tên vai trò.");
    expect(validateRoleName("A")).toBe(
      "Tên vai trò phải có độ dài từ 2 đến 50 ký tự.",
    );
    expect(validateRoleName("A".repeat(51))).toBe(
      "Tên vai trò phải có độ dài từ 2 đến 50 ký tự.",
    );
    expect(validateRoleName("--Designer")).toContain(
      "bắt đầu bằng chữ cái hoặc số",
    );
    expect(validateRoleName("Thiết kế\nrập")).toContain("xuống dòng");
    expect(validateRoleName("  Thiết kế rập  ", { disallowSystem: true })).toBe(
      "",
    );
    expect(validateRoleName("2nd Tailor - VIP", { disallowSystem: true })).toBe(
      "",
    );

    expect(validateRoleName("admin", { disallowSystem: true })).toContain(
      "Không thể sử dụng tên vai trò mặc định của hệ thống",
    );
    expect(validateRoleName("ADMIN", { disallowSystem: false })).toBe("");
    expect(
      validateRoleName("  Quản trị viên cao cấp ", {
        editingRoleId: 1,
        currentRoleName: "admin",
      }),
    ).toBe("");
    expect(
      validateRoleName("ADMIN", {
        editingRoleId: 1,
        currentRoleName: "Quản trị viên cao cấp",
      }),
    ).toBe("");
    expect(
      validateRoleName("STAFF", {
        editingRoleId: 1,
        currentRoleName: "ADMIN",
      }),
    ).toContain("chỉ dành cho vai trò mặc định tương ứng");
    expect(
      validateRoleName("admin", {
        editingRoleId: 4,
        currentRoleName: "Thiết kế rập",
      }),
    ).toContain("chỉ dành cho vai trò mặc định tương ứng");
  });

  test("isSystemRole nhận diện các vai trò lõi và cờ systemRole", () => {
    expect(isSystemRole("ADMIN")).toBe(true);
    expect(isSystemRole("staff")).toBe(true);
    expect(isSystemRole({ idRole: 3, nameRole: "USER" })).toBe(true);
    expect(isSystemRole({ idRole: 3, nameRole: "Khách hàng VIP" })).toBe(true);
    expect(
      isSystemRole({ idRole: 9, nameRole: "LEGACY", systemRole: true }),
    ).toBe(true);

    expect(isSystemRole({ idRole: 4, nameRole: "Thiết kế rập" })).toBe(false);
    expect(isSystemRole("Thiết kế rập")).toBe(false);
    expect(isSystemRole(null)).toBe(false);
  });

  test("canEditRole cho phép sửa mọi vai trò và canDeleteRole bảo vệ vai trò mặc định", () => {
    const adminRole = { idRole: 1, nameRole: "admin", userCount: 1 };
    const renamedUserRole = { idRole: 3, nameRole: "Khách hàng", userCount: 5 };
    const inUseCustom = { idRole: 4, nameRole: "Thiết kế rập", userCount: 2 };
    const unusedCustom = { idRole: 5, nameRole: "Thợ may", userCount: 0 };
    const allRoles = [adminRole, renamedUserRole, inUseCustom, unusedCustom];

    expect(canEditRole(adminRole)).toBe(true);
    expect(canEditRole(renamedUserRole)).toBe(true);
    expect(canEditRole(inUseCustom)).toBe(true);
    expect(canEditRole(unusedCustom)).toBe(true);
    expect(canEditRole(null)).toBe(false);

    expect(canDeleteRole(adminRole, allRoles)).toBe(false);
    expect(canDeleteRole(renamedUserRole, allRoles)).toBe(false);
    expect(canDeleteRole(inUseCustom, allRoles)).toBe(true);
    expect(canDeleteRole(unusedCustom, allRoles)).toBe(true);
    expect(canDeleteRole(unusedCustom, [unusedCustom])).toBe(false);
    expect(canDeleteRole({ idRole: 6, nameRole: "QA" })).toBe(true);
    expect(canDeleteRole(null)).toBe(false);
  });

  test("getRoleScopes và getRoleProfile đọc mô tả & phạm vi quyền động từ backend", () => {
    expect(getRoleUserCount({ userCount: 5 })).toBe(5);
    expect(getRoleUserCount({ userCount: -2 })).toBe(0);
    expect(getRoleActiveUserCount({ activeUserCount: 3 })).toBe(3);

    expect(
      getRoleScopes({
        idRole: 4,
        scopes: ["Xử lý đơn dịch vụ", "Kiểm duyệt rập"],
      }),
    ).toEqual(["Xử lý đơn dịch vụ", "Kiểm duyệt rập"]);

    expect(
      getRoleScopes({
        idRole: 2,
        permissions: [
          { idPermission: 5, code: "ADMIN_PORTAL", name: "Cổng vận hành" },
        ],
      }),
    ).toEqual(["Cổng vận hành"]);

    expect(
      getRoleProfile({
        idRole: 1,
        nameRole: "admin",
        description: "Mô tả từ DB",
        scopes: ["Quản trị hệ thống"],
      }),
    ).toMatchObject({
      code: "admin",
      label: "Quản trị viên",
      description: "Mô tả từ DB",
      scopes: ["Quản trị hệ thống"],
      isSystem: true,
    });

    expect(
      getRoleProfile({ idRole: 1, nameRole: "Quản trị viên cao cấp" }),
    ).toMatchObject({
      code: "Quản trị viên cao cấp",
      label: "Quản trị viên cao cấp",
      description: "",
      scopes: [],
      isSystem: true,
    });

    expect(getRoleProfile({ idRole: 2, nameRole: "staff" })).toMatchObject({
      code: "staff",
      label: "Nhân viên",
      isSystem: true,
    });

    expect(getRoleProfile({ idRole: 3, nameRole: "user" })).toMatchObject({
      code: "user",
      label: "Khách hàng",
      isSystem: true,
    });

    expect(
      getRoleProfile({
        idRole: 4,
        nameRole: "Thiết kế rập",
        description: "Thiết kế mẫu rập may đo",
        permissions: [{ idPermission: 6, name: "Xử lý đơn dịch vụ" }],
      }),
    ).toMatchObject({
      code: "Thiết kế rập",
      label: "Thiết kế rập",
      description: "Thiết kế mẫu rập may đo",
      scopes: ["Xử lý đơn dịch vụ"],
      isSystem: false,
    });
  });
});
