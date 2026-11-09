import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { roleApi } from "@/entities/user/api/roleApi";
import { userApi } from "@/entities/user/api/userApi";
import UserCreatePage from "./UserCreatePage";

const { navigateMock, showNotificationMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  showNotificationMock: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
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
  },
}));

vi.mock("@/entities/user/api/userApi", () => ({
  userApi: {
    create: vi.fn(),
    uploadAvatarById: vi.fn(),
  },
}));

const renderUserCreatePage = () =>
  render(
    <MemoryRouter>
      <UserCreatePage />
    </MemoryRouter>,
  );

const fillRequiredFields = async (user, container) => {
  await user.type(
    screen.getByPlaceholderText("Ví dụ: Nguyễn Văn An"),
    "Nguyễn Văn Bình",
  );
  await user.type(
    screen.getByPlaceholderText("user@garment.vn"),
    "binh@garment.vn",
  );
  await user.type(
    screen.getByPlaceholderText("Tối thiểu 8 ký tự"),
    "Password123!",
  );
  await user.type(
    screen.getByPlaceholderText("Nhập lại mật khẩu"),
    "Password123!",
  );

  const birthdayInput = container.querySelector('input[name="birthday"]');
  fireEvent.change(birthdayInput, { target: { value: "1998-05-15" } });
};

describe("UserCreatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    roleApi.getAll.mockResolvedValue([
      { idRole: 3, nameRole: "USER", descriptionRole: "Khách hàng" },
      { idRole: 2, nameRole: "STAFF", descriptionRole: "Nhân viên" },
    ]);
    userApi.create.mockResolvedValue({
      idUser: "12345",
      fullName: "Nguyễn Văn Bình",
    });
    userApi.uploadAvatarById.mockResolvedValue({
      avatar: "http://localhost:8082/uploads/12345/avatar/test.png",
    });

    if (!URL.createObjectURL) {
      URL.createObjectURL = vi.fn(() => "blob:avatar-preview");
    } else {
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:avatar-preview");
    }
    if (!URL.revokeObjectURL) {
      URL.revokeObjectURL = vi.fn();
    } else {
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("tạo người dùng thành công khi bỏ qua ảnh đại diện", async () => {
    const user = userEvent.setup();
    const { container } = renderUserCreatePage();

    await screen.findByText("STAFF");
    await fillRequiredFields(user, container);

    await user.click(
      screen.getByRole("button", { name: /Khởi tạo tài khoản/i }),
    );

    await waitFor(() => {
      expect(userApi.create).toHaveBeenCalledTimes(1);
    });

    expect(userApi.uploadAvatarById).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/admin/users/12345", {
      replace: true,
    });
  });

  test("tạo người dùng và tải lên ảnh đại diện khi người dùng chọn ảnh hợp lệ", async () => {
    const user = userEvent.setup();
    const { container } = renderUserCreatePage();

    await screen.findByText("STAFF");
    await fillRequiredFields(user, container);

    const fileInput = container.querySelector('input[type="file"]');
    const avatarFile = new File(["png-bytes"], "avatar.png", {
      type: "image/png",
    });
    await user.upload(fileInput, avatarFile);

    await user.click(
      screen.getByRole("button", { name: /Khởi tạo tài khoản/i }),
    );

    await waitFor(() => {
      expect(userApi.create).toHaveBeenCalledTimes(1);
      expect(userApi.uploadAvatarById).toHaveBeenCalledWith(
        "12345",
        avatarFile,
      );
    });

    expect(navigateMock).toHaveBeenCalledWith("/admin/users/12345", {
      replace: true,
    });
  });

  test("báo lỗi định dạng khi chọn file không phải JPEG hoặc PNG", async () => {
    const { container } = renderUserCreatePage();

    await screen.findByText("STAFF");

    const fileInput = container.querySelector('input[type="file"]');
    const invalidFile = new File(["gif"], "avatar.gif", { type: "image/gif" });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(
      screen.getByText("Chỉ chấp nhận ảnh JPEG hoặc PNG."),
    ).toBeInTheDocument();
  });
});
