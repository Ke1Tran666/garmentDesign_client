import httpClient from "./httpClient";

export const addressApi = {
  async getByUser(userId, config = {}) {
    const response = await httpClient.get(
      `/user-addresses/user/${userId}`,
      config,
    );

    return response.data;
  },

  async create(userId, payload) {
    const response = await httpClient.post(
      `/user-addresses/user/${userId}`,
      payload,
    );

    return response.data;
  },

  async update(addressId, payload) {
    const response = await httpClient.put(
      `/user-addresses/${addressId}`,
      payload,
    );

    return response.data;
  },

  async remove(addressId) {
    const response = await httpClient.delete(
      `/user-addresses/${addressId}`,
    );

    return response.data;
  },

  async setDefault(userId, addressId) {
    const response = await httpClient.put(
      `/user-addresses/user/${userId}/default/${addressId}`,
    );

    return response.data;
  },
};