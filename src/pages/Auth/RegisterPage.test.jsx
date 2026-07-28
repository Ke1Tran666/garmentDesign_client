import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import RegisterPage from "./RegisterPage";
import { authApi } from "@/api/authApi";

const { showNotificationMock } = vi.hoisted(
  () => ({
    showNotificationMock: vi.fn(),
  }),
);

vi.mock("@/api/authApi", () => ({
  authApi: {
    register: vi.fn(),
  },
}));

vi.mock(
  "@/components/ui/Notification/NotificationContext",
  () => ({
    useNotification: () => ({
      showNotification: showNotificationMock,
    }),
  }),
);

const renderRegisterPage = () => {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );
};

const createUser = () => userEvent.setup();

const fillRegisterForm = async (user) => {
  await user.type(
    screen.getByPlaceholderText(
      "Email đăng nhập",
    ),
    "register@example.com",
  );

  await user.type(
    screen.getByPlaceholderText("Mật Khẩu"),
    "Password123",
  );

  await user.type(
    screen.getByPlaceholderText("Họ và Tên"),
    "Nguyễn Văn Test",
  );

  await user.click(
    screen.getByRole("button", {
      name: "Chọn giới tính",
    }),
  );

  await user.click(
    screen.getByRole("button", {
      name: "Nam",
    }),
  );

  await user.type(
    screen.getByPlaceholderText("Day"),
    "15",
  );

  await user.type(
    screen.getByPlaceholderText("Month"),
    "8",
  );

  await user.type(
    screen.getByPlaceholderText("Year"),
    "2000",
  );
};

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("hiển thị đầy đủ form đăng ký", () => {
    renderRegisterPage();

    expect(
      screen.getByRole("heading", {
        name: "Đăng ký",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Email đăng nhập",
      ),
    ).toBeRequired();

    expect(
      screen.getByPlaceholderText("Mật Khẩu"),
    ).toBeRequired();

    expect(
      screen.getByPlaceholderText("Họ và Tên"),
    ).toBeRequired();

    expect(
      screen.getByPlaceholderText("Day"),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Month"),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Year"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Đăng nhập",
      }),
    ).toHaveAttribute("href", "/login");
  });

  test("cho phép chọn giới tính", async () => {
    const user = createUser();

    renderRegisterPage();

    await user.click(
      screen.getByRole("button", {
        name: "Chọn giới tính",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Nam",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Nữ",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Không muốn chọn",
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Nữ",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Nữ",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Nam",
      }),
    ).not.toBeInTheDocument();
  });

  test("gửi đúng dữ liệu đăng ký", async () => {
    const user = createUser();

    authApi.register.mockResolvedValue({
      message: "Đăng ký thành công",
    });

    renderRegisterPage();

    await fillRegisterForm(user);

    await user.click(
      screen.getByRole("button", {
        name: "Đăng ký",
      }),
    );

    await waitFor(() => {
      expect(
        authApi.register,
      ).toHaveBeenCalledWith({
        email: "register@example.com",
        password: "Password123",
        fullName: "Nguyễn Văn Test",
        gender: "Male",
        birthday: "2000-08-15",
      });
    });

    expect(
      authApi.register,
    ).toHaveBeenCalledTimes(1);
  });

  test("thông báo khi đăng ký thành công", async () => {
    const user = createUser();

    authApi.register.mockResolvedValue({
      message: "Đăng ký thành công",
    });

    renderRegisterPage();

    await fillRegisterForm(user);

    await user.click(
      screen.getByRole("button", {
        name: "Đăng ký",
      }),
    );

    await waitFor(() => {
      expect(
        showNotificationMock,
      ).toHaveBeenCalledWith(
        "success",
        "Đăng ký thành công",
        "Tài khoản của bạn đã được tạo",
      );
    });
  });

  test("hiển thị lỗi do backend trả về", async () => {
    const user = createUser();

    authApi.register.mockRejectedValue({
      response: {
        data: {
          message: "Email đã tồn tại",
        },
      },
    });

    renderRegisterPage();

    await fillRegisterForm(user);

    await user.click(
      screen.getByRole("button", {
        name: "Đăng ký",
      }),
    );

    await waitFor(() => {
      expect(
        showNotificationMock,
      ).toHaveBeenCalledWith(
        "error",
        "Đăng ký thất bại",
        "Email đã tồn tại",
      );
    });
  });

  test("hiển thị lỗi mặc định khi backend không có message", async () => {
    const user = createUser();

    authApi.register.mockRejectedValue(
      new Error("Network error"),
    );

    renderRegisterPage();

    await fillRegisterForm(user);

    await user.click(
      screen.getByRole("button", {
        name: "Đăng ký",
      }),
    );

    await waitFor(() => {
      expect(
        showNotificationMock,
      ).toHaveBeenCalledWith(
        "error",
        "Đăng ký thất bại",
        "Vui lòng thử lại",
      );
    });
  });

  test("vô hiệu hóa nút khi đang đăng ký", async () => {
    const user = createUser();

    authApi.register.mockReturnValue(
      new Promise(() => {}),
    );

    renderRegisterPage();

    await fillRegisterForm(user);

    await user.click(
      screen.getByRole("button", {
        name: "Đăng ký",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Đang xử lý...",
      }),
    ).toBeDisabled();
  });
});