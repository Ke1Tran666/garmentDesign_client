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

  test("roleApi.getAll, getById và getPermissions cache trong 10s", async () => {
    const roles = [{ idRole: 1, nameRole: "admin" }];
    const roleDetail = { idRole: 1, nameRole: "admin" };
    const permissions = [
      { idPermission: 1, code: "SYSTEM_ADMIN", name: "Quản trị hệ thống" },
    ];
    httpClient.get
      .mockResolvedValueOnce({ data: roles })
      .mockResolvedValueOnce({ data: roleDetail })
      .mockResolvedValueOnce({ data: permissions });

    expect(await roleApi.getAll()).toEqual(roles);
    expect(await roleApi.getAll()).toEqual(roles);
    expect(await roleApi.getById(1)).toEqual(roleDetail);
    expect(await roleApi.getById(1)).toEqual(roleDetail);
    expect(await roleApi.getPermissions()).toEqual(permissions);
    expect(await roleApi.getPermissions()).toEqual(permissions);

    expect(httpClient.get).toHaveBeenCalledTimes(3);
  });

  test("roleApi.create, update, remove gọi đúng endpoint và xóa cache của roles lẫn users", async () => {
    httpClient.get.mockImplementation((url) => {
      if (url === "/roles") return Promise.resolve({ data: [] });
      if (url === "/users") return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    });
    httpClient.post.mockResolvedValue({
      data: { idRole: 4, nameRole: "DESIGNER" },
    });
    httpClient.put.mockResolvedValue({
      data: { idRole: 4, nameRole: "TAILOR" },
    });
    httpClient.delete.mockResolvedValue({ data: {} });

    await roleApi.getAll();
    await userApi.getAll();
    expect(httpClient.get).toHaveBeenCalledTimes(2);

    const created = await roleApi.create({ nameRole: "DESIGNER" });
    expect(created).toEqual({ idRole: 4, nameRole: "DESIGNER" });
    expect(httpClient.post).toHaveBeenCalledWith("/roles", {
      nameRole: "DESIGNER",
    });

    await roleApi.getAll();
    await userApi.getAll();
    expect(httpClient.get).toHaveBeenCalledTimes(4);

    const updated = await roleApi.update(4, { nameRole: "TAILOR" });
    expect(updated).toEqual({ idRole: 4, nameRole: "TAILOR" });
    expect(httpClient.put).toHaveBeenCalledWith("/roles/4", {
      nameRole: "TAILOR",
    });

    await roleApi.getAll();
    await userApi.getAll();
    expect(httpClient.get).toHaveBeenCalledTimes(6);

    await roleApi.remove(4);
    expect(httpClient.delete).toHaveBeenCalledWith("/roles/4");

    await roleApi.remove(4, 3);
    expect(httpClient.delete).toHaveBeenLastCalledWith("/roles/4", {
      params: { replacementRoleId: 3 },
    });

    await roleApi.getAll();
    await userApi.getAll();
    expect(httpClient.get).toHaveBeenCalledTimes(8);
  });

  test("userApi.create, remove, updateRole cũng invalidate cache roles", async () => {
    httpClient.get.mockResolvedValue({ data: [] });
    httpClient.post.mockResolvedValue({ data: { idUser: "10001" } });
    httpClient.put.mockResolvedValue({ data: { idUser: "10001" } });
    httpClient.delete.mockResolvedValue({ data: {} });

    await roleApi.getAll();
    expect(httpClient.get).toHaveBeenCalledTimes(1);

    await userApi.create({ fullName: "Test" });
    await roleApi.getAll();
    expect(httpClient.get).toHaveBeenCalledTimes(2);

    await userApi.updateRole("10001", 4);
    await roleApi.getAll();
    expect(httpClient.get).toHaveBeenCalledTimes(3);

    await userApi.remove("10001");
    await roleApi.getAll();
    expect(httpClient.get).toHaveBeenCalledTimes(4);
  });
});
