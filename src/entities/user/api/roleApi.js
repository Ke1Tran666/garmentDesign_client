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

  async getPermissions(config = {}) {
    const cacheKey = "roles:permissions";
    if (!config.forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    const requestConfig = { ...config };
    delete requestConfig.forceRefresh;

    const response = await httpClient.get("/roles/permissions", requestConfig);
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

  async create(payload) {
    const response = await httpClient.post("/roles", payload);
    cacheManager.invalidate("roles");
    cacheManager.invalidate("users");

    return response.data;
  },

  async update(roleId, payload) {
    const response = await httpClient.put(`/roles/${roleId}`, payload);
    cacheManager.invalidate("roles");
    cacheManager.invalidate("users");

    return response.data;
  },

  async remove(roleId, replacementRoleId) {
    const hasReplacement =
      replacementRoleId !== undefined &&
      replacementRoleId !== null &&
      replacementRoleId !== "";

    if (hasReplacement) {
      await httpClient.delete(`/roles/${roleId}`, {
        params: { replacementRoleId },
      });
    } else {
      await httpClient.delete(`/roles/${roleId}`);
    }

    cacheManager.invalidate("roles");
    cacheManager.invalidate("users");
  },
};
