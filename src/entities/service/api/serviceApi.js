import httpClient from "@/shared/api/httpClient";

export const serviceApi = {
  async getAll(config = {}) {
    const response = await httpClient.get("/services", config);
    return response.data;
  },

  async getById(serviceId, config = {}) {
    const response = await httpClient.get(
      `/services/${serviceId}`,
      config,
    );

    return response.data;
  },

  async create(payload, config = {}) {
    const response = await httpClient.post(
      "/services",
      payload,
      config,
    );

    return response.data;
  },

  async update(serviceId, payload, config = {}) {
    const response = await httpClient.put(
      `/services/${serviceId}`,
      payload,
      config,
    );

    return response.data;
  },

  async remove(serviceId, config = {}) {
    await httpClient.delete(
      `/services/${serviceId}`,
      config,
    );
  },
};