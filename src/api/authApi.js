import httpClient from "./httpClient";

export const authApi = {

  async csrf() {
    const response = await httpClient.get("/auth/csrf");

    return response.data;
  },

  async me() {
    const response = await httpClient.get("/auth/me");

    if (response.status === 204) {
      return null;
    }

    return response.data;
  },

  async logout() {
    const response = await httpClient.post("/auth/logout");

    return response.data;
  },

  async login(payload) {
    const response = await httpClient.post(
      "/auth/login",
      payload,
    );

    return response.data;
  },

  async googleLogin(accessToken) {
    const response = await httpClient.post(
      "/auth/google-login",
      {
        accessToken,
      },
    );

    return response.data;
  },

  async register(payload) {
    const response = await httpClient.post(
      "/auth/register",
      payload,
    );

    return response.data;
  },

  async sendPhoneOtp(phone) {
    const response = await httpClient.post(
      "/auth/send-otp",
      {
        phone,
      },
    );

    return response.data;
  },

  async verifyPhoneOtp(payload) {
    const response = await httpClient.post(
      "/auth/verify-otp",
      payload,
    );

    return response.data;
  },

  async sendEmailOtp(email) {
    const response = await httpClient.post(
      "/auth/send-email-otp",
      {
        email,
      },
    );

    return response.data;
  },

  async verifyEmailOtp(payload) {
    const response = await httpClient.post(
      "/auth/verify-email-otp",
      payload,
    );

    return response.data;
  },

  async forgotPassword(email) {
    const response = await httpClient.post(
      "/auth/forgot-password",
      {
        email,
      },
    );

    return response.data;
  },

  async verifyForgotOtp(payload) {
    const response = await httpClient.post(
      "/auth/verify-forgot-otp",
      payload,
    );

    return response.data;
  },

  async resetPassword(payload) {
    const response = await httpClient.post(
      "/auth/reset-password",
      payload,
    );

    return response.data;
  },
};