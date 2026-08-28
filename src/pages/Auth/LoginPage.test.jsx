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
import LoginPage from "./LoginPage";
import { authApi } from "@/features/auth/api/authApi";
import { authStorage } from "@/features/auth/lib/authStorage";

const {
  showNotificationMock,
  googleLoginMock,
} = vi.hoisted(() => ({
  showNotificationMock: vi.fn(),
  googleLoginMock: vi.fn(),
}));

vi.mock("@/features/auth/api/authApi", () => ({
  authApi: {
    login: vi.fn(),
    googleLogin: vi.fn(),
    sendPhoneOtp: vi.fn(),
    verifyPhoneOtp: vi.fn(),
  },
}));

vi.mock("@/features/auth/lib/authStorage", () => ({
  authStorage: {
    save: vi.fn(),
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

vi.mock("@react-oauth/google", () => ({
  useGoogleLogin: () => googleLoginMock,
}));

const renderLoginPage = () => {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
};

const createUser = () => userEvent.setup();

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

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

  test("hiển thị form đăng nhập tài khoản", () => {
    renderLoginPage();

    expect(
      screen.getByRole("heading", {
        name: "Đăng nhập",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Email đăng nhập",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Mật Khẩu"),
    ).toHaveAttribute("type", "password");

    expect(
      screen.getByRole("link", {
        name: "Quên mật khẩu?",
      }),
    ).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });

  test("đăng nhập bằng email và mật khẩu thành công", async () => {
    const user = createUser();

    const loginResult = {
      token: "test-token",
      idUser: "US001",
    };

    authApi.login.mockResolvedValue(loginResult);

    renderLoginPage();

    await user.type(
      screen.getByPlaceholderText(
        "Email đăng nhập",
      ),
      "tester@example.com",
    );

    await user.type(
      screen.getByPlaceholderText("Mật Khẩu"),
      "Password123",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Đăng nhập",
      }),
    );

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: "tester@example.com",
        password: "Password123",
      });
    });

    expect(authStorage.save).toHaveBeenCalledWith(
      loginResult,
    );

    expect(
      showNotificationMock,
    ).toHaveBeenCalledWith(
      "success",
      "Đăng nhập thành công",
      "Chào mừng bạn quay trở lại",
    );
  });

  test("hiển thị lỗi đăng nhập từ backend", async () => {
    const user = createUser();

    authApi.login.mockRejectedValue({
      response: {
        data: {
          message:
            "Email hoặc mật khẩu không đúng",
        },
      },
    });

    renderLoginPage();

    await user.type(
      screen.getByPlaceholderText(
        "Email đăng nhập",
      ),
      "wrong@example.com",
    );

    await user.type(
      screen.getByPlaceholderText("Mật Khẩu"),
      "wrong-password",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Đăng nhập",
      }),
    );

    await waitFor(() => {
      expect(
        showNotificationMock,
      ).toHaveBeenCalledWith(
        "error",
        "Đăng nhập thất bại",
        "Email hoặc mật khẩu không đúng",
      );
    });

    expect(
      authStorage.save,
    ).not.toHaveBeenCalled();
  });

  test("chuyển sang đăng nhập bằng số điện thoại", async () => {
    const user = createUser();

    renderLoginPage();

    await user.click(
      screen.getByRole("button", {
        name: "Đăng nhập với số điện thoại",
      }),
    );

    expect(
      screen.getByPlaceholderText(
        "Số điện thoại",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Gửi mã OTP",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByPlaceholderText(
        "Email đăng nhập",
      ),
    ).not.toBeInTheDocument();
  });

  test("gửi mã OTP thành công", async () => {
    const user = createUser();

    authApi.sendPhoneOtp.mockResolvedValue({
      message: "OTP sent",
    });

    renderLoginPage();

    await user.click(
      screen.getByRole("button", {
        name: "Đăng nhập với số điện thoại",
      }),
    );

    await user.type(
      screen.getByPlaceholderText(
        "Số điện thoại",
      ),
      "0901234567",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Gửi mã OTP",
      }),
    );

    await waitFor(() => {
      expect(
        authApi.sendPhoneOtp,
      ).toHaveBeenCalledWith("0901234567");
    });

    expect(
      await screen.findByRole("heading", {
        name: "Xác thực OTP",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/0901234567/),
    ).toBeInTheDocument();

    expect(
      showNotificationMock,
    ).toHaveBeenCalledWith(
      "success",
      "Đã gửi mã OTP",
      "Vui lòng xem OTP trong console BE",
    );
  });

  test("xác nhận OTP thành công", async () => {
    const user = createUser();

    authApi.sendPhoneOtp.mockResolvedValue({
      message: "OTP sent",
    });

    const loginResult = {
      token: "phone-token",
      idUser: "US002",
    };

    authApi.verifyPhoneOtp.mockResolvedValue(
      loginResult,
    );

    renderLoginPage();

    await user.click(
      screen.getByRole("button", {
        name: "Đăng nhập với số điện thoại",
      }),
    );

    await user.type(
      screen.getByPlaceholderText(
        "Số điện thoại",
      ),
      "0901234567",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Gửi mã OTP",
      }),
    );

    await screen.findByRole("heading", {
      name: "Xác thực OTP",
    });

    fireEvent.change(
      screen.getByLabelText("Số OTP thứ 1"),
      {
        target: {
          value: "123456",
        },
      },
    );

    await user.click(
      screen.getByRole("button", {
        name: "Xác nhận OTP",
      }),
    );

    await waitFor(() => {
      expect(
        authApi.verifyPhoneOtp,
      ).toHaveBeenCalledWith({
        phone: "0901234567",
        otp: "123456",
      });
    });

    expect(authStorage.save).toHaveBeenCalledWith(
      loginResult,
    );

    expect(
      showNotificationMock,
    ).toHaveBeenCalledWith(
      "success",
      "Đăng nhập thành công",
      "Xác thực OTP thành công",
    );
  });

  test("không xác nhận khi OTP chưa đủ 6 số", async () => {
    const user = createUser();

    authApi.sendPhoneOtp.mockResolvedValue({
      message: "OTP sent",
    });

    renderLoginPage();

    await user.click(
      screen.getByRole("button", {
        name: "Đăng nhập với số điện thoại",
      }),
    );

    await user.type(
      screen.getByPlaceholderText(
        "Số điện thoại",
      ),
      "0901234567",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Gửi mã OTP",
      }),
    );

    await screen.findByRole("heading", {
      name: "Xác thực OTP",
    });

    fireEvent.change(
      screen.getByLabelText("Số OTP thứ 1"),
      {
        target: {
          value: "123",
        },
      },
    );

    await user.click(
      screen.getByRole("button", {
        name: "Xác nhận OTP",
      }),
    );

    expect(
      authApi.verifyPhoneOtp,
    ).not.toHaveBeenCalled();

    expect(
      showNotificationMock,
    ).toHaveBeenCalledWith(
      "warning",
      "OTP chưa hợp lệ",
      "Vui lòng nhập đủ 6 số OTP",
    );
  });

  test("gọi chức năng đăng nhập Google", async () => {
    const user = createUser();

    renderLoginPage();

    await user.click(
      screen.getByRole("button", {
        name: "Đăng nhập với Google",
      }),
    );

    expect(
      googleLoginMock,
    ).toHaveBeenCalledTimes(1);
  });
});
