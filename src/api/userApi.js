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
};