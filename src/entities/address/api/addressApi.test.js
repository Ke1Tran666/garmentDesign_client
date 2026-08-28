import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import httpClient from "@/shared/api/httpClient";
import { addressApi } from "./addressApi";

vi.mock("@/shared/api/httpClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("addressApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("lấy danh sách địa chỉ của người dùng", async () => {
    const addresses = [
      {
        addressId: 1,
        companyName: "Công ty A",
        address: "Hà Nội",
      },
      {
        addressId: 2,
        companyName: "Công ty B",
        address: "Đà Nẵng",
      },
    ];

    const config = {
      signal: "test-signal",
    };

    httpClient.get.mockResolvedValue({
      data: addresses,
    });

    const result = await addressApi.getByUser(
      10,
      config,
    );

    expect(httpClient.get).toHaveBeenCalledWith(
      "/user-addresses/user/10",
      config,
    );

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(result).toEqual(addresses);
  });

  test("tạo địa chỉ mới", async () => {
    const payload = {
      companyName: "Công ty mới",
      address: "TP. Hồ Chí Minh",
      note: "Văn phòng chính",
    };

    const createdAddress = {
      addressId: 3,
      ...payload,
    };

    httpClient.post.mockResolvedValue({
      data: createdAddress,
    });

    const result = await addressApi.create(
      10,
      payload,
    );

    expect(httpClient.post).toHaveBeenCalledWith(
      "/user-addresses/user/10",
      payload,
    );

    expect(result).toEqual(createdAddress);
  });

  test("cập nhật địa chỉ", async () => {
    const payload = {
      companyName: "Công ty đã cập nhật",
      address: "Hải Phòng",
      note: "Chi nhánh mới",
    };

    const updatedAddress = {
      addressId: 5,
      ...payload,
    };

    httpClient.put.mockResolvedValue({
      data: updatedAddress,
    });

    const result = await addressApi.update(
      5,
      payload,
    );

    expect(httpClient.put).toHaveBeenCalledWith(
      "/user-addresses/5",
      payload,
    );

    expect(result).toEqual(updatedAddress);
  });

  test("xóa địa chỉ", async () => {
    const responseData = {
      message: "Xóa địa chỉ thành công",
    };

    httpClient.delete.mockResolvedValue({
      data: responseData,
    });

    const result = await addressApi.remove(5);

    expect(httpClient.delete).toHaveBeenCalledWith(
      "/user-addresses/5",
    );

    expect(result).toEqual(responseData);
  });

  test("đặt địa chỉ mặc định", async () => {
    const responseData = {
      addressId: 5,
      isDefault: true,
    };

    httpClient.put.mockResolvedValue({
      data: responseData,
    });

    const result = await addressApi.setDefault(
      10,
      5,
    );

    expect(httpClient.put).toHaveBeenCalledWith(
      "/user-addresses/user/10/default/5",
    );

    expect(result).toEqual(responseData);
  });

  test("chuyển tiếp lỗi khi lấy danh sách thất bại", async () => {
    const apiError = new Error(
      "Không thể tải danh sách địa chỉ",
    );

    httpClient.get.mockRejectedValue(apiError);

    await expect(
      addressApi.getByUser(10),
    ).rejects.toBe(apiError);

    expect(httpClient.get).toHaveBeenCalledWith(
      "/user-addresses/user/10",
      {},
    );
  });
});
