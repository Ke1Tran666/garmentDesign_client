import httpClient from "./httpClient";

export const roleApi = {
  async getAll(config = {}) {
    const response = await httpClient.get(
      "/roles",
      config,
    );

    return response.data;
  },

  async getById(roleId, config = {}) {
    const response = await httpClient.get(
      `/roles/${roleId}`,
      config,
    );

    return response.data;
  },
};