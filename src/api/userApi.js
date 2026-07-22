import httpClient from "./httpClient";

export const userApi = {
  async getMe(userId, config = {}) {
    const response = await httpClient.get(
      `/users/me/${userId}`,
      config,
    );

    return response.data;
  },

  async getById(userId, config = {}) {
    const response = await httpClient.get(
      `/users/${userId}`,
      config,
    );

    return response.data;
  },

  async update(userId, payload) {
    const response = await httpClient.put(
      `/users/${userId}`,
      payload,
    );

    return response.data;
  },

  async changePassword(userId, payload) {
    const response = await httpClient.put(
      `/users/me/${userId}/change-password`,
      payload,
    );

    return response.data;
  },

  async removeAvatar(userId) {
    const response = await httpClient.delete(
      `/users/me/${userId}/avatar`,
    );

    return response.data;
  },

  async uploadAvatar(userId, formData) {
    const response = await httpClient.put(
      `/users/me/${userId}/avatar`,
      formData,
    );

    return response.data;
  },

  async exportData(userId) {
    const response = await httpClient.get(
      `/users/me/${userId}/export-data`,
    );

    return response.data;
  },

  async deleteAccount(userId) {
    const response = await httpClient.delete(
      `/users/me/${userId}/delete-account`,
    );

    return response.data;
  },
};