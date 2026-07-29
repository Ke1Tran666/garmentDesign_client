import {
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import AddressPage from "./AddressPage";
import { addressApi } from "@/api/addressApi";
import { userApi } from "@/api/userApi";
import { authStorage } from "@/lib/authStorage";

const { showNotificationMock } = vi.hoisted(
  () => ({
    showNotificationMock: vi.fn(),
  }),
);

vi.mock("@/api/addressApi", () => ({
  addressApi: {
    getByUser: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    setDefault: vi.fn(),
  },
}));

vi.mock("@/api/userApi", () => ({
  userApi: {
    getMe: vi.fn(),
  },
}));

vi.mock("@/lib/authStorage", () => ({
  authStorage: {
    getUserId: vi.fn(),
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

const addresses = [
  {
    addressId: 1,
    companyName: "Công ty Alpha",
    address: "Hà Nội",
    note: "Văn phòng miền Bắc",
  },
  {
    addressId: 2,
    companyName: "Công ty Beta",
    address: "Đà Nẵng",
    note: "Văn phòng miền Trung",
  },
];

const renderAddressPage = () => {
  return render(<AddressPage />);
};

const openCreateModal = async (user) => {
  await screen.findByText("Công ty Alpha");

  await user.click(
    screen.getByRole("button", {
      name: "Thêm địa chỉ",
    }),
  );

  return screen
    .getByRole("heading", {
      name: "Thêm địa chỉ",
    })
    .parentElement;
};

const openAddressMenu = async (
  user,
  companyName,
) => {
  await screen.findByText(companyName);

  await user.click(
    screen.getByRole("button", {
      name: `Mở thao tác cho ${companyName}`,
    }),
  );
};

describe("AddressPage", () => {
    beforeEach(() => {
    vi.clearAllMocks();

    authStorage.getUserId.mockReturnValue("US001");

    userApi.getMe.mockResolvedValue({
        user: {
        defaultAddress: {
            addressId: 2,
        },
        },
    });

    addressApi.getByUser.mockResolvedValue(
        addresses,
    );
    });

    afterEach(() => {
    vi.restoreAllMocks();
    });

    test("hiển thị loading khi đang tải dữ liệu", () => {
    userApi.getMe.mockReturnValue(
        new Promise(() => {}),
    );

    addressApi.getByUser.mockReturnValue(
        new Promise(() => {}),
    );

    renderAddressPage();

    expect(
        screen.getByText(
        "Đang tải danh sách địa chỉ...",
        ),
    ).toBeInTheDocument();
    });

    test("hiển thị lỗi khi không tìm thấy user", async () => {
    authStorage.getUserId.mockReturnValue(null);

    renderAddressPage();

    expect(
        await screen.findByText(
        "Không tìm thấy thông tin người dùng.",
        ),
    ).toBeInTheDocument();

    expect(userApi.getMe).not.toHaveBeenCalled();
    expect(
        addressApi.getByUser,
    ).not.toHaveBeenCalled();
    });

    test("gọi API và hiển thị danh sách địa chỉ", async () => {
    renderAddressPage();

    expect(
        await screen.findByText("Công ty Alpha"),
    ).toBeInTheDocument();

    expect(
        screen.getByText("Công ty Beta"),
    ).toBeInTheDocument();

    expect(
        screen.getByText("Hà Nội"),
    ).toBeInTheDocument();

    expect(
        screen.getByText("Đà Nẵng"),
    ).toBeInTheDocument();

    expect(
        screen.getByText("Tổng số địa chỉ: 2"),
    ).toBeInTheDocument();

    expect(
        screen.getByText("Hiển thị 2 kết quả"),
    ).toBeInTheDocument();

    expect(userApi.getMe).toHaveBeenCalledWith(
        "US001",
    );

    expect(
        addressApi.getByUser,
    ).toHaveBeenCalledWith("US001");
    });

    test("đánh dấu đúng địa chỉ mặc định", async () => {
    renderAddressPage();

    await screen.findByText("Công ty Beta");

    expect(
        screen.getByText("Active"),
    ).toBeInTheDocument();

    expect(
        screen.getByText("Inactive"),
    ).toBeInTheDocument();
    });

    test("lọc địa chỉ theo từ khóa tìm kiếm", async () => {
    const user = userEvent.setup();

    renderAddressPage();

    await screen.findByText("Công ty Alpha");

    const searchInput =
        screen.getByPlaceholderText(
        "Tìm tên công ty, địa chỉ, ghi chú...",
        );

    await user.type(searchInput, "Đà Nẵng");

    expect(
        screen.getByText("Công ty Beta"),
    ).toBeInTheDocument();

    expect(
        screen.queryByText("Công ty Alpha"),
    ).not.toBeInTheDocument();

    expect(
        screen.getByText("Hiển thị 1 kết quả"),
    ).toBeInTheDocument();
    });

    test("tìm kiếm không phân biệt chữ hoa chữ thường", async () => {
    const user = userEvent.setup();

    renderAddressPage();

    await screen.findByText("Công ty Alpha");

    const searchInput =
        screen.getByPlaceholderText(
        "Tìm tên công ty, địa chỉ, ghi chú...",
        );

    await user.type(
        searchInput,
        "VĂN PHÒNG MIỀN BẮC",
    );

    expect(
        screen.getByText("Công ty Alpha"),
    ).toBeInTheDocument();

    expect(
        screen.queryByText("Công ty Beta"),
    ).not.toBeInTheDocument();
    });

    test("hiển thị trạng thái rỗng khi không có địa chỉ", async () => {
    addressApi.getByUser.mockResolvedValue([]);

    renderAddressPage();

    expect(
        await screen.findByText("Chưa có địa chỉ."),
    ).toBeInTheDocument();

    expect(
        screen.getByText("Tổng số địa chỉ: 0"),
    ).toBeInTheDocument();
    });

    test("hiển thị lỗi do backend trả về", async () => {
    vi.spyOn(
        console,
        "error",
    ).mockImplementation(() => {});

    addressApi.getByUser.mockRejectedValue({
        response: {
        data: {
            message:
            "Backend không thể tải địa chỉ.",
        },
        },
    });

    renderAddressPage();

    expect(
        await screen.findByText(
        "Backend không thể tải địa chỉ.",
        ),
    ).toBeInTheDocument();

    expect(
        screen.queryByText("Công ty Alpha"),
    ).not.toBeInTheDocument();
    });

    test("hiển thị lỗi mặc định khi API không có message", async () => {
    vi.spyOn(
        console,
        "error",
    ).mockImplementation(() => {});

    addressApi.getByUser.mockRejectedValue(
        new Error("Network error"),
    );

    renderAddressPage();

    expect(
        await screen.findByText(
        "Không thể tải danh sách địa chỉ.",
        ),
    ).toBeInTheDocument();
    });

    test("kết thúc trạng thái loading sau khi API hoàn thành", async () => {
    renderAddressPage();

    await waitFor(() => {
        expect(
        screen.queryByText(
            "Đang tải danh sách địa chỉ...",
        ),
        ).not.toBeInTheDocument();
    });

    expect(
        screen.getByText("Công ty Alpha"),
    ).toBeInTheDocument();
    });

    test("mở form thêm địa chỉ", async () => {
    const user = userEvent.setup();

    renderAddressPage();

    const modal = await openCreateModal(user);

    expect(
        within(modal).getByPlaceholderText(
        "Tên công ty",
        ),
    ).toHaveValue("");

    expect(
        within(modal).getByPlaceholderText(
        "Địa chỉ công ty",
        ),
    ).toHaveValue("");

    expect(
        within(modal).getByPlaceholderText(
        "Ghi chú",
        ),
    ).toHaveValue("");
    });

    test("không tạo khi tên công ty để trống", async () => {
    const user = userEvent.setup();

    renderAddressPage();

    const modal = await openCreateModal(user);

    await user.click(
        within(modal).getByRole("button", {
        name: "Thêm địa chỉ",
        }),
    );

    expect(
        addressApi.create,
    ).not.toHaveBeenCalled();

    expect(
        showNotificationMock,
    ).toHaveBeenCalledWith(
        "error",
        "Thất bại",
        "Tên công ty không được để trống.",
    );
    });

    test("không tạo khi địa chỉ để trống", async () => {
    const user = userEvent.setup();

    renderAddressPage();

    const modal = await openCreateModal(user);

    await user.type(
        within(modal).getByPlaceholderText(
        "Tên công ty",
        ),
        "Công ty Gamma",
    );

    await user.click(
        within(modal).getByRole("button", {
        name: "Thêm địa chỉ",
        }),
    );

    expect(
        addressApi.create,
    ).not.toHaveBeenCalled();

    expect(
        showNotificationMock,
    ).toHaveBeenCalledWith(
        "error",
        "Thất bại",
        "Địa chỉ không được để trống.",
    );
    });

    test("tạo địa chỉ thành công", async () => {
    const user = userEvent.setup();

    const createdAddress = {
        addressId: 3,
        companyName: "Công ty Gamma",
        address: "TP. Hồ Chí Minh",
        note: "Văn phòng miền Nam",
    };

    addressApi.create.mockResolvedValue(
        createdAddress,
    );

    renderAddressPage();

    const modal = await openCreateModal(user);

    await user.type(
        within(modal).getByPlaceholderText(
        "Tên công ty",
        ),
        createdAddress.companyName,
    );

    await user.type(
        within(modal).getByPlaceholderText(
        "Địa chỉ công ty",
        ),
        createdAddress.address,
    );

    await user.type(
        within(modal).getByPlaceholderText(
        "Ghi chú",
        ),
        createdAddress.note,
    );

    await user.click(
        within(modal).getByRole("button", {
        name: "Thêm địa chỉ",
        }),
    );

    await waitFor(() => {
        expect(
        addressApi.create,
        ).toHaveBeenCalledWith("US001", {
        companyName: "Công ty Gamma",
        address: "TP. Hồ Chí Minh",
        note: "Văn phòng miền Nam",
        });
    });

    expect(
        await screen.findByText("Công ty Gamma"),
    ).toBeInTheDocument();

    expect(
        screen.getByText("Tổng số địa chỉ: 3"),
    ).toBeInTheDocument();

    expect(
        screen.queryByRole("heading", {
        name: "Thêm địa chỉ",
        }),
    ).not.toBeInTheDocument();

    expect(
        showNotificationMock,
    ).toHaveBeenCalledWith(
        "success",
        "Thành công",
        "Đã thêm địa chỉ.",
    );
    });

    test("chỉnh sửa địa chỉ thành công", async () => {
    const user = userEvent.setup();

    addressApi.update.mockResolvedValue({
        addressId: 1,
        companyName: "Công ty Alpha mới",
        address: "Hải Phòng",
        note: "Văn phòng miền Bắc",
    });

    renderAddressPage();

    await openAddressMenu(
        user,
        "Công ty Alpha",
    );

    await user.click(
        screen.getByRole("menuitem", {
        name: "Chỉnh sửa",
        }),
    );

    const modal = screen
        .getByRole("heading", {
        name: "Chỉnh sửa địa chỉ",
        })
        .parentElement;

    const companyInput =
        within(modal).getByPlaceholderText(
        "Tên công ty",
        );

    const addressInput =
        within(modal).getByPlaceholderText(
        "Địa chỉ công ty",
        );

    expect(companyInput).toHaveValue(
        "Công ty Alpha",
    );

    expect(addressInput).toHaveValue("Hà Nội");

    await user.clear(companyInput);
    await user.type(
        companyInput,
        "Công ty Alpha mới",
    );

    await user.clear(addressInput);
    await user.type(addressInput, "Hải Phòng");

    await user.click(
        within(modal).getByRole("button", {
        name: "Lưu thay đổi",
        }),
    );

    await waitFor(() => {
        expect(
        addressApi.update,
        ).toHaveBeenCalledWith(1, {
        companyName: "Công ty Alpha mới",
        address: "Hải Phòng",
        note: "Văn phòng miền Bắc",
        });
    });

    expect(
        await screen.findByText(
        "Công ty Alpha mới",
        ),
    ).toBeInTheDocument();

    expect(
        screen.queryByText("Công ty Alpha"),
    ).not.toBeInTheDocument();

    expect(
        showNotificationMock,
    ).toHaveBeenCalledWith(
        "success",
        "Thành công",
        "Đã cập nhật địa chỉ.",
    );
    });

    test("xóa địa chỉ thành công", async () => {
    const user = userEvent.setup();

    addressApi.remove.mockResolvedValue(
        undefined,
    );

    renderAddressPage();

    await openAddressMenu(
        user,
        "Công ty Alpha",
    );

    await user.click(
        screen.getByRole("menuitem", {
        name: "Xóa địa chỉ",
        }),
    );

    const confirmModal = screen
        .getByRole("heading", {
        name: "Xóa địa chỉ",
        })
        .parentElement;

    expect(
        within(confirmModal).getByText(
        /Công ty Alpha - Hà Nội/,
        ),
    ).toBeInTheDocument();

    await user.click(
        within(confirmModal).getByRole("button", {
        name: "Xóa",
        }),
    );

    await waitFor(() => {
        expect(
        addressApi.remove,
        ).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
        expect(
        screen.queryByText("Công ty Alpha"),
        ).not.toBeInTheDocument();
    });

    expect(
        screen.getByText("Tổng số địa chỉ: 1"),
    ).toBeInTheDocument();

    expect(
        showNotificationMock,
    ).toHaveBeenCalledWith(
        "success",
        "Thành công",
        "Đã xóa địa chỉ.",
    );
    });

    test("không cho phép xóa địa chỉ mặc định", async () => {
    const user = userEvent.setup();

    renderAddressPage();

    await openAddressMenu(
        user,
        "Công ty Beta",
    );

    expect(
        screen.getByRole("menuitem", {
        name: "Xóa địa chỉ",
        }),
    ).toBeDisabled();

    expect(
        addressApi.remove,
    ).not.toHaveBeenCalled();
    });

    test("đặt địa chỉ làm mặc định", async () => {
    const user = userEvent.setup();

    addressApi.setDefault.mockResolvedValue({
        addressId: 1,
    });

    renderAddressPage();

    await openAddressMenu(
        user,
        "Công ty Alpha",
    );

    await user.click(
        screen.getByRole("menuitem", {
        name: "Đặt làm mặc định",
        }),
    );

    const confirmModal = screen
        .getByRole("heading", {
        name: "Xác nhận địa chỉ mặc định",
        })
        .parentElement;

    await user.click(
        within(confirmModal).getByRole("button", {
        name: "Xác nhận",
        }),
    );

    await waitFor(() => {
        expect(
        addressApi.setDefault,
        ).toHaveBeenCalledWith("US001", 1);
    });

    await waitFor(() => {
        const alphaRow = screen
        .getByText("Công ty Alpha")
        .closest("tr");

        expect(
        within(alphaRow).getByText("Active"),
        ).toBeInTheDocument();
    });

    const betaRow = screen
        .getByText("Công ty Beta")
        .closest("tr");

    expect(
        within(betaRow).getByText("Inactive"),
    ).toBeInTheDocument();

    expect(
        showNotificationMock,
    ).toHaveBeenCalledWith(
        "success",
        "Thành công",
        "Đã cập nhật địa chỉ mặc định.",
    );
    });
});