import { beforeEach, describe, expect, test, vi } from "vitest";

import { cacheManager } from "@/shared/api/cacheManager";
import httpClient from "@/shared/api/httpClient";
import { roleApi } from "./roleApi";
import { userApi } from "./userApi";

vi.mock("@/shared/api/httpClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("userApi & roleApi caching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cacheManager.clear();
  });

  test("userApi.getAll dùng cache 10s và forceRefresh loại bỏ cờ nội bộ trước khi gọi httpClient", async () => {
    const users = [{ idUser: "00001", fullName: "Nguyễn Văn A" }];
    httpClient.get.mockResolvedValue({ data: users });

    const first = await userApi.getAll();
    const second = await userApi.getAll();

    expect(first).toEqual(users);
    expect(second).toEqual(users);
    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(httpClient.get).toHaveBeenCalledWith("/users", {});

    const third = await userApi.getAll({
      forceRefresh: true,
      signal: "abort-signal",
    });

    expect(third).toEqual(users);
    expect(httpClient.get).toHaveBeenCalledTimes(2);
    expect(httpClient.get).toHaveBeenLastCalledWith("/users", {
      signal: "abort-signal",
    });
  });

  test("userApi.getById cache theo id và bị xóa cache khi mutation xảy ra", async () => {
    const userDetail = { user: { idUser: "00002", fullName: "Trần Thị B" } };
    httpClient.get.mockResolvedValue({ data: userDetail });
    httpClient.put.mockResolvedValue({ data: { message: "OK" } });

    await userApi.getById("00002");
    await userApi.getById("00002");
    expect(httpClient.get).toHaveBeenCalledTimes(1);

    await userApi.updateById("00002", { fullName: "Trần Thị B Updated" });
    await userApi.getById("00002");

    expect(httpClient.get).toHaveBeenCalledTimes(2);
  });

  test("uploadAvatarById, removeAvatarById và remove xóa sạch cache users", async () => {
    httpClient.get.mockResolvedValue({ data: [] });
    httpClient.put.mockResolvedValue({ data: { avatar: "url" } });
    httpClient.delete.mockResolvedValue({ data: {} });

    await userApi.getAll();
    expect(httpClient.get).toHaveBeenCalledTimes(1);

    await userApi.uploadAvatarById("00003", new File(["a"], "a.png"));
    await userApi.getAll();
    expect(httpClient.get).toHaveBeenCalledTimes(2);

    await userApi.removeAvatarById("00003");
    await userApi.getAll();
    expect(httpClient.get).toHaveBeenCalledTimes(3);

    await userApi.remove("00003");
    await userApi.getAll();
    expect(httpClient.get).toHaveBeenCalledTimes(4);
  });

  test("roleApi.getAll và roleApi.getById cache trong 10s", async () => {
    const roles = [{ idRole: 1, nameRole: "ADMIN" }];
    const roleDetail = { idRole: 1, nameRole: "ADMIN" };
    httpClient.get
      .mockResolvedValueOnce({ data: roles })
      .mockResolvedValueOnce({ data: roleDetail });

    expect(await roleApi.getAll()).toEqual(roles);
    expect(await roleApi.getAll()).toEqual(roles);
    expect(await roleApi.getById(1)).toEqual(roleDetail);
    expect(await roleApi.getById(1)).toEqual(roleDetail);

    expect(httpClient.get).toHaveBeenCalledTimes(2);
  });
});
