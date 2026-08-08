import httpClient from "./httpClient";

const ensureCsrf = async () => {
  await httpClient.get("/auth/csrf");
};

export const authApi = {
  async csrf() {
    const response =
      await httpClient.get("/auth/csrf");

    return response.data;
  },

  async me() {
    const response =
      await httpClient.get("/auth/me");

    if (response.status === 204) {
      return null;
    }

    return response.data;
  },

  async logout() {
    await ensureCsrf();

    const response =
      await httpClient.post("/auth/logout");

    return response.data;
  },

  async login(payload) {
    await ensureCsrf();

    const response =
      await httpClient.post(
        "/auth/login",
        payload,
      );

    return response.data;
  },

  async googleLogin(accessToken) {
    await ensureCsrf();

    const response =
      await httpClient.post(
        "/auth/google-login",
        {
          accessToken,
        },
      );

    return response.data;
  },

  async register(payload) {
    await ensureCsrf();

    const response =
      await httpClient.post(
        "/auth/register",
        payload,
      );

    return response.data;
  },

  async sendPhoneOtp(phone) {
    await ensureCsrf();

    const response =
      await httpClient.post(
        "/auth/send-otp",
        {
          phone,
        },
      );

    return response.data;
  },

  async verifyPhoneOtp(payload) {
    await ensureCsrf();

    const response =
      await httpClient.post(
        "/auth/verify-otp",
        payload,
      );

    return response.data;
  },

  async sendEmailOtp(email) {
    await ensureCsrf();

    const response =
      await httpClient.post(
        "/auth/send-email-otp",
        {
          email,
        },
      );

    return response.data;
  },

  async verifyEmailOtp(payload) {
    await ensureCsrf();

    const response =
      await httpClient.post(
        "/auth/verify-email-otp",
        payload,
      );

    return response.data;
  },

  async forgotPassword(email) {
    await ensureCsrf();

    const normalizedEmail =
      email.trim().toLowerCase();

    const response =
      await httpClient.post(
        "/auth/forgot-password",
        {
          email: normalizedEmail,
        },
      );

    return response.data;
  },

  async verifyForgotOtp(payload) {
    await ensureCsrf();

    const response =
      await httpClient.post(
        "/auth/verify-forgot-otp",
        {
          email:
            payload.email
              .trim()
              .toLowerCase(),
          otp: payload.otp,
        },
      );

    return response.data;
  },

  async resetPassword(payload) {
    await ensureCsrf();

    const response =
      await httpClient.post(
        "/auth/reset-password",
        {
          email:
            payload.email
              .trim()
              .toLowerCase(),
          newPassword:
            payload.newPassword,
        },
      );

    return response.data;
  },
};