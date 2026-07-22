import httpClient from "./httpClient";

export const authProviderApi = {
  async remove(providerId) {
    const response = await httpClient.delete(
      `/user-auth-providers/${providerId}`,
    );

    return response.data;
  },
};