import httpClient from "./httpClient";

export const addressApi = {
  async getMine(config = {}) {
    const response = await httpClient.get(
      "/user-addresses/me",
      config,
    );

    return response.data;
  },

  async create(payload) {
    const response = await httpClient.post(
      "/user-addresses/me",
      payload,
    );

    return response.data;
  },

  async update(addressId, payload) {
    const response = await httpClient.put(
      `/user-addresses/me/${addressId}`,
      payload,
    );

    return response.data;
  },

  async remove(addressId) {
    const response = await httpClient.delete(
      `/user-addresses/me/${addressId}`,
    );

    return response.data;
  },

  async setDefault(addressId) {
    const response = await httpClient.put(
      `/user-addresses/me/default/${addressId}`,
    );

    return response.data;
  },
};