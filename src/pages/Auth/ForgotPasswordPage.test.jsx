import {
  fireEvent,
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
import ForgotPasswordPage from "./ForgotPasswordPage";
import { authApi } from "@/features/auth/api/authApi";

const { showNotificationMock } = vi.hoisted(
  () => ({
    showNotificationMock: vi.fn(),
  }),
);

vi.mock("@/features/auth/api/authApi", () => ({
  authApi: {
    forgotPassword: vi.fn(),
    verifyForgotOtp: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

vi.mock(
  "@/app/providers/NotificationProvider",
  () => ({
    useNotification: () => ({
      showNotification: showNotificationMock,
    }),
  }),
);

const renderForgotPasswordPage = () => {
  return render(
    <MemoryRouter>
      <ForgotPasswordPage />
    </MemoryRouter>,
  );
};

const goToOtpStep = async (
  user,
  email = "tester@example.com",
) => {
  await user.type(
    screen.getByPlaceholderText("Email"),
    email,
  );

  await user.click(
    screen.getByRole("button", {
      name: "Gửi mã OTP",
    }),
  );

  await screen.findByRole("heading", {
    name: "Xác thực OTP",
  });

  return email;
};

const enterOtp = (otp = "123456") => {
  fireEvent.change(
    screen.getByLabelText("Số OTP thứ 1"),
    {
      target: {
        value: otp,
      },
    },
  );
};

const goToPasswordStep = async (
  user,
  email = "tester@example.com",
) => {
  await goToOtpStep(user, email);

  enterOtp("123456");

  await user.click(
    screen.getByRole("button", {
      name: "Xác thực OTP",
    }),
  );

  await screen.findByRole("heading", {
    name: "Đổi mật khẩu",
  });

  return email;
};

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    authApi.forgotPassword.mockResolvedValue({
      message: "Đã gửi OTP về email",
    });

    authApi.verifyForgotOtp.mockResolvedValue({
      message: "Xác thực OTP thành công",
    });

    authApi.resetPassword.mockResolvedValue({
      message: "Đổi mật khẩu thành công",
    });

    vi.stubGlobal(
      "requestAnimationFrame",
      (callback) => {
        callback();
        return 1;
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("hiển thị bước nhập email", () => {
    renderForgotPasswordPage();

    expect(
      screen.getByRole("heading", {
        name: "Quên mật khẩu?",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Email"),
    ).toBeRequired();

    expect(
      screen.getByRole("link", {
        name: "Quay lại đăng nhập",
      }),
    ).toHaveAttribute("href", "/login");
  });

  test("cảnh báo khi email để trống", async () => {
    renderForgotPasswordPage();

    const submitButton = screen.getByRole(
      "button",
      {
        name: "Gửi mã OTP",
      },
    );

    fireEvent.submit(
      submitButton.closest("form"),
    );

    await waitFor(() => {
      expect(
        showNotificationMock,
      ).toHaveBeenCalledWith(
        "warning",
        "Thiếu email",
        "Vui lòng nhập email của bạn",
      );
    });

    expect(
      authApi.forgotPassword,
    ).not.toHaveBeenCalled();
  });

  test("gửi OTP và chuyển sang bước xác thực", async () => {
    const user = userEvent.setup();

    renderForgotPasswordPage();

    await goToOtpStep(
      user,
      "tester@example.com",
    );

    expect(
      authApi.forgotPassword,
    ).toHaveBeenCalledWith(
      "tester@example.com",
    );

    expect(
      screen.getByText(/tester@example.com/),
    ).toBeInTheDocument();

    expect(
      showNotificationMock,
    ).toHaveBeenCalledWith(
      "success",
      "Đã gửi OTP",
      "Vui lòng kiểm tra email của bạn",
    );
  });

  test("hiển thị lỗi khi gửi OTP thất bại", async () => {
    const user = userEvent.setup();

    authApi.forgotPassword.mockRejectedValue({
      response: {
        data: {
          message: "Email không tồn tại",
        },
      },
    });

    renderForgotPasswordPage();

    await user.type(
      screen.getByPlaceholderText("Email"),
      "missing@example.com",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Gửi mã OTP",
      }),
    );

    await waitFor(() => {
      expect(
        showNotificationMock,
      ).toHaveBeenCalledWith(
        "error",
        "Thao tác thất bại",
        "Email không tồn tại",
      );
    });

    expect(
      screen.getByRole("heading", {
        name: "Quên mật khẩu?",
      }),
    ).toBeInTheDocument();
  });

  test("cảnh báo khi OTP chưa đủ 6 số", async () => {
    const user = userEvent.setup();

    renderForgotPasswordPage();

    await goToOtpStep(user);

    enterOtp("123");

    await user.click(
      screen.getByRole("button", {
        name: "Xác thực OTP",
      }),
    );

    expect(
      authApi.verifyForgotOtp,
    ).not.toHaveBeenCalled();

    expect(
      showNotificationMock,
    ).toHaveBeenCalledWith(
      "warning",
      "OTP chưa hợp lệ",
      "Vui lòng nhập đủ 6 số OTP",
    );
  });

  test("xác thực OTP và chuyển sang đổi mật khẩu", async () => {
    const user = userEvent.setup();

    renderForgotPasswordPage();

    await goToPasswordStep(
      user,
      "tester@example.com",
    );

    expect(
      authApi.verifyForgotOtp,
    ).toHaveBeenCalledWith({
      email: "tester@example.com",
      otp: "123456",
    });

    expect(
      screen.getByPlaceholderText(
        "Mật khẩu mới",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Nhập lại mật khẩu",
      ),
    ).toBeInTheDocument();
  });

  test("cảnh báo khi hai mật khẩu không khớp", async () => {
    const user = userEvent.setup();

    renderForgotPasswordPage();

    await goToPasswordStep(user);

    await user.type(
      screen.getByPlaceholderText(
        "Mật khẩu mới",
      ),
      "NewPassword123",
    );

    await user.type(
      screen.getByPlaceholderText(
        "Nhập lại mật khẩu",
      ),
      "DifferentPassword",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Đổi mật khẩu",
      }),
    );

    expect(
      authApi.resetPassword,
    ).not.toHaveBeenCalled();

    expect(
      showNotificationMock,
    ).toHaveBeenCalledWith(
      "warning",
      "Mật khẩu không khớp",
      "Vui lòng nhập lại mật khẩu",
    );
  });

  test("đổi mật khẩu thành công", async () => {
    const user = userEvent.setup();

    renderForgotPasswordPage();

    await goToPasswordStep(
      user,
      "tester@example.com",
    );

    await user.type(
      screen.getByPlaceholderText(
        "Mật khẩu mới",
      ),
      "NewPassword123",
    );

    await user.type(
      screen.getByPlaceholderText(
        "Nhập lại mật khẩu",
      ),
      "NewPassword123",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Đổi mật khẩu",
      }),
    );

    await waitFor(() => {
      expect(
        authApi.resetPassword,
      ).toHaveBeenCalledWith({
        email: "tester@example.com",
        newPassword: "NewPassword123",
      });
    });

    expect(
      await screen.findByRole("heading", {
        name: "Hoàn thành",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Đổi mật khẩu thành công",
      }),
    ).toBeInTheDocument();

    expect(
      showNotificationMock,
    ).toHaveBeenCalledWith(
      "success",
      "Đổi mật khẩu thành công",
      "Bạn sẽ được chuyển về trang đăng nhập",
    );
  });

  test("cho phép quay lại đổi email", async () => {
    const user = userEvent.setup();

    renderForgotPasswordPage();

    await goToOtpStep(
      user,
      "old@example.com",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Đổi email",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Quên mật khẩu?",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Email"),
    ).toHaveValue("old@example.com");
  });
});
