import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import UserAddressSection from "./UserAddressSection";

vi.mock("@/app/providers/NotificationProvider", () => ({
  useNotification: () => ({
    showNotification: vi.fn(),
  }),
}));

const mockUser = {
  idUser: "00001",
  fullName: "Nguyễn Văn Test",
  defaultAddress: { addressId: 1 },
  addresses: [
    {
      addressId: 1,
      companyName: "Công ty Thời trang A",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      note: "Giao giờ hành chính",
    },
    {
      addressId: 2,
      companyName: "Xưởng may Chi nhánh 2",
      address: "456 CMT8, Quận 3, TP.HCM",
      note: "",
    },
  ],
};

describe("UserAddressSection Component", () => {
  test("hiển thị DataTable với danh sách địa chỉ của người dùng", () => {
    render(<UserAddressSection user={mockUser} canEditUser={true} />);

    // Kiểm tra các cột trong bảng DataTable
    expect(screen.getByText("Trạng thái")).toBeInTheDocument();
    expect(screen.getByText("Tên công ty / Người nhận")).toBeInTheDocument();
    expect(screen.getByText("Địa chỉ chi tiết")).toBeInTheDocument();
    expect(screen.getByText("Ghi chú")).toBeInTheDocument();

    // Kiểm tra dữ liệu từng hàng
    expect(screen.getByText("Công ty Thời trang A")).toBeInTheDocument();
    expect(
      screen.getByText("123 Nguyễn Huệ, Quận 1, TP.HCM"),
    ).toBeInTheDocument();
    expect(screen.getByText("Giao giờ hành chính")).toBeInTheDocument();
    expect(screen.getByText("Mặc định")).toBeInTheDocument();

    expect(screen.getByText("Xưởng may Chi nhánh 2")).toBeInTheDocument();
    expect(screen.getByText("456 CMT8, Quận 3, TP.HCM")).toBeInTheDocument();
    expect(screen.getByText("Địa chỉ phụ")).toBeInTheDocument();
  });

  test("hiển thị trạng thái rỗng khi người dùng chưa có địa chỉ", () => {
    render(
      <UserAddressSection
        user={{ ...mockUser, addresses: [] }}
        canEditUser={true}
      />,
    );

    expect(screen.getByText("Người dùng chưa có địa chỉ.")).toBeInTheDocument();
  });

  test("cho phép mở modal thêm địa chỉ khi có quyền chỉnh sửa", async () => {
    const user = userEvent.setup();
    render(<UserAddressSection user={mockUser} canEditUser={true} />);

    const addButton = screen.getByRole("button", { name: "Thêm địa chỉ" });
    await user.click(addButton);

    expect(
      screen.getByText("Thêm địa chỉ cho Nguyễn Văn Test."),
    ).toBeInTheDocument();
  });
});
