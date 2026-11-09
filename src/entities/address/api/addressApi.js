import { cacheManager } from "@/shared/api/cacheManager";
import httpClient from "@/shared/api/httpClient";

export const addressApi = {
  async getMine(config = {}) {
    const response = await httpClient.get("/user-addresses/me", config);

    return response.data;
  },

  async create(payload) {
    const response = await httpClient.post("/user-addresses/me", payload);
    cacheManager.invalidate("users");

    return response.data;
  },

  async update(addressId, payload) {
    const response = await httpClient.put(
      `/user-addresses/me/${addressId}`,
      payload,
    );
    cacheManager.invalidate("users");

    return response.data;
  },

  async remove(addressId) {
    const response = await httpClient.delete(`/user-addresses/me/${addressId}`);
    cacheManager.invalidate("users");

    return response.data;
  },

  async setDefault(addressId) {
    const response = await httpClient.put(
      `/user-addresses/me/default/${addressId}`,
    );
    cacheManager.invalidate("users");

    return response.data;
  },

  async createForUser(userId, payload) {
    const response = await httpClient.post(
      `/user-addresses/users/${userId}`,
      payload,
    );
    cacheManager.invalidate("users");

    return response.data;
  },
};
