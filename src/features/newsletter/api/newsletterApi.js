import httpClient from "@/shared/api/httpClient";

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
