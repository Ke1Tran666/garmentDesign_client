import { cacheManager } from "@/shared/api/cacheManager";
import httpClient from "@/shared/api/httpClient";

const CACHE_TTL = 10000;

export const serviceApi = {
  async getAll(config = {}) {
    const cacheKey = "services:all";
    if (!config.forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    const response = await httpClient.get("/services", config);
    cacheManager.set(cacheKey, response.data, CACHE_TTL);

    return response.data;
  },

  async getById(serviceId, config = {}) {
    const response = await httpClient.get(`/services/${serviceId}`, config);

    return response.data;
  },

  async getAdminAll(config = {}) {
    const cacheKey = "services:admin:all";
    if (!config.forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    const response = await httpClient.get("/admin/services", config);
    cacheManager.set(cacheKey, response.data, CACHE_TTL);

    return response.data;
  },

  async getAdminById(serviceId, config = {}) {
    const response = await httpClient.get(
      `/admin/services/${serviceId}`,
      config,
    );

    return response.data;
  },

  async create(payload, config = {}) {
    cacheManager.invalidate("services");
    const response = await httpClient.post("/admin/services", payload, config);

    return response.data;
  },

  async update(serviceId, payload, config = {}) {
    cacheManager.invalidate("services");
    const response = await httpClient.put(
      `/admin/services/${serviceId}`,
      payload,
      config,
    );

    return response.data;
  },

  async remove(serviceId, config = {}) {
    cacheManager.invalidate("services");
    const response = await httpClient.delete(
      `/admin/services/${serviceId}`,
      config,
    );

    return response.data;
  },
};
