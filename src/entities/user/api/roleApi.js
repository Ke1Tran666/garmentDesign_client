import { cacheManager } from "@/shared/api/cacheManager";
import httpClient from "@/shared/api/httpClient";

const CACHE_TTL = 10000;

export const roleApi = {
  async getAll(config = {}) {
    const cacheKey = "roles:all";
    if (!config.forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    const requestConfig = { ...config };
    delete requestConfig.forceRefresh;

    const response = await httpClient.get("/roles", requestConfig);
    cacheManager.set(cacheKey, response.data, CACHE_TTL);

    return response.data;
  },

  async getById(roleId, config = {}) {
    const cacheKey = `roles:${roleId}`;
    if (!config.forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    const requestConfig = { ...config };
    delete requestConfig.forceRefresh;

    const response = await httpClient.get(`/roles/${roleId}`, requestConfig);
    cacheManager.set(cacheKey, response.data, CACHE_TTL);

    return response.data;
  },
};
