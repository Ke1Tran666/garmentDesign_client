import httpClient from "./httpClient";

export const newsletterApi = {
  async subscribe(email) {
    const response = await httpClient.post(
      "/newsletter/subscribe",
      {
        email,
      },
    );

    return response.data;
  },
};