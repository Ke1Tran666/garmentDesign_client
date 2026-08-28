import httpClient from "@/shared/api/httpClient";

export const contactApi = {
  async send(payload) {
    const response = await httpClient.post(
      "/mail/contact",
      payload,
    );

    return response.data;
  },
};
