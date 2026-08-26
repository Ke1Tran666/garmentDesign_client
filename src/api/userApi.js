import httpClient from "./httpClient";

export const userApi = {
  async getMe(config = {}) {
    const response = await httpClient.get(
      "/users/me",
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

  async updateById(userId, payload) {
    const response = await httpClient.put(
      `/users/${userId}`,
      payload,
    );

    return response.data;
  },

  async uploadAvatarById(userId, file) {
    const formData = new FormData();

    formData.append("file", file);

    const response = await httpClient.put(
      `/users/${userId}/avatar`,
      formData,
    );

    return response.data;
  },

  async removeAvatarById(userId) {
    const response = await httpClient.delete(
      `/users/${userId}/avatar`,
    );

    return response.data;
  },

  async update(payload) {
    const response = await httpClient.put(
      "/users/me",
      payload,
    );

    return response.data;
  },

  async changePassword(payload) {
    const response = await httpClient.put(
      "/users/me/change-password",
      payload,
    );

    return response.data;
  },

  async removeAvatar() {
    const response = await httpClient.delete(
      "/users/me/avatar",
    );

    return response.data;
  },

  async uploadAvatar(formData) {
    const response = await httpClient.put(
      "/users/me/avatar",
      formData,
    );

    return response.data;
  },

  async exportData() {
    const response = await httpClient.get(
      "/users/me/export-data",
    );

    return response.data;
  },

  async deleteAccount() {
    const response = await httpClient.delete(
      "/users/me/delete-account",
    );

    return response.data;
  },

  async sendEmailVerificationOtp() {
    const response = await httpClient.post(
      "/auth/me/email/send-otp",
    );

    return response.data;
  },

  async verifyEmailVerificationOtp(otp) {
    const response = await httpClient.post(
      "/auth/me/email/verify-otp",
      { otp },
    );

    return response.data;
  },

  async removeEmailVerification() {
    const response = await httpClient.delete(
      "/auth/me/email/verification",
    );

    return response.data;
  },

  async deletePhone(providerId) {
    const response = await httpClient.delete(
      `/users/me/phone/${providerId}`,
    );

    return response.data;
  },
  async getAll(config = {}) {
    const response = await httpClient.get("/users", config);
    return response.data;
  },

  async create(payload) {
    const response = await httpClient.post("/users", payload);
    return response.data;
  },

  async remove(userId) {
    await httpClient.delete(`/users/${userId}`);
  },

  async updatePhoneById(userId, phone) {
    const response = await httpClient.put(
      `/users/${userId}/phone`,
      { phone },
    );

    return response.data;
  },
};