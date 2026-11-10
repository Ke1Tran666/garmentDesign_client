import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import AdminUserDropdown from "./AdminUserDropdown";
import AdminUserProfile from "./AdminUserProfile";

describe("AdminUserDropdown & AdminUserProfile", () => {
  test("liên kết Hồ sơ cá nhân trỏ tới trang chi tiết người dùng trong admin theo idUser", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();

    render(
      <MemoryRouter>
        <AdminUserDropdown
          user={{
            idUser: "00001",
            userCode: "ANHM0100001",
            fullName: "Nguyễn Quản Trị",
            role: "ADMIN",
          }}
          onLogout={onLogout}
        />
      </MemoryRouter>,
    );

    await user.click(
      screen.getByRole("button", { name: /Menu tài khoản quản trị/i }),
    );

    const profileLink = screen.getByRole("link", { name: /Hồ sơ cá nhân/i });
    expect(profileLink).toHaveAttribute("href", "/admin/users/00001");
    expect(
      screen.queryByRole("link", { name: /Khu vực khách hàng/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Cài đặt")).toBeInTheDocument();
    expect(screen.getByText("Đang phát triển")).toBeInTheDocument();

    await user.click(profileLink);
    expect(
      screen.queryByRole("link", { name: /Hồ sơ cá nhân/i }),
    ).not.toBeInTheDocument();
  });

  test("dùng đường dẫn dự phòng /admin/users khi chưa có idUser", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AdminUserDropdown
          user={{
            fullName: "Nhân Viên Vận Hành",
            role: "STAFF",
          }}
          onLogout={vi.fn()}
        />
      </MemoryRouter>,
    );

    await user.click(
      screen.getByRole("button", { name: /Menu tài khoản quản trị/i }),
    );

    expect(
      screen.getByRole("link", { name: /Hồ sơ cá nhân/i }),
    ).toHaveAttribute("href", "/admin/users");
  });

  test("AdminUserProfile ở sidebar và drawer cũng liên kết tới trang chi tiết người dùng admin", async () => {
    const user = userEvent.setup();
    const onProfileClick = vi.fn();

    render(
      <MemoryRouter>
        <AdminUserProfile
          user={{
            idUser: "00002",
            fullName: "Trần Nhân Viên",
            role: "STAFF",
          }}
          onLogout={vi.fn()}
          onProfileClick={onProfileClick}
          variant="drawer"
        />
      </MemoryRouter>,
    );

    const drawerProfileLink = screen.getByRole("link", {
      name: /Trần Nhân Viên/i,
    });
    expect(drawerProfileLink).toHaveAttribute("href", "/admin/users/00002");

    await user.click(drawerProfileLink);
    expect(onProfileClick).toHaveBeenCalledTimes(1);
  });
});
