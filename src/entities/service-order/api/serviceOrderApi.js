import { cacheManager } from "@/shared/api/cacheManager";
import httpClient from "@/shared/api/httpClient";

const CACHE_TTL = 10000; // 10s TTL theo yêu cầu data dưới 10s

export const serviceOrderApi = {
  async getMine(config = {}) {
    const cacheKey = "service-orders:mine";
    if (!config.forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    const response = await httpClient.get("/service-orders/me", config);
    cacheManager.set(cacheKey, response.data, CACHE_TTL);

    return response.data;
  },

  async create(payload) {
    cacheManager.invalidate("service-orders");
    const response = await httpClient.post("/service-orders/me", payload);

    return response.data;
  },

  async remove(orderId) {
    cacheManager.invalidate("service-orders");
    const response = await httpClient.delete(`/service-orders/me/${orderId}`);

    return response.data;
  },

  async update(orderId, payload) {
    cacheManager.invalidate("service-orders");
    const response = await httpClient.patch(
      `/service-orders/me/${orderId}`,
      payload,
    );

    return response.data;
  },

  async updateAddress(orderId, addressId) {
    cacheManager.invalidate("service-orders");
    const response = await httpClient.patch(
      `/service-orders/me/${orderId}/address`,
      {
        addressId,
      },
    );

    return response.data;
  },

  async getAll(config = {}) {
    const cacheKey = "service-orders:all";
    if (!config.forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    const response = await httpClient.get("/service-orders", config);
    cacheManager.set(cacheKey, response.data, CACHE_TTL);

    return response.data;
  },

  async getById(orderId, config = {}) {
    const cacheKey = `service-orders:${orderId}`;
    if (!config.forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    const response = await httpClient.get(`/service-orders/${orderId}`, config);
    cacheManager.set(cacheKey, response.data, CACHE_TTL);

    return response.data;
  },

  async updateByAdmin(orderId, payload) {
    cacheManager.invalidate("service-orders");
    const response = await httpClient.patch(
      `/service-orders/${orderId}`,
      payload,
    );

    return response.data;
  },

  async removeByAdmin(orderId, config = {}) {
    cacheManager.invalidate("service-orders");
    await httpClient.delete(`/service-orders/${orderId}`, config);
  },
};
