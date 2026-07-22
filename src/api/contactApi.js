import httpClient from "./httpClient";

export const contactApi = {
  async send(payload) {
    const response = await httpClient.post(
      "/mail/contact",
      payload,
    );

    return response.data;
  },
};