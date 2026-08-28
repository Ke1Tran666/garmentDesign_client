import httpClient from "@/shared/api/httpClient";

export const serviceApi = {
  async getAll(config = {}) {
    const response = await httpClient.get(
      "/services",
      config,
    );

    return response.data;
  },
};
