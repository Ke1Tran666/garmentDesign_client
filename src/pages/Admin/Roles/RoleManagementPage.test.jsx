import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { roleApi } from "@/entities/user/api/roleApi";
import { userApi } from "@/entities/user/api/userApi";
import RoleManagementPage from "./RoleManagementPage";

if (typeof Element !== "undefined") {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}

const {
  outletContextState,
  showNotificationMock,
  exportToExcelMock,
  refreshSessionMock,
} = vi.hoisted(() => ({
  refreshSessionMock: vi.fn(() => Promise.resolve()),
  outletContextState: {
    adminUser: { idUser: "00001", role: "ADMIN", roleId: 1 },
    searchKeyword: "",
    refreshSession: undefined,
  },
  showNotificationMock: vi.fn(),
  exportToExcelMock: vi.fn(() => true),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useOutletContext: () => outletContextState,
  };
});

vi.mock("@/app/providers/NotificationProvider", () => ({
  useNotification: () => ({
    showNotification: showNotificationMock,
  }),
}));

vi.mock("@/entities/user/api/roleApi", () => ({
  roleApi: {
    getAll: vi.fn(),
    getPermissions: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("@/entities/user/api/userApi", () => ({
  userApi: {
    getAll: vi.fn(),
  },
}));

vi.mock("@/shared/lib/exportUtils", () => ({
  exportToExcel: (...args) => exportToExcelMock(...args),
}));

const INITIAL_PERMISSIONS = [
  {
    idPermission: 1,
    code: "SYSTEM_ADMIN",
    name: "Quản trị hệ thống",
    description: "Toàn quyền quản trị hệ thống",
  },
  {
    idPermission: 2,
    code: "ROLE_MANAGE",
    name: "Quản lý vai trò",
    description: "Quản lý danh mục vai trò",
  },
  {
    idPermission: 6,
    code: "SERVICE_ORDER_PROCESS",
    name: "Xử lý đơn dịch vụ",
    description: "Xử lý đơn dịch vụ may đo",
  },
];

const INITIAL_ROLES = [
  {
    idRole: 1,
    nameRole: "admin",
    description: "Toàn quyền quản trị hệ thống",
    scopes: ["Quản trị hệ thống", "Quản lý vai trò"],
    permissions: [INITIAL_PERMISSIONS[0], INITIAL_PERMISSIONS[1]],
    userCount: 1,
    activeUserCount: 1,
    systemRole: true,
  },
  {
    idRole: 2,
    nameRole: "staff",
    description: "Nhân viên vận hành",
    scopes: ["Xử lý đơn dịch vụ"],
    permissions: [INITIAL_PERMISSIONS[2]],
    userCount: 2,
    activeUserCount: 2,
    systemRole: true,
  },
  {
    idRole: 3,
    nameRole: "user",
    description: "Khách hàng",
    scopes: ["Đặt đơn dịch vụ"],
    permissions: [{ idPermission: 11, code: "ORDER", name: "Đặt đơn dịch vụ" }],
    userCount: 5,
    activeUserCount: 4,
    systemRole: true,
  },
  {
    idRole: 4,
    nameRole: "DESIGNER",
    description: "Thiết kế mẫu rập",
    scopes: ["Xử lý đơn dịch vụ"],
    permissions: [INITIAL_PERMISSIONS[2]],
    userCount: 2,
    activeUserCount: 2,
    systemRole: false,
  },
  {
    idRole: 5,
    nameRole: "TAILOR",
    description: "Thợ may",
    scopes: [],
    permissions: [],
    userCount: 0,
    activeUserCount: 0,
    systemRole: false,
  },
];

const renderRoleManagementPage = () =>
  render(
    <MemoryRouter>
      <RoleManagementPage />
    </MemoryRouter>,
  );

describe("RoleManagementPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    outletContextState.adminUser = {
      idUser: "00001",
      role: "admin",
      roleId: 1,
    };
    outletContextState.searchKeyword = "";
    outletContextState.refreshSession = refreshSessionMock;
    roleApi.getAll.mockResolvedValue(INITIAL_ROLES);
    roleApi.getPermissions.mockResolvedValue(INITIAL_PERMISSIONS);
    userApi.getAll.mockResolvedValue([]);
  });

  test("hiển thị phạm vi quyền hạn đang phát triển, cho sửa mọi vai trò và khóa xóa vai trò mặc định", async () => {
    const user = userEvent.setup();
    renderRoleManagementPage();

    const adminCode = await screen.findByText("admin");
    const adminRow = adminCode.closest("tr");
    expect(within(adminRow).getByText("Đang phát triển")).toBeInTheDocument();
    expect(
      within(adminRow).queryByText("Quản trị hệ thống"),
    ).not.toBeInTheDocument();
    expect(
      within(adminRow).queryByText("Quản lý vai trò"),
    ).not.toBeInTheDocument();
    expect(within(adminRow).getByTitle("Chỉnh sửa vai trò")).not.toBeDisabled();
    expect(
      within(adminRow).getByTitle(
        "Vai trò mặc định của hệ thống không thể xóa",
      ),
    ).toBeDisabled();

    const staffRow = screen.getByText("staff").closest("tr");
    expect(within(staffRow).getByText("Đang phát triển")).toBeInTheDocument();
    expect(within(staffRow).getByTitle("Chỉnh sửa vai trò")).not.toBeDisabled();
    expect(
      within(staffRow).getByTitle(
        "Vai trò mặc định của hệ thống không thể xóa",
      ),
    ).toBeDisabled();

    const userRow = screen.getByText("user").closest("tr");
    expect(within(userRow).getByText("Đang phát triển")).toBeInTheDocument();
    expect(within(userRow).getByTitle("Chỉnh sửa vai trò")).not.toBeDisabled();
    expect(
      within(userRow).getByTitle("Vai trò mặc định của hệ thống không thể xóa"),
    ).toBeDisabled();

    const designerButton = screen.getByRole("button", { name: "DESIGNER" });
    const designerRow = designerButton.closest("tr");
    expect(
      within(designerRow).getByText("Đang phát triển"),
    ).toBeInTheDocument();
    expect(
      within(designerRow).getByTitle("Chỉnh sửa vai trò"),
    ).not.toBeDisabled();
    expect(within(designerRow).getByTitle("Xóa vai trò")).not.toBeDisabled();

    const tailorRow = screen
      .getByRole("button", { name: "TAILOR" })
      .closest("tr");
    expect(within(tailorRow).getByText("Đang phát triển")).toBeInTheDocument();
    expect(
      within(tailorRow).getByTitle("Chỉnh sửa vai trò"),
    ).not.toBeDisabled();
    expect(within(tailorRow).getByTitle("Xóa vai trò")).not.toBeDisabled();
    expect(
      within(tailorRow).queryByText("Chưa thiết lập phạm vi"),
    ).not.toBeInTheDocument();

    const designerUsersLink = within(designerRow).getByRole("link", {
      name: /2 tài khoản/i,
    });
    expect(designerUsersLink).toHaveAttribute(
      "href",
      "/admin/users?role=DESIGNER",
    );

    expect(roleApi.getPermissions).not.toHaveBeenCalled();

    await user.click(within(tailorRow).getByTitle("Xem chi tiết vai trò"));
    const viewDialog = screen.getByRole("dialog");
    expect(
      within(viewDialog).getByText("Phạm vi quyền hạn"),
    ).toBeInTheDocument();
    expect(within(viewDialog).getByText("Đang phát triển")).toBeInTheDocument();
    await user.click(within(viewDialog).getByRole("button", { name: "Đóng" }));

    await user.click(screen.getByTitle("Dạng lưới Card"));
    expect(screen.getAllByText("Đang phát triển")).toHaveLength(5);
  });

  test("tạo vai trò mới chỉ nhập tên và mô tả, không đưa phạm vi quyền hạn ra form", async () => {
    const user = userEvent.setup();
    roleApi.create.mockResolvedValue({
      idRole: 6,
      nameRole: "Thiết kế rập",
      description: "Phụ trách tạo mẫu rập",
      scopes: [],
      userCount: 0,
      activeUserCount: 0,
      systemRole: false,
    });

    renderRoleManagementPage();
    await screen.findByText("admin");

    await user.click(screen.getByRole("button", { name: /Thêm vai trò/i }));

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).queryByText(/Mã tên vai trò/i),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByText(/Phạm vi quyền hạn/i),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByPlaceholderText(/Nhập phạm vi quyền mới/i),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", { name: "Thêm phạm vi" }),
    ).not.toBeInTheDocument();

    await user.type(
      within(dialog).getByLabelText(/Tên vai trò/i),
      "  Thiết kế rập ",
    );
    await user.type(
      within(dialog).getByLabelText(/Mô tả vai trò/i),
      "Phụ trách tạo mẫu rập",
    );

    await user.click(
      within(dialog).getByRole("button", { name: "Tạo vai trò" }),
    );

    await waitFor(() => {
      expect(roleApi.create).toHaveBeenCalledWith({
        nameRole: "Thiết kế rập",
        description: "Phụ trách tạo mẫu rập",
      });
    });

    expect(
      await screen.findByRole("button", { name: "Thiết kế rập" }),
    ).toBeInTheDocument();
    expect(showNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        title: "Tạo vai trò thành công",
      }),
    );
  });

  test("chặn tạo trùng tên hoặc dùng tên vai trò mặc định của hệ thống", async () => {
    const user = userEvent.setup();
    renderRoleManagementPage();
    await screen.findByRole("button", { name: "DESIGNER" });

    await user.click(screen.getByRole("button", { name: /Thêm vai trò/i }));
    const dialog = screen.getByRole("dialog");
    const input = within(dialog).getByLabelText(/Tên vai trò/i);

    await user.type(input, "admin");
    await user.click(
      within(dialog).getByRole("button", { name: "Tạo vai trò" }),
    );
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "Không thể sử dụng tên vai trò mặc định của hệ thống (admin).",
    );

    await user.clear(input);
    await user.type(input, "designer");
    await user.click(
      within(dialog).getByRole("button", { name: "Tạo vai trò" }),
    );
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      'Vai trò "designer" đã tồn tại.',
    );

    expect(roleApi.create).not.toHaveBeenCalled();
  });

  test("cho phép chỉnh sửa tên và mô tả vai trò mặc định, không gửi phạm vi quyền hạn và làm mới phiên", async () => {
    const user = userEvent.setup();
    roleApi.update.mockResolvedValue({
      idRole: 1,
      nameRole: "Quản trị viên cao cấp",
      description: "Toàn quyền hệ thống",
      scopes: ["Quản trị hệ thống", "Quản lý vai trò"],
      userCount: 1,
      activeUserCount: 1,
      systemRole: true,
    });

    renderRoleManagementPage();
    const adminCode = await screen.findByText("admin");
    const adminRow = adminCode.closest("tr");

    await user.click(within(adminRow).getByTitle("Chỉnh sửa vai trò"));

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).queryByText(/Phạm vi quyền hạn/i),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", { name: "Thêm phạm vi" }),
    ).not.toBeInTheDocument();

    const input = within(dialog).getByLabelText(/Tên vai trò/i);
    await user.clear(input);
    await user.type(input, "Quản trị viên cao cấp");

    const descInput = within(dialog).getByLabelText(/Mô tả vai trò/i);
    await user.clear(descInput);
    await user.type(descInput, "Toàn quyền hệ thống");

    await user.click(
      within(dialog).getByRole("button", { name: "Lưu thay đổi" }),
    );

    await waitFor(() => {
      expect(roleApi.update).toHaveBeenCalledWith(1, {
        nameRole: "Quản trị viên cao cấp",
        description: "Toàn quyền hệ thống",
      });
    });

    expect(refreshSessionMock).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByRole("button", { name: "Quản trị viên cao cấp" }),
    ).toBeInTheDocument();
  });

  test("chỉnh sửa vai trò tùy chỉnh và bắt buộc chọn vai trò thay thế trước khi xóa", async () => {
    const user = userEvent.setup();
    roleApi.update.mockResolvedValue({
      idRole: 4,
      nameRole: "Trưởng nhóm thiết kế",
      description: "Thiết kế mẫu rập",
      scopes: ["Xử lý đơn dịch vụ"],
      userCount: 2,
      activeUserCount: 2,
      systemRole: false,
    });
    roleApi.remove.mockResolvedValue(undefined);

    renderRoleManagementPage();
    const designerButton = await screen.findByRole("button", {
      name: "DESIGNER",
    });

    const designerRow = designerButton.closest("tr");
    await user.click(within(designerRow).getByTitle("Chỉnh sửa vai trò"));

    const dialog = screen.getByRole("dialog");
    const input = within(dialog).getByLabelText(/Tên vai trò/i);
    await user.clear(input);
    await user.type(input, "Trưởng nhóm thiết kế");
    await user.click(
      within(dialog).getByRole("button", { name: "Lưu thay đổi" }),
    );

    await waitFor(() => {
      expect(roleApi.update).toHaveBeenCalledWith(4, {
        nameRole: "Trưởng nhóm thiết kế",
        description: "Thiết kế mẫu rập",
      });
    });
    expect(
      await screen.findByRole("button", { name: "Trưởng nhóm thiết kế" }),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Đóng" }));

    const seniorRow = screen
      .getByRole("button", { name: "Trưởng nhóm thiết kế" })
      .closest("tr");
    await user.click(within(seniorRow).getByTitle("Xóa vai trò"));

    const deleteDialog = screen.getByRole("dialog");
    const confirmDeleteButton = within(deleteDialog).getByRole("button", {
      name: "Xác nhận xóa",
    });
    expect(confirmDeleteButton).toBeDisabled();

    const combobox = within(deleteDialog).getByRole("combobox", {
      name: "Vai trò thay thế",
    });
    await user.click(combobox);

    const userReplacementOption = await screen.findByRole("option", {
      name: /#3 · user/,
    });
    await user.click(userReplacementOption);

    expect(confirmDeleteButton).not.toBeDisabled();
    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(roleApi.remove).toHaveBeenCalledWith(4, 3);
    });
    expect(
      screen.queryByRole("button", { name: "Trưởng nhóm thiết kế" }),
    ).not.toBeInTheDocument();

    const userRowAfter = screen.getByText("user").closest("tr");
    expect(
      within(userRowAfter).getByRole("link", { name: /7 tài khoản/i }),
    ).toBeInTheDocument();
  });

  test("xuất Excel hiển thị cột Phạm vi quyền hạn là Đang phát triển", async () => {
    const user = userEvent.setup();
    renderRoleManagementPage();
    await screen.findByText("admin");

    await user.click(screen.getByRole("button", { name: /Xuất Excel/i }));

    expect(exportToExcelMock).toHaveBeenCalledTimes(1);
    const [exportedRows] = exportToExcelMock.mock.calls[0];
    expect(exportedRows.length).toBe(5);
    expect(exportedRows[0]).toMatchObject({
      "ID Vai trò": 1,
      "Tên vai trò": "admin",
      "Phạm vi quyền hạn": "Đang phát triển",
    });
  });

  test("ẩn nút thêm, sửa, xóa khi tài khoản đăng nhập không phải ADMIN", async () => {
    outletContextState.adminUser = {
      idUser: "00002",
      role: "staff",
      roleId: 2,
    };

    renderRoleManagementPage();
    await screen.findByRole("button", { name: "TAILOR" });

    expect(
      screen.queryByRole("button", { name: /Thêm vai trò/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTitle("Chỉnh sửa vai trò")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Xóa vai trò")).not.toBeInTheDocument();
    expect(screen.getAllByTitle("Xem chi tiết vai trò").length).toBeGreaterThan(
      0,
    );
  });
});
