import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { serviceOrderApi } from "@/entities/service-order/api/serviceOrderApi";
import { roleApi } from "@/entities/user/api/roleApi";
import { userApi } from "@/entities/user/api/userApi";
import UserDetailPage from "./UserDetailPage";

const { outletContextState, showNotificationMock, refreshSessionMock } =
  vi.hoisted(() => ({
    refreshSessionMock: vi.fn(() => Promise.resolve()),
    outletContextState: {
      adminUser: { idUser: "00001", role: "ADMIN" },
      refreshSession: undefined,
    },
    showNotificationMock: vi.fn(),
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

vi.mock("@/entities/user/api/userApi", () => ({
  userApi: {
    getById: vi.fn(),
    getMe: vi.fn(),
    updateById: vi.fn(),
    uploadAvatarById: vi.fn(),
    removeAvatarById: vi.fn(),
    updateRole: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("@/entities/user/api/roleApi", () => ({
  roleApi: {
    getAll: vi.fn(),
  },
}));

vi.mock("@/entities/service-order/api/serviceOrderApi", () => ({
  serviceOrderApi: {
    getAll: vi.fn(),
  },
}));

const MOCK_PROFILE_RESPONSE = {
  user: {
    idUser: "00001",
    userCode: "TRIM0100001",
    fullName: "Nguyễn Quản Trị",
    birthday: "1995-03-20",
    gender: "Male",
    status: "active",
    createdAt: "2026-01-10T08:00:00",
    updatedAt: "2026-03-15T10:30:00",
    lastLogin: "2026-03-16T09:00:00",
    role: {
      idRole: 1,
      nameRole: "ADMIN",
    },
  },
  authProviders: [
    {
      id: 10,
      provider: "local",
      email: "admin@garment.vn",
      emailVerifiedAt: "2026-01-10T08:05:00",
    },
    {
      id: 11,
      provider: "phone",
      phone: "0912345678",
      phoneVerifiedAt: "2026-01-10T08:10:00",
    },
  ],
  addresses: [
    {
      addressId: 5,
      companyName: "Xưởng may Hoa Trần",
      address: "123 Lê Lợi, Quận 1, TP.HCM",
      note: "Văn phòng chính",
    },
  ],
  defaultAddress: {
    addressId: 5,
  },
};

const renderUserDetailPage = (route = "/admin/users/00001") =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/admin/users/:userId" element={<UserDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe("UserDetailPage (Admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    outletContextState.adminUser = { idUser: "00001", role: "ADMIN" };
    outletContextState.refreshSession = refreshSessionMock;
    userApi.getById.mockResolvedValue(MOCK_PROFILE_RESPONSE);
    userApi.getMe.mockResolvedValue(MOCK_PROFILE_RESPONSE);
    roleApi.getAll.mockResolvedValue([
      { idRole: 1, nameRole: "ADMIN" },
      { idRole: 2, nameRole: "STAFF" },
    ]);
    serviceOrderApi.getAll.mockResolvedValue([
      {
        serviceOrderId: 101,
        productName: "Áo sơ mi công sở",
        service: { serviceName: "Thiết kế rập mẫu" },
        user: { idUser: "00001" },
        status: "active",
        totalPrice: 450000,
        createdAt: "2026-03-14T09:00:00",
      },
      {
        serviceOrderId: 102,
        productName: "Quần tây nam",
        service: { serviceName: "In sơ đồ vi tính" },
        user: { idUser: "00009" },
        updatedBy: "00001",
        status: "completed",
        totalPrice: 280000,
        updatedAt: "2026-03-16T11:00:00",
      },
      {
        serviceOrderId: 103,
        productName: "Đơn khác",
        user: { idUser: "00008" },
        status: "pending",
        totalPrice: 120000,
      },
    ]);
  });

  test("hiển thị đầy đủ hồ sơ cá nhân và thông tin liên quan trong trang admin", async () => {
    renderUserDetailPage("/admin/users/00001");

    expect(
      await screen.findByRole("heading", { name: "Nguyễn Quản Trị" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Hồ sơ cá nhân").length).toBeGreaterThan(0);
    expect(screen.getAllByText("admin@garment.vn").length).toBeGreaterThan(0);
    expect(screen.getByText("0912345678")).toBeInTheDocument();
    expect(screen.getByText("Xưởng may Hoa Trần")).toBeInTheDocument();

    expect(screen.getByText("Đơn dịch vụ liên quan")).toBeInTheDocument();
    expect(screen.getByText("ORD-101")).toBeInTheDocument();
    expect(screen.getByText("Khách đặt đơn")).toBeInTheDocument();
    expect(screen.getByText("ORD-102")).toBeInTheDocument();
    expect(screen.getByText("Phụ trách xử lý")).toBeInTheDocument();
    expect(screen.queryByText("ORD-103")).not.toBeInTheDocument();
  });

  test("đồng bộ lại phiên đăng nhập khi cập nhật thông tin cá nhân trên trang chi tiết", async () => {
    const user = userEvent.setup();
    const updatedResponse = {
      ...MOCK_PROFILE_RESPONSE,
      user: {
        ...MOCK_PROFILE_RESPONSE.user,
        fullName: "Nguyễn Quản Trị Mới",
      },
    };
    userApi.updateById.mockResolvedValue(updatedResponse.user);
    userApi.getById
      .mockResolvedValueOnce(MOCK_PROFILE_RESPONSE)
      .mockResolvedValueOnce(updatedResponse);

    renderUserDetailPage("/admin/users/00001");
    await screen.findByRole("heading", { name: "Nguyễn Quản Trị" });

    await user.click(
      screen.getByRole("button", { name: /Chỉnh sửa danh tính/i }),
    );
    const fullNameInput = screen.getByLabelText("Họ và tên");
    await user.clear(fullNameInput);
    await user.type(fullNameInput, "Nguyễn Quản Trị Mới");

    await user.click(screen.getByRole("button", { name: "Lưu" }));

    await waitFor(() => {
      expect(userApi.updateById).toHaveBeenCalledWith("00001", {
        fullName: "Nguyễn Quản Trị Mới",
        birthday: "1995-03-20",
        gender: "Male",
        phone: null,
      });
    });

    expect(refreshSessionMock).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByRole("heading", { name: "Nguyễn Quản Trị Mới" }),
    ).toBeInTheDocument();
  });

  test("hỗ trợ đường dẫn /admin/users/me bằng cách gọi userApi.getMe", async () => {
    renderUserDetailPage("/admin/users/me");

    expect(
      await screen.findByRole("heading", { name: "Nguyễn Quản Trị" }),
    ).toBeInTheDocument();
    expect(userApi.getMe).toHaveBeenCalledTimes(1);
    expect(userApi.getById).not.toHaveBeenCalled();
  });
});
