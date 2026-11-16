import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import UserLayout from "./UserLayout";

const logoutMock = vi.fn().mockResolvedValue(undefined);
const refreshSessionMock = vi.fn().mockResolvedValue(undefined);

vi.mock("@/features/auth/model/useAuth", () => ({
  useAuth: () => ({
    user: {
      idUser: "US001",
      userCode: "KH001",
      fullName: "Nguyễn Văn A",
      role: "USER",
    },
    logout: logoutMock,
    refreshSession: refreshSessionMock,
  }),
}));

vi.mock("@/shared/ui/notification/NotificationButton", () => ({
  default: () => <button type="button">Notifications</button>,
}));

describe("UserLayout", () => {
  test("hiển thị sidebar điều hướng đầy đủ và menu người dùng", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/user/dashboard"]}>
        <Routes>
          <Route path="/user" element={<UserLayout />}>
            <Route path="dashboard" element={<div>Nội dung Dashboard</div>} />
            <Route path="profile" element={<div>Nội dung Hồ sơ</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getAllByText("Bảng điều khiển").length).toBeGreaterThan(0);
    expect(screen.getByText("Đơn dịch vụ")).toBeInTheDocument();
    expect(screen.getByText("Đánh giá dịch vụ")).toBeInTheDocument();
    expect(screen.getByText("Hồ sơ cá nhân")).toBeInTheDocument();
    expect(screen.getByText("Sổ địa chỉ")).toBeInTheDocument();
    expect(screen.getByText("Bảo mật")).toBeInTheDocument();
    expect(screen.getByText("Quyền riêng tư")).toBeInTheDocument();
    expect(screen.getByText("Nội dung Dashboard")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Menu tài khoản người dùng" }),
    );

    expect(
      screen.getByRole("link", { name: /Đơn dịch vụ của tôi/i }),
    ).toHaveAttribute("href", "/user/service-order");

    const profileLinks = screen.getAllByRole("link", {
      name: /Hồ sơ cá nhân/i,
    });
    expect(profileLinks.length).toBe(2);

    await user.click(profileLinks[1]);
    expect(screen.getByText("Nội dung Hồ sơ")).toBeInTheDocument();
  });
});
