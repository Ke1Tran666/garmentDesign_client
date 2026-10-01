import httpClient from "@/shared/api/httpClient";

export const serviceApi = {
  async getAll(config = {}) {
    const response = await httpClient.get("/services", config);

    return response.data;
  },

  async getById(serviceId, config = {}) {
    const response = await httpClient.get(`/services/${serviceId}`, config);

    return response.data;
  },

  async getAdminAll(config = {}) {
    const response = await httpClient.get("/admin/services", config);

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
    const response = await httpClient.post("/admin/services", payload, config);

    return response.data;
  },

  async update(serviceId, payload, config = {}) {
    const response = await httpClient.put(
      `/admin/services/${serviceId}`,
      payload,
      config,
    );

    return response.data;
  },

  async remove(serviceId, config = {}) {
    const response = await httpClient.delete(
      `/admin/services/${serviceId}`,
      config,
    );

    return response.data;
  },
};
