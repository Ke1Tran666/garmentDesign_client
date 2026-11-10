import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import ProfilePage from "./ProfilePage";
import { userApi } from "@/entities/user/api/userApi";

const { showNotificationMock, refreshSessionMock } = vi.hoisted(() => ({
  showNotificationMock: vi.fn(),
  refreshSessionMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/entities/user/api/userApi", () => ({
  userApi: {
    getMe: vi.fn(),
    update: vi.fn(),
    uploadAvatar: vi.fn(),
    removeAvatar: vi.fn(),
  },
}));

vi.mock("@/features/auth/model/useAuth", () => ({
  useAuth: () => ({
    refreshSession: refreshSessionMock,
  }),
}));

vi.mock("@/app/providers/NotificationProvider", () => ({
  useNotification: () => ({
    showNotification: showNotificationMock,
  }),
}));

const baseProfile = {
  user: {
    idUser: 12,
    userCode: "TRAU0347689",
    fullName: "Nguyễn Văn An",
    gender: "Male",
    birthday: "1998-05-12",
    avatar: "",
    status: "active",
  },
  authProviders: [
    {
      provider: "local",
      email: "an.nguyen@garment.vn",
      emailVerifiedAt: "2026-01-01T00:00:00Z",
    },
  ],
};

const renderProfilePage = () =>
  render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>,
  );

describe("ProfilePage AvatarPicker integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userApi.getMe.mockResolvedValue(baseProfile);
    userApi.update.mockResolvedValue({ success: true });
    userApi.uploadAvatar.mockResolvedValue({ success: true });
    userApi.removeAvatar.mockResolvedValue({ success: true });

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:avatar-preview");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("hiển thị AvatarPicker giống trang quản trị và không dùng nút Tải ảnh lên cũ", async () => {
    renderProfilePage();

    expect(
      await screen.findByRole("heading", { name: /Hồ sơ cá nhân/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("Chọn ảnh")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Xóa ảnh/i })).toBeDisabled();
    expect(screen.queryByText("Tải ảnh lên")).not.toBeInTheDocument();
    expect(screen.getByText("NA")).toBeInTheDocument();
  });

  test("chọn ảnh đại diện mới và tải lên khi lưu hồ sơ", async () => {
    const user = userEvent.setup();
    renderProfilePage();

    await screen.findByText("Chọn ảnh");

    const fileInput = screen.getByLabelText("Chọn ảnh");
    const pngFile = new File(["avatar-bytes"], "avatar.png", {
      type: "image/png",
    });

    await user.upload(fileInput, pngFile);

    expect(screen.getByText("Thay ảnh")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Xóa ảnh/i })).not.toBeDisabled();

    await user.click(
      screen.getAllByRole("button", { name: /Lưu thay đổi/i })[0],
    );

    await waitFor(() => {
      expect(userApi.update).toHaveBeenCalledTimes(1);
      expect(userApi.uploadAvatar).toHaveBeenCalledTimes(1);
    });
  });

  test("xóa ảnh đại diện hiện có và gọi API removeAvatar khi lưu", async () => {
    const user = userEvent.setup();
    userApi.getMe.mockResolvedValue({
      ...baseProfile,
      user: {
        ...baseProfile.user,
        avatar: "https://cdn.example.com/old-avatar.png",
      },
    });

    renderProfilePage();

    expect(await screen.findByText("Thay ảnh")).toBeInTheDocument();

    const removeBtn = screen.getByRole("button", { name: /Xóa ảnh/i });
    expect(removeBtn).not.toBeDisabled();

    await user.click(removeBtn);

    expect(screen.getByText("Chọn ảnh")).toBeInTheDocument();
    expect(removeBtn).toBeDisabled();

    await user.click(
      screen.getAllByRole("button", { name: /Lưu thay đổi/i })[0],
    );

    await waitFor(() => {
      expect(userApi.removeAvatar).toHaveBeenCalledTimes(1);
    });
  });
});
